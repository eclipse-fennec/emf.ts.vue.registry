<script setup lang="ts">
import { ref, shallowRef, markRaw, defineAsyncComponent } from 'vue';

const CircleApp = defineAsyncComponent(() => import('./App.vue'));
const PipelineApp = defineAsyncComponent(() => import('./PipelineApp.vue'));

type DemoKey = 'pipeline' | 'circle';

const demos: { key: DemoKey; label: string; desc: string }[] = [
  { key: 'pipeline', label: 'Pipeline Editor', desc: 'Redpanda Connect pipeline (VueFlow + Ecore)' },
  { key: 'circle', label: 'Circle Editor', desc: 'Circle graph with EMF model' },
];

const active = ref<DemoKey>('pipeline');
</script>

<template>
  <div class="demo-shell">
    <nav class="demo-nav">
      <button
        v-for="d in demos"
        :key="d.key"
        :class="['nav-tab', { active: active === d.key }]"
        @click="active = d.key"
      >
        <span class="tab-label">{{ d.label }}</span>
        <span class="tab-desc">{{ d.desc }}</span>
      </button>
    </nav>
    <div class="demo-content">
      <PipelineApp v-if="active === 'pipeline'" />
      <CircleApp v-else-if="active === 'circle'" />
    </div>
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f3f4f6;
  overflow: hidden;
}
#app { height: 100vh; }
</style>

<style scoped>
.demo-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-nav {
  display: flex;
  gap: 0;
  background: #0f172a;
  padding: 0 8px;
  flex-shrink: 0;
}

.nav-tab {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  text-align: left;
}

.nav-tab:hover {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.03);
}

.nav-tab.active {
  color: #f1f5f9;
  border-bottom-color: #3b82f6;
}

.tab-label {
  font-size: 0.8125rem;
  font-weight: 600;
}

.tab-desc {
  font-size: 0.6875rem;
  opacity: 0.6;
}

.demo-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
