<script setup lang="ts">
import { computed } from 'vue';
import type { EObject, EStructuralFeature } from 'emfts';

interface Props {
  eObject: EObject;
  version?: number;
}

const props = defineProps<Props>();

const eClass = computed(() => props.eObject.eClass?.());

const className = computed(() => eClass.value?.getName?.() ?? 'Unknown');

const packageName = computed(() => eClass.value?.getEPackage?.()?.getName?.() ?? '');

const features = computed(() => {
  const allFeatures = eClass.value?.getEAllStructuralFeatures?.();
  if (!allFeatures) return [];
  if (typeof allFeatures[Symbol.iterator] === 'function') {
    return Array.from(allFeatures as Iterable<EStructuralFeature>);
  }
  return [];
});

function getFeatureValue(feature: EStructuralFeature): unknown {
  // Access version for reactivity
  void props.version;
  return props.eObject.eGet?.(feature);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }
  if (typeof value === 'object' && 'eClass' in value) {
    const obj = value as EObject;
    return `→ ${obj.eClass?.()?.getName?.() ?? 'EObject'}`;
  }
  return String(value);
}

function getValueClass(value: unknown): string {
  if (value === null || value === undefined) return 'value-null';
  if (typeof value === 'string') return 'value-string';
  if (typeof value === 'number') return 'value-number';
  if (typeof value === 'boolean') return 'value-boolean';
  if (typeof value === 'object') return 'value-object';
  return '';
}
</script>

<template>
  <div class="eobject-tree">
    <div class="tree-header">
      <span class="tree-icon">📦</span>
      <span class="class-name">{{ className }}</span>
      <span class="package-name" v-if="packageName">({{ packageName }})</span>
    </div>

    <div class="tree-content">
      <div
        v-for="feature in features"
        :key="feature.getName?.()"
        class="tree-node"
      >
        <span class="feature-icon">├─</span>
        <span class="feature-name">{{ feature.getName?.() }}</span>
        <span class="feature-type">[{{ feature.getEType?.()?.getName?.() }}]</span>
        <span class="feature-separator">:</span>
        <span :class="['feature-value', getValueClass(getFeatureValue(feature))]">
          {{ formatValue(getFeatureValue(feature)) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eobject-tree {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.tree-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3c3c3c;
  margin-bottom: 12px;
}

.tree-icon {
  font-size: 1rem;
}

.class-name {
  color: #4ec9b0;
  font-weight: 600;
}

.package-name {
  color: #808080;
  font-size: 0.75rem;
}

.tree-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tree-node {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding-left: 8px;
}

.feature-icon {
  color: #6a6a6a;
}

.feature-name {
  color: #9cdcfe;
}

.feature-type {
  color: #569cd6;
  font-size: 0.75rem;
}

.feature-separator {
  color: #d4d4d4;
}

.feature-value {
  margin-left: 4px;
}

.value-null {
  color: #808080;
  font-style: italic;
}

.value-string {
  color: #ce9178;
}

.value-number {
  color: #b5cea8;
}

.value-boolean {
  color: #569cd6;
}

.value-object {
  color: #4ec9b0;
}
</style>
