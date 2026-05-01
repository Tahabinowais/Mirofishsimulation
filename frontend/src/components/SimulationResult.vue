<template>
  <div>
    <div class="panel">
      <div class="headline">{{ result.headline }}</div>
      <p style="color:var(--text-dim); margin:0;">{{ result.summary }}</p>
    </div>

    <div v-for="key in ['year_1','year_2','year_3']" :key="key">
      <div v-if="result[key]" class="year">
        <h3>{{ result[key].title }}</h3>
        <ul>
          <li v-for="(ev, i) in result[key].events" :key="i">{{ ev }}</li>
        </ul>

        <div v-if="result[key].segments" class="kpis">
          <div v-for="(seg, name) in result[key].segments" :key="name" class="kpi">
            <div class="label">{{ name.replace('_', ' ') }} revenue</div>
            <div class="value">${{ seg.revenue_b_usd }}B</div>
            <div class="delta" :class="seg.yoy_pct >= 0 ? 'pos' : 'neg'">
              {{ seg.yoy_pct >= 0 ? '+' : '' }}{{ seg.yoy_pct }}% YoY
            </div>
          </div>
        </div>

        <div v-if="result[key].share_delta_pct" class="kpis">
          <div v-for="(d, who) in result[key].share_delta_pct" :key="who" class="kpi">
            <div class="label">{{ who.replace('_',' ') }}</div>
            <div class="value delta" :class="d >= 0 ? 'pos' : 'neg'">
              {{ d >= 0 ? '+' : '' }}{{ d }} pts
            </div>
          </div>
        </div>

        <div v-if="result[key].buyer_scores" class="kpis">
          <div v-for="b in result[key].buyer_scores" :key="b.vertical" class="kpi">
            <div class="label">{{ b.vertical }}</div>
            <div class="value">{{ Math.round(b.interest * 100) }}%</div>
            <div class="delta">buy Y1: {{ Math.round(b.buy_likelihood_y1 * 100) }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="result.agent_reactions" class="panel">
      <h2>Agent reactions</h2>
      <div class="agents">
        <div v-for="r in result.agent_reactions" :key="r.agent" class="agent">
          <div class="name">{{ r.agent }}</div>
          <div class="stance">{{ r.stance }}</div>
        </div>
      </div>
    </div>

    <div v-if="result.risks" class="panel">
      <h2>Risks & inversion conditions</h2>
      <ul>
        <li v-for="(r, i) in result.risks" :key="i">{{ r }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({ result: { type: Object, required: true } })
</script>
