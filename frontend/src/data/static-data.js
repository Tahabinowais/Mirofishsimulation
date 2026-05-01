// Embedded simulation data — mirror of backend/app/data/*.json so the SPA can
// run with no backend (GitHub Pages, any static host). Vite resolves these
// imports at build time, freezing the data into the bundle.

import agents from '../../../backend/app/data/agents.json'
import useCasesDoc from '../../../backend/app/data/use_cases.json'
import scenarios from '../../../backend/app/data/scenarios.json'

export const AGENTS = agents
export const USE_CASES = useCasesDoc.use_cases
export const SCENARIOS = scenarios
