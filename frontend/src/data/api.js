const BASE = import.meta.env.VITE_API_BASE || ''

export async function getUseCases() {
  const r = await fetch(`${BASE}/api/use-cases`)
  if (!r.ok) throw new Error('Failed to load use cases')
  return r.json()
}

export async function getAgents() {
  const r = await fetch(`${BASE}/api/agents`)
  if (!r.ok) throw new Error('Failed to load agents')
  return r.json()
}

export async function simulate(use_case, inputs) {
  const r = await fetch(`${BASE}/api/simulate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ use_case, inputs })
  })
  if (!r.ok) throw new Error('Simulation failed')
  return r.json()
}
