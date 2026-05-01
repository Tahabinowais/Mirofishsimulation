<template>
  <section>
    <div style="display:flex; align-items:baseline; gap:12px; margin-bottom: 12px;">
      <router-link to="/" class="btn secondary" style="text-decoration:none;">← Use cases</router-link>
      <span class="tag">project: {{ projectId }}</span>
      <span v-if="useCase" class="tag">use case: {{ useCase.title }}</span>
    </div>

    <div v-if="loading" class="empty"><span class="spinner"></span> Loading project…</div>
    <div v-else-if="error" class="empty">{{ error }}</div>
    <div v-else>
      <h1>{{ useCase.title }}</h1>
      <p class="lede">{{ useCase.description }}</p>

      <div class="panel">
        <h2>Configure simulation</h2>
        <UseCaseForm
          :use-case="useCase"
          :agents="agents"
          :running="running"
          @run="run"
        />
      </div>

      <div v-if="result">
        <SimulationResult :result="result" />
      </div>
      <div v-else class="panel empty">
        Configure inputs above and click "Run 3-year simulation" to see how OEMs, end-customer verticals,
        and materials suppliers respond.
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import UseCaseForm from '../components/UseCaseForm.vue'
import SimulationResult from '../components/SimulationResult.vue'
import { getUseCases, getAgents, simulate } from '../data/api.js'

const route = useRoute()
const projectId = route.params.projectId
const useCase = ref(null)
const agents = ref({})
const loading = ref(true)
const running = ref(false)
const error = ref(null)
const result = ref(null)

onMounted(async () => {
  try {
    const meta = JSON.parse(sessionStorage.getItem(projectId) || '{}')
    const [{ use_cases }, ag] = await Promise.all([getUseCases(), getAgents()])
    agents.value = ag
    useCase.value = use_cases.find(u => u.id === meta.use_case) || use_cases[0]
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

async function run(inputs) {
  running.value = true
  result.value = null
  try {
    result.value = await simulate(useCase.value.id, inputs)
  } catch (e) {
    error.value = e.message
  } finally {
    running.value = false
  }
}
</script>
