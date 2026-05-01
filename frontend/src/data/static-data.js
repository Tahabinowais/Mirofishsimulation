// Embedded simulation + graph data — mirrors backend/app/data/*.json plus
// the AM knowledge graph, so the SPA runs with no backend.

import agents from '../../../backend/app/data/agents.json'
import useCasesDoc from '../../../backend/app/data/use_cases.json'
import scenarios from '../../../backend/app/data/scenarios.json'
import amGraph from './am_graph.json'

export const AGENTS = agents
export const USE_CASES = useCasesDoc.use_cases
export const SCENARIOS = scenarios
export const AM_GRAPH = amGraph
