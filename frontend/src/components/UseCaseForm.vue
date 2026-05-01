<template>
  <div>
    <div class="row">
      <div class="col" v-for="field in useCase.inputs" :key="field.key">
        <div class="field">
          <label>{{ field.label }}<span v-if="field.required" style="color:var(--bad)"> *</span></label>

          <select v-if="field.type === 'select' && field.source"
                  v-model="model[field.key]">
            <option value="" disabled>Select…</option>
            <option v-for="opt in agentOptions(field.source)"
                    :key="opt.id" :value="opt.id">{{ opt.name }}</option>
          </select>

          <select v-else-if="field.type === 'select'" v-model="model[field.key]">
            <option value="" disabled>Select…</option>
            <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <textarea v-else-if="field.type === 'textarea'"
                    v-model="model[field.key]"
                    :placeholder="field.placeholder || ''"></textarea>

          <div v-else-if="field.type === 'multiselect' && field.source" class="checkbox-group">
            <label v-for="opt in agentOptions(field.source)" :key="opt.id">
              <input type="checkbox" :value="opt.id" v-model="model[field.key]" />
              {{ opt.name }}
            </label>
          </div>

          <div v-else-if="field.type === 'slider'">
            <input type="range" :min="field.min" :max="field.max" v-model.number="model[field.key]" />
            <div class="hint">Value: <strong>{{ model[field.key] }}</strong></div>
          </div>

          <input v-else type="text" v-model="model[field.key]" />
        </div>
      </div>
    </div>

    <div style="display:flex; gap:10px; margin-top:8px;">
      <button class="btn" :disabled="!isValid || running" @click="$emit('run', model)">
        <span v-if="running" class="spinner"></span>
        {{ running ? 'Simulating…' : 'Run 3-year simulation' }}
      </button>
      <button class="btn secondary" @click="reset">Reset inputs</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  useCase: { type: Object, required: true },
  agents: { type: Object, required: true },
  running: { type: Boolean, default: false }
})
defineEmits(['run'])

function defaults() {
  const m = {}
  for (const f of props.useCase.inputs) {
    if (f.type === 'multiselect') m[f.key] = []
    else if (f.type === 'slider') m[f.key] = f.default ?? f.min ?? 0
    else m[f.key] = ''
  }
  return m
}

const model = reactive(defaults())

function reset() {
  Object.assign(model, defaults())
}

watch(() => props.useCase.id, () => {
  Object.keys(model).forEach(k => delete model[k])
  Object.assign(model, defaults())
})

function agentOptions(source) {
  const bucket = props.agents[source] || []
  return bucket.map(a => ({ id: a.id, name: a.name }))
}

const isValid = computed(() => {
  for (const f of props.useCase.inputs) {
    if (!f.required) continue
    const v = model[f.key]
    if (v === '' || v === null || v === undefined) return false
    if (Array.isArray(v) && v.length === 0) return false
  }
  return true
})
</script>
