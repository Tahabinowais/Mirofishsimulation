// Client-side scenario engine + free-text question router.

import { AGENTS, SCENARIOS, USE_CASES, AM_GRAPH } from './static-data.js'

function capexDirectional(cycle) {
  return ({
    'Recession': 'down 6-10%',
    'Flat': 'sideways',
    'Expansion (Recommended)': 'up 8-12%',
    'Boom': 'up 15-22%'
  })[cycle] || 'sideways'
}

function formatStrings(obj, ctx) {
  if (typeof obj === 'string') {
    return obj.replace(/\{(\w+)\}/g, (m, k) => (ctx[k] !== undefined ? ctx[k] : m))
  }
  if (Array.isArray(obj)) return obj.map(x => formatStrings(x, ctx))
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) out[k] = formatStrings(v, ctx)
    return out
  }
  return obj
}

function agentLookup(id) {
  for (const bucket of Object.values(AGENTS)) {
    for (const a of bucket) if (a.id === id) return a
  }
  return null
}

export function runSimulation(useCase, inputs) {
  const bucket = SCENARIOS[useCase]
  if (!bucket) throw new Error(`Unknown use case: ${useCase}`)

  const branch = bucket.default
  const ctx = { ...inputs }

  if (useCase === 'competitive_activity') {
    const actor = agentLookup(ctx.actor) || { name: ctx.actor || 'Unknown' }
    ctx.actor = actor.name
    ctx.move = ctx.move || 'strategic move'
    ctx.segment = ctx.segment || 'industrial AM'
  } else if (useCase === 'value_proposition') {
    const verts = Array.isArray(ctx.target_verticals) ? ctx.target_verticals : []
    ctx.n_verticals = verts.length
    ctx.hot = 'throughput-driven verticals'
    ctx.cold = 'qualification-first verticals'
  } else if (useCase === 'industrial_market') {
    ctx.capex_directional = capexDirectional(ctx.capex_cycle || 'Flat')
    ctx.ai_design_adoption = ctx.ai_design_adoption ?? 40
    ctx.consolidation = ctx.consolidation ?? 50
    ctx.tariff_regime = ctx.tariff_regime || 'Status quo'
    ctx.capex_cycle = ctx.capex_cycle || 'Flat'
  } else if (useCase === 'demand_shift') {
    const vert = agentLookup(ctx.vertical) || { name: ctx.vertical }
    ctx.vertical = vert.name || ctx.vertical
    ctx.shock = ctx.shock || 'demand shock'
    ctx.magnitude = ctx.magnitude ?? 3
    ctx.duration_quarters = ctx.duration_quarters ?? 6
    ctx.realloc_pct = 4 + Number(ctx.magnitude || 3) * 3
  }

  const rendered = formatStrings(branch, ctx)
  rendered.use_case = useCase
  rendered.inputs_echo = inputs
  return rendered
}

// Map a free-text AM question to one of the 4 use cases via keyword scoring,
// then synthesize plausible inputs from the question for the scenario engine.
const KEYWORDS = {
  competitive_activity: [
    'compete', 'competitor', 'rival', 'm&a', 'merger', 'acquire', 'acquisition',
    'price cut', 'pricing', 'launch', 'release', 'response', 'react'
  ],
  value_proposition: [
    'value prop', 'positioning', 'pitch', 'sell', 'offer', 'message', 'narrative',
    'win deal', 'land customer', 'differentiate', 'objection'
  ],
  industrial_market: [
    'market', 'tam', 'macro', 'tariff', 'trade', 'capex', 'consolidat',
    'industry', 'forecast', 'growth', 'size', 'share', 'global'
  ],
  demand_shift: [
    'demand', 'shock', 'shift', 'feedstock', 'shortage', 'spike', 'reshore',
    'regulation', 'fda', 'faa', 'mandate', 'tariff impact', 'titanium', 'nickel'
  ]
}

export function detectUseCase(question) {
  const q = (question || '').toLowerCase()
  let best = 'industrial_market'
  let bestScore = 0
  for (const [uc, words] of Object.entries(KEYWORDS)) {
    let s = 0
    for (const w of words) if (q.includes(w)) s += 1
    if (s > bestScore) { bestScore = s; best = uc }
  }
  return best
}

function pickEntity(question, bucketKey) {
  const q = question.toLowerCase()
  for (const a of (AGENTS[bucketKey] || [])) {
    if (q.includes(a.name.toLowerCase())) return a.id
    if (q.includes(a.id.replace('_', ' '))) return a.id
  }
  return null
}

