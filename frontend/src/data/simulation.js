// Client-side port of backend/app/core/simulation.py. Deterministic — picks the
// default branch for a use case, applies parametric overlays from user inputs,
// returns the result the SimulationResult component expects.

import { AGENTS, SCENARIOS } from './static-data.js'

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
