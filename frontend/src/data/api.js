// API layer. When VITE_USE_STATIC=1 (the GitHub Pages build) we resolve
// against embedded data + JS scenario engine. Otherwise we call the FastAPI
// backend at /api/* (local Docker / native dev).

import { AGENTS, USE_CASES } from './static-data.js'
import { runSimulation } from './simulation.js'

const STATIC = import.meta.env.VITE_USE_STATIC === '1'
const BASE = import.meta.env.VITE_API_BASE || ''

export async function getUseCases() {
  if (STATIC) return { use_cases: USE_CASES }
  const r = await fetch(`${BASE}/api/use-cases`)
  if (!r.ok) throw new Error('Failed to load use cases')
  return r.json()
}

export async function getAgents() {
  if (STATIC) return AGENTS
  const r = await fetch(`${BASE}/api/agents`)
  if (!r.ok) throw new Error('Failed to load agents')
  return r.json()
}

export async function simulate(use_case, inputs) {
  if (STATIC) {
    return new Promise(resolve => setTimeout(() => resolve(runSimulation(use_case, inputs)), 250))
  }
  const r = await fetch(`${BASE}/api/simulate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ use_case, inputs })
  })
  if (!r.ok) throw new Error('Simulation failed')
  return r.json()
}
