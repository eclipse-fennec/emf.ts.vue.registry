<script setup lang="ts">
import { computed, inject } from 'vue';
import type { EObject, EStructuralFeature } from '@emfts/core';
import type { ComponentRegistry } from '../registry/ComponentRegistry';

interface Props {
  eObject: EObject;
  readonly?: boolean;
}

const props = defineProps<Props>();

/**
 * Inject the component registry.
 */
const registry = inject<ComponentRegistry>('componentRegistry');

/**
 * Get all structural features of the EObject's class.
 */
const features = computed<EStructuralFeature[]>(() => {
  const eClass = props.eObject.eClass?.();
  if (!eClass) return [];

  const allFeatures = eClass.getEAllStructuralFeatures?.();
  if (!allFeatures) return [];

  // Convert to array if it's an EList
  if (typeof allFeatures[Symbol.iterator] === 'function') {
    return Array.from(allFeatures as Iterable<EStructuralFeature>);
  }

  return [];
});

/**
 * Get the component for a specific feature.
 */
function getComponentForFeature(feature: EStructuralFeature) {
  if (!registry) {
    console.warn('No component registry provided');
    return null;
  }
  return registry.getComponentForFeature(feature, props.eObject);
}

/**
 * Get the class name for display.
 */
const className = computed(() => {
  return props.eObject.eClass?.()?.getName?.() ?? 'Unknown';
});
</script>

<template>
  <div class="emfts-object-composer">
    <h3 class="composer-title">{{ className }}</h3>

    <div class="composer-content">
      <template v-for="feature in features" :key="feature.getName?.()">
        <component
          :is="getComponentForFeature(feature)"
          v-if="getComponentForFeature(feature)"
          :eObject="eObject"
          :feature="feature"
          :readonly="readonly"
        />
        <div v-else class="unknown-feature">
          <span class="feature-name">{{ feature.getName?.() }}</span>
          <span class="feature-type">({{ feature.getEType?.()?.getName?.() ?? 'unknown' }})</span>
          <span class="no-editor">- No editor available</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.emfts-object-composer {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #fff;
}

.composer-title {
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.composer-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unknown-feature {
  padding: 8px 12px;
  background-color: #fef3c7;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #92400e;
}

.feature-name {
  font-weight: 500;
}

.feature-type {
  color: #b45309;
  margin-left: 4px;
}

.no-editor {
  color: #d97706;
  margin-left: 8px;
  font-style: italic;
}
</style>
