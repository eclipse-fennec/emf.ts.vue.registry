<script setup lang="ts">
import { computed } from 'vue';
import { componentCatalog, type ComponentInfo, type ComponentCategory, type EClass } from '../model/RedpandaModel';

const emit = defineEmits<{
  setInput: [eClass: EClass];
  addProcessor: [eClass: EClass];
  setOutput: [eClass: EClass];
  toggleBuffer: [eClass: EClass | null];
}>();

interface Props {
  hasBuffer: boolean;
}
const props = defineProps<Props>();

const inputs = computed(() => componentCatalog.filter(c => c.category === 'input'));
const processors = computed(() => componentCatalog.filter(c => c.category === 'processor'));
const outputs = computed(() => componentCatalog.filter(c => c.category === 'output'));
const buffers = computed(() => componentCatalog.filter(c => c.category === 'buffer'));

function handleClick(item: ComponentInfo) {
  switch (item.category) {
    case 'input': emit('setInput', item.eClass); break;
    case 'processor': emit('addProcessor', item.eClass); break;
    case 'output': emit('setOutput', item.eClass); break;
    case 'buffer': emit('toggleBuffer', item.eClass); break;
  }
}

const categoryColors: Record<ComponentCategory, string> = {
  input: '#10b981',
  processor: '#3b82f6',
  output: '#f97316',
  buffer: '#eab308',
};
</script>

<template>
  <aside class="palette">
    <h2 class="palette-title">Components</h2>

    <section v-for="(items, label) in { Input: inputs, Processor: processors, Output: outputs, Buffer: buffers }" :key="label">
      <h3 class="section-label" :style="{ borderColor: categoryColors[items[0]?.category] }">
        {{ label }}
      </h3>
      <div class="item-list">
        <button
          v-for="item in items"
          :key="item.eClass.getName()!"
          class="palette-item"
          :style="{ '--accent': categoryColors[item.category] }"
          :title="item.description"
          @click="handleClick(item)"
        >
          <span class="dot" />
          <span class="item-name">{{ item.name }}</span>
          <span class="item-action">{{ item.category === 'processor' ? '+' : '' }}</span>
        </button>
      </div>
    </section>

    <section v-if="props.hasBuffer">
      <button class="remove-buffer" @click="emit('toggleBuffer', null)">
        Remove Buffer
      </button>
    </section>
  </aside>
</template>

<style scoped>
.palette {
  width: 200px;
  min-width: 200px;
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.palette-title {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-bottom: 4px;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: 2px solid #334155;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8125rem;
  text-align: left;
  transition: background 0.15s;
}

.palette-item:hover {
  background: #334155;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.item-name {
  flex: 1;
}

.item-action {
  font-size: 0.875rem;
  font-weight: 700;
  color: #64748b;
}

.remove-buffer {
  width: 100%;
  padding: 6px 8px;
  border: 1px dashed #475569;
  background: transparent;
  color: #94a3b8;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.remove-buffer:hover {
  border-color: #ef4444;
  color: #ef4444;
}
</style>
