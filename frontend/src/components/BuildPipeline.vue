<template>
  <div class="pipeline">
    <div class="pipe-card" :class="cardClass(0)">
      <div class="pipe-head">
        <span class="pipe-num">01</span>
        <span class="pipe-title">Ontology Generation</span>
        <span class="pipe-status" :class="badgeClass(0)">{{ stages[0] === 'done' ? 'BUILD COMPLETE' : (stages[0] === 'active' ? 'IN PROGRESS' : 'PENDING') }}</span>
      </div>
      <div class="pipe-route">POST /api/graph/ontology/generate</div>
      <p class="pipe-desc">
        LLM analyzes the question, extracts simulation requirements, and generates an
        appropriate AM-industry ontology.
      </p>
      <div v-if="stages[0] !== 'pending'">
        <div class="chip-group-label">GENERATED ENTITY TYPES</div>
        <div class="chips">
          <span v-for="t in entityTypes" :key="t.id" class="chip" :style="{ borderColor: t.color }">{{ t.label }}</span>
        </div>
        <div class="chip-group-label">GENERATED RELATION TYPES</div>
        <div class="chips">
          <span v-for="r in relationTypes" :key="r" class="chip">{{ r }}</span>
        </div>
      </div>
    </div>

    <div class="pipe-card" :class="cardClass(1)">
      <div class="pipe-head">
        <span class="pipe-num">02</span>
        <span class="pipe-title">GraphRAG Build</span>
        <span class="pipe-status" :class="badgeClass(1)">
          {{ stages[1] === 'done' ? 'BUILD COMPLETE' : (stages[1] === 'active' ? buildPct + '%' : 'PENDING') }}
        </span>
      </div>
      <div class="pipe-route">POST /api/graph/build</div>
      <p class="pipe-desc">
        Based on the generated ontology, chunks the AM corpus and builds a knowledge graph,
        extracting entities and relations.
      </p>
      <div v-if="stages[1] !== 'pending'" class="kpis kpis-pipe">
        <div class="kpi"><div class="value">{{ animatedNodes }}</div><div class="label">ENTITY NODES</div></div>
        <div class="kpi"><div class="value">{{ animatedEdges }}</div><div class="label">RELATION EDGES</div></div>
        <div class="kpi"><div class="value">{{ entityTypes.length }}</div><div class="label">SCHEMA TYPES</div></div>
      </div>
    </div>

    <div class="pipe-card" :class="cardClass(2)">
      <div class="pipe-head">
        <span class="pipe-num">03</span>
        <span class="pipe-title">Simulation Run</span>
        <span class="pipe-status" :class="badgeClass(2)">{{ stages[2] === 'done' ? 'RESULT READY' : (stages[2] === 'active' ? 'RUNNING' : 'PENDING') }}</span>
      </div>
      <div class="pipe-route">POST /api/simulation/run</div>
      <p class="pipe-desc">
        Routes the question to the matching scenario and runs the 3-year simulation across
        the relevant agents.
      </p>
      <div v-if="stages[2] !== 'pending'" class="route-row">
        <span class="tag">use case: {{ useCaseLabel }}</span>
      </div>
    </div>

    <div class="dashboard">
      <div class="dash-head">
        <span class="dash-title">SYSTEM DASHBOARD</span>
        <span class="dash-id">{{ projectId }}</span>
      </div>
      <div class="dash-log">
        <div v-for="(line, i) in log" :key="i">
          <span class="ts">{{ line.t }}</span>
          <span class="msg">{{ line.m }}</span>
        </div>
        <div v-if="!complete" class="dash-cursor">▌</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  projectId: { type: String, required: true },
  entityTypes: { type: Array, required: true },
  relationTypes: { type: Array, required: true },
  totalNodes: { type: Number, required: true },
  totalEdges: { type: Number, required: true },
  useCaseLabel: { type: String, required: true }
})
const emit = defineEmits(['done'])

const stages = ref(['pending', 'pending', 'pending'])
const buildPct = ref(0)
const animatedNodes = ref(0)
const animatedEdges = ref(0)
const log = ref([])
const complete = ref(false)

function ts() {
  const d = new Date()
  const pad = (n, w = 2) => String(n).padStart(w, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}
function pushLog(m) { log.value.push({ t: ts(), m }) }

function cardClass(i) {
  if (stages.value[i] === 'done') return 'done'
  if (stages.value[i] === 'active') return 'active'
  return ''
}
function badgeClass(i) {
  if (stages.value[i] === 'done') return 'badge-done'
  if (stages.value[i] === 'active') return 'badge-active'
  return 'badge-pending'
}

let runId = 0
async function run() {
  const myRun = ++runId
  stages.value = ['pending', 'pending', 'pending']
  buildPct.value = 0
  animatedNodes.value = 0
  animatedEdges.value = 0
  log.value = []
  complete.value = false

  pushLog(`Project ${props.projectId} initialized`)
  pushLog('Starting ontology generation...')
  stages.value = ['active', 'pending', 'pending']
  await sleep(900)
  if (myRun !== runId) return
  pushLog(`Ontology: ${props.entityTypes.length} entity types, ${props.relationTypes.length} relation types`)
  stages.value = ['done', 'active', 'pending']

  pushLog('Graph build task started... task_graph_' + Math.floor(Math.random() * 1e10))
  // Animate counter
  const total = props.totalNodes
  const totalE = props.totalEdges
  const steps = 22
  for (let s = 1; s <= steps; s++) {
    if (myRun !== runId) return
    await sleep(60)
    buildPct.value = Math.round((s / steps) * 100)
    animatedNodes.value = Math.round((s / steps) * total)
    animatedEdges.value = Math.round((s / steps) * totalE)
    if (s % 5 === 0) pushLog(`Graph refreshed: ${animatedNodes.value} nodes, ${animatedEdges.value} edges`)
  }
  pushLog(`Graph build complete: ${total} nodes, ${totalE} edges`)
  stages.value = ['done', 'done', 'active']

  pushLog(`Routing question to use case: ${props.useCaseLabel}`)
  await sleep(450)
  if (myRun !== runId) return
  pushLog('Running 3-year scenario...')
  await sleep(550)
  if (myRun !== runId) return
  pushLog('Result ready.')
  stages.value = ['done', 'done', 'done']
  complete.value = true
  emit('done')
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

onMounted(run)
watch(() => props.projectId, run)
</script>