export function defaultInputsFor(useCase, question) {
  const q = (question || '').toLowerCase()
  if (useCase === 'competitive_activity') {
    const actor = pickEntity(question, 'oems') || 'hp'
    let move = 'Major product launch'
    if (q.includes('price') || q.includes('cut')) move = 'Aggressive price cut (-20%)'
    else if (q.includes('m&a') || q.includes('acqui') || q.includes('merger')) move = 'M&A acquisition'
    else if (q.includes('vertical') || q.includes('integrat')) move = 'Vertical integration into materials'
    let segment = 'Polymer industrial'
    if (q.includes('metal') || q.includes('titanium') || q.includes('nickel') || q.includes('ti ') || q.includes('ni ')) segment = 'Metal industrial'
    else if (q.includes('service') || q.includes('bureau') || q.includes('on-demand')) segment = 'Service bureau / on-demand'
    return { actor, move, segment, intensity: 3 }
  }
  if (useCase === 'value_proposition') {
    let tech = 'Metal LPBF'
    if (q.includes('binder')) tech = 'Metal binder jetting'
    else if (q.includes('mjf') || q.includes('sls')) tech = 'Polymer SLS/MJF'
    else if (q.includes('sla') || q.includes('dls') || q.includes('resin')) tech = 'Polymer SLA/DLS'
    else if (q.includes('bureau') || q.includes('on-demand')) tech = 'Service-bureau network'
    const verts = []
    for (const v of (AGENTS.end_customers || [])) {
      if (q.includes(v.name.toLowerCase().split(' ')[0])) verts.push(v.id)
    }
    if (verts.length === 0) verts.push('aerospace_primes', 'aerospace_newspace')
    let premium = 0
    const m = q.match(/([+-]?\d+)\s*%/)
    if (m) premium = Math.max(-50, Math.min(100, parseInt(m[1], 10)))
    return { value_prop: question, tech, target_verticals: verts, price_premium: premium }
  }
  if (useCase === 'industrial_market') {
    let tariff = 'Status quo'
    if (q.includes('us-china') || q.includes('china tariff') || q.includes('tariff esc')) tariff = 'US-China tariffs escalate'
    else if (q.includes('cbam') || q.includes('eu tariff')) tariff = 'EU CBAM expands'
    else if (q.includes('de-escalat') || q.includes('peace')) tariff = 'Global de-escalation'
    let capex = 'Expansion (Recommended)'
    if (q.includes('recession')) capex = 'Recession'
    else if (q.includes('boom')) capex = 'Boom'
    else if (q.includes('flat')) capex = 'Flat'
    const ai = q.includes('ai') || q.includes('generative') ? 70 : 40
    const cons = q.includes('consolidat') || q.includes('m&a') ? 75 : 50
    return { tariff_regime: tariff, capex_cycle: capex, ai_design_adoption: ai, consolidation: cons }
  }
  if (useCase === 'demand_shift') {
    let vert = pickEntity(question, 'end_customers')
    if (!vert) {
      if (q.includes('aerospace') || q.includes('boeing') || q.includes('airbus')) vert = 'aerospace_primes'
      else if (q.includes('space') || q.includes('spacex') || q.includes('rocket')) vert = 'aerospace_newspace'
      else if (q.includes('medical') || q.includes('implant') || q.includes('orthop')) vert = 'medical_orthopedic'
      else if (q.includes('dental')) vert = 'dental_labs'
      else if (q.includes('auto')) vert = 'automotive_oem'
      else if (q.includes('energy') || q.includes('oil')) vert = 'energy_oil_gas'
      else vert = 'aerospace_primes'
    }
    let shock = 'AI-driven design freeing geometry'
    if (q.includes('faa') || q.includes('fda') || q.includes('approval') || q.includes('regulation')) shock = 'FAA/FDA accelerated approval pathway'
    else if (q.includes('reshor')) shock = 'Reshoring mandate'
    else if (q.includes('feedstock') || q.includes('titanium') || q.includes('nickel') || q.includes('spike')) shock = 'Ti or Ni feedstock spike (+40%)'
    else if (q.includes('outsourc')) shock = 'Major end-customer outsourcing wave'
    let mag = 3
    if (q.includes('major') || q.includes('massive') || q.includes('huge')) mag = 5
    else if (q.includes('minor') || q.includes('small')) mag = 2
    return { vertical: vert, shock, magnitude: mag, duration_quarters: 6 }
  }
  return {}
}

// Subset the AM graph to entities relevant to the question + chosen use case.
// Used to highlight nodes / animate the build pipeline.
export function relevantSubgraph(useCase, inputs, question) {
  const q = (question || '').toLowerCase()
  const inputVals = Object.values(inputs || {}).flat().filter(v => typeof v === 'string').map(v => v.toLowerCase())
  const score = (n) => {
    let s = 0
    if (q.includes(n.label.toLowerCase())) s += 2
    if (q.includes(n.id.replace('_', ' '))) s += 1
    for (const v of inputVals) if (v && (v.includes(n.id) || n.label.toLowerCase().includes(v))) s += 2
    if (useCase === 'competitive_activity' && (n.type === 'OEM' || n.type === 'Technology')) s += 0.5
    if (useCase === 'value_proposition' && (n.type === 'EndCustomer' || n.type === 'Vertical')) s += 0.5
    if (useCase === 'industrial_market' && (n.type === 'OEM' || n.type === 'MaterialsSupplier' || n.type === 'Analyst')) s += 0.4
    if (useCase === 'demand_shift' && (n.type === 'Vertical' || n.type === 'EndCustomer' || n.type === 'Regulator')) s += 0.5
    return s
  }
  const ranked = AM_GRAPH.nodes.map(n => ({ ...n, _score: score(n) })).sort((a, b) => b._score - a._score)
  const top = new Set(ranked.slice(0, Math.min(28, ranked.length)).map(n => n.id))
  return {
    nodes: AM_GRAPH.nodes.filter(n => top.has(n.id)),
    edges: AM_GRAPH.edges.filter(e => top.has(e.source) && top.has(e.target))
  }
}

export function fullGraph() {
  return AM_GRAPH
}

export function useCases() {
  return USE_CASES
}
