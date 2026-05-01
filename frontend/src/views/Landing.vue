<template>
  <section>
    <h1>Industrial Additive Manufacturing — Multi-Agent Simulator</h1>
    <p class="lede">
      Pick a use case. Configure the inputs. Run a 3-year strategic simulation across metal AM,
      polymer AM, and service-bureau segments — with OEMs, end-customer verticals, and materials suppliers
      reacting in turn.
    </p>

    <div v-if="loading" class="empty"><span class="spinner"></span> Loading use cases…</div>
    <div v-else-if="error" class="empty">Couldn't load use cases: {{ error }}</div>

    <div v-else class="cards">
      <div v-for="uc in useCases" :key="uc.id" class="card" @click="open(uc)">
        <div class="icon">◆</div>
        <h2>{{ uc.title }}</h2>
        <div class="sub">{{ uc.subtitle }}</div>
        <p style="margin-top:10px; font-size:13px; color: var(--text);">{{ uc.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUseCases } from '../data/api.js'

const router = useRouter()
const useCases = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const data = await getUseCases()
    useCases.value = data.use_cases
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function open(uc) {
  const id = `proj_${uc.id}_${Math.random().toString(36).slice(2, 10)}`
  sessionStorage.setItem(id, JSON.stringify({ use_case: uc.id }))
  router.push(`/console/process/${id}`)
}
</script>
