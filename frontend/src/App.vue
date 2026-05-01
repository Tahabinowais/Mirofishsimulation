<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">◈</span>
        <span class="brand-name">MiroFish</span>
        <span class="brand-sub">Industrial AM Simulator</span>
      </div>
      <nav>
        <router-link to="/">Home</router-link>
        <a href="https://github.com/666ghj/MiroFish" target="_blank" rel="noopener">Upstream</a>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <span>3-year strategic horizon · Metal + Polymer + Service-bureau · Pre-scripted scenarios</span>
    </footer>
  </div>
</template>

<script setup></script>
