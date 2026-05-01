<template>
  <section class="console-view">
    <div class="console-head">
      <router-link to="/" class="btn secondary" style="text-decoration:none;">← New question</router-link>
      <span class="tag">project: {{ projectId }}</span>
      <span class="tag">use case: {{ useCaseLabel }}</span>
    </div>

    <p class="question-echo">"{{ question }}"</p>

    <div class="split">
      <div class="split-left">
        <Graph
          :nodes="subgraph.nodes"
          :edges="subgraph.edges"
          :entity-types="entityTypes"
          :width="780"
          :height="560"
        />
      </div>
      <div class="split-right">
        <BuildPipeline
          :project-id="projectId"
          :entity-types="entityTypes"
          :relation-types="relationTypes"
          :total-nodes="subgraph.nodes.length"
          :total-edges="subgraph.edges.length"
          :use-case-label="useCaseLabel"
          @done="onBuildDone"
        />
      </div>
    </div>

    <div v-if="result">
      <SimulationResult :result="result" />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Graph from '../components/Graph.vue'
import BuildPipeline from '../components/BuildPipeline.vue'
import SimulationResult from '../components/SimulationResult.vue'
import { detectUseCase, defaultInputsFor, relevantSubgraph, fullGraph, useCases } from '../data/simulation.js'
import { simulate } from '../data/api.js'

const route = useRoute()
const projectId = route.params.projectId
const meta = JSON.parse(sessionStorage.getItem(projectId) || '{}')
const question = ref(meta.question || 'How is the industrial additive manufacturing market evolving?')

const useCaseId = computed(() => detectUseCase(question.value))
const useCaseLabel = computed(() => {
  const uc = useCases().find(u => u.id === useCaseId.value)
  return uc ? uc.title : useCaseId.value
})
const inputs = computed(() => defaultInputsFor(useCaseId.value, question.value))

const graph = fullGraph()
const entityTypes = graph.entity_types
const relationTypes = graph.relation_types

const subgraph = computed(() => relevantSubgraph(useCaseId.value, inputs.value, question.value))

const result = ref(null)
async function onBuildDone() {
  result.value = await simulate(useCaseId.value, inputs.value)
}
</script>
