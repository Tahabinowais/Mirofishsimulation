<template>
  <div class="graph-wrap" ref="wrap">
    <div class="graph-toolbar">
      <span class="graph-title">Graph Relationship Visualization</span>
      <label class="toggle">
        <input type="checkbox" v-model="showLabels" />
        Show edge labels
      </label>
    </div>

    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="graph-svg"
      @mousemove="onMove"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
      <g>
        <line
          v-for="(e, i) in renderedEdges"
          :key="'e'+i"
          :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
          class="edge"
          :class="{ active: highlight && (e.source === highlight || e.target === highlight) }"
        />
      </g>
      <g v-if="showLabels">
        <text
          v-for="(e, i) in renderedEdges"
          :key="'el'+i"
          :x="(e.x1 + e.x2) / 2"
          :y="(e.y1 + e.y2) / 2"
          class="edge-label"
        >{{ e.type }}</text>
      </g>
      <g>
        <g
          v-for="n in nodes"
          :key="n.id"
          :transform="`translate(${n.x},${n.y})`"
          @mousedown.prevent="startDrag(n, $event)"
          @mouseenter="highlight = n.id"
          @mouseleave="highlight = null"
          class="node-g"
        >
          <circle
            :r="highlight === n.id ? 9 : 7"
            :fill="colorFor(n.type)"
            :class="{ dim: highlight && highlight !== n.id && !neighbors.has(n.id) }"
          />
          <text :y="-12" class="node-label" text-anchor="middle">{{ n.label }}</text>
        </g>
      </g>
    </svg>

    <div class="legend">
      <div class="legend-title">Entity types</div>
      <div class="legend-row">
        <span v-for="t in entityTypes" :key="t.id" class="legend-item">
          <span class="dot" :style="{ background: t.color }"></span>{{ t.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
  entityTypes: { type: Array, required: true },
  width: { type: Number, default: 760 },
  height: { type: Number, default: 540 }
})

const showLabels = ref(false)
const highlight = ref(null)
const dragging = ref(null)
const wrap = ref(null)

const colorMap = computed(() => {
  const m = {}
  for (const t of props.entityTypes) m[t.id] = t.color
  return m
})
function colorFor(type) { return colorMap.value[type] || '#888' }

// Initialize positions on input change
const nodesRef = computed(() => props.nodes)
let raf = null

function init() {
  const cx = props.width / 2, cy = props.height / 2
  const r = Math.min(props.width, props.height) * 0.35
  props.nodes.forEach((n, i) => {
    if (n.x == null) {
      const a = (i / props.nodes.length) * Math.PI * 2
      n.x = cx + r * Math.cos(a) + (Math.random() - 0.5) * 30
      n.y = cy + r * Math.sin(a) + (Math.random() - 0.5) * 30
      n.vx = 0; n.vy = 0
    }
  })
}

function tick() {
  const REPULSE = 1400
  const SPRING = 0.04
  const SPRING_LEN = 90
  const CENTER = 0.005
  const DAMPING = 0.85
  const cx = props.width / 2, cy = props.height / 2

  const ns = props.nodes
  for (let i = 0; i < ns.length; i++) {
    const a = ns[i]
    if (a === dragging.value) continue
    a.fx = 0; a.fy = 0
    for (let j = 0; j < ns.length; j++) {
      if (i === j) continue
      const b = ns[j]
      let dx = a.x - b.x, dy = a.y - b.y
      let d2 = dx * dx + dy * dy + 0.01
      const f = REPULSE / d2
      const d = Math.sqrt(d2)
      a.fx += (dx / d) * f
      a.fy += (dy / d) * f
    }
    a.fx += (cx - a.x) * CENTER
    a.fy += (cy - a.y) * CENTER
  }
  for (const e of props.edges) {
    const a = ns.find(n => n.id === e.source)
    const b = ns.find(n => n.id === e.target)
    if (!a || !b) continue
    const dx = b.x - a.x, dy = b.y - a.y
    const d = Math.sqrt(dx * dx + dy * dy) + 0.01
    const diff = d - SPRING_LEN
    const fx = (dx / d) * diff * SPRING
    const fy = (dy / d) * diff * SPRING
    if (a !== dragging.value) { a.fx += fx; a.fy += fy }
    if (b !== dragging.value) { b.fx -= fx; b.fy -= fy }
  }
  for (const a of ns) {
    if (a === dragging.value) continue
    a.vx = (a.vx + a.fx) * DAMPING
    a.vy = (a.vy + a.fy) * DAMPING
    a.x += a.vx
    a.y += a.vy
    const pad = 20
    if (a.x < pad) a.x = pad
    if (a.x > props.width - pad) a.x = props.width - pad
    if (a.y < pad) a.y = pad
    if (a.y > props.height - pad) a.y = props.height - pad
  }
}

function loop() {
  tick()
  raf = requestAnimationFrame(loop)
}

watch(nodesRef, () => {
  init()
  if (!raf) loop()
}, { immediate: true, flush: 'post' })

onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf) })

const renderedEdges = computed(() => {
  const map = new Map(props.nodes.map(n => [n.id, n]))
  return props.edges.map(e => {
    const a = map.get(e.source), b = map.get(e.target)
    if (!a || !b) return null
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y, type: e.type, source: e.source, target: e.target }
  }).filter(Boolean)
})

const neighbors = computed(() => {
  const set = new Set()
  if (!highlight.value) return set
  for (const e of props.edges) {
    if (e.source === highlight.value) set.add(e.target)
    if (e.target === highlight.value) set.add(e.source)
  }
  return set
})

function startDrag(n, ev) {
  dragging.value = n
  n.vx = 0; n.vy = 0
}
function endDrag() { dragging.value = null }
function onMove(ev) {
  if (!dragging.value || !wrap.value) return
  const svg = wrap.value.querySelector('svg')
  const rect = svg.getBoundingClientRect()
  const x = (ev.clientX - rect.left) * (props.width / rect.width)
  const y = (ev.clientY - rect.top) * (props.height / rect.height)
  dragging.value.x = x
  dragging.value.y = y
}
</script>
