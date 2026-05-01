<template>
  <section class="landing">
    <h1>Ask anything about additive manufacturing</h1>
    <p class="lede">
      Type a question or scenario. The simulator builds a knowledge graph of OEMs, end-customer
      verticals, materials suppliers, and technologies — then runs a 3-year strategic simulation
      across the relevant agents.
    </p>

    <div class="ask-card">
      <textarea
        v-model="question"
        rows="3"
        placeholder="e.g. What happens to Stratasys if HP cuts MJF prices 20% in dental?"
        @keydown.ctrl.enter="submit"
        @keydown.meta.enter="submit"
      ></textarea>
      <div class="ask-row">
        <span class="hint">⌘/Ctrl + Enter to run</span>
        <button class="btn" :disabled="!question.trim()" @click="submit">Generate analysis →</button>
      </div>
    </div>

    <div class="examples">
      <div class="examples-title">Example prompts</div>
      <div class="example-grid">
        <button v-for="ex in examples" :key="ex" class="example" @click="question = ex; submit()">
          {{ ex }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const question = ref('')

const examples = [
  "What happens to Stratasys if HP cuts MJF prices 20% in dental?",
  "Pressure-test a value prop: 35% cheaper Ti aerospace brackets via multi-laser LPBF",
  "How does the industrial AM market evolve over 3 years if US-China tariffs escalate?",
  "What if Ti feedstock spikes 40% — how do aerospace primes respond?",
  "Simulate Desktop Metal acquiring a polymer OEM",
  "FDA accelerated approval pathway for orthopedic implants — who wins?",
  "Bambu Lab pushes into industrial polymer — credible threat to Stratasys?",
  "Reshoring mandate hits automotive — does AM share grow or shrink?"
]

function submit() {
  const q = question.value.trim()
  if (!q) return
  const id = `proj_${Math.random().toString(36).slice(2, 14)}`
  sessionStorage.setItem(id, JSON.stringify({ question: q }))
  router.push(`/console/process/${id}`)
}
</script>
