<script setup lang="ts">
import { computed } from 'vue';
import type { EObject, EAttribute } from '@emfts/core';

interface Props {
  eObject: EObject;
  feature: EAttribute;
  readonly?: boolean;
}

const props = defineProps<Props>();

const value = computed({
  get: () => Boolean(props.eObject.eGet(props.feature)),
  set: (newValue: boolean) => {
    if (!props.readonly) {
      props.eObject.eSet(props.feature, newValue);
    }
  },
});

const label = computed(() => {
  const name = props.feature.getName?.() ?? 'unknown';
  return name;
});

const featureName = computed(() => props.feature.getName?.() ?? 'field');
</script>

<template>
  <div class="emfts-boolean-editor">
    <label class="checkbox-label">
      <input
        :id="featureName"
        v-model="value"
        type="checkbox"
        :disabled="readonly"
        class="emfts-checkbox"
      />
      <span class="checkbox-text">{{ label }}</span>
    </label>
  </div>
</template>

<style scoped>
.emfts-boolean-editor {
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.emfts-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
  cursor: pointer;
}

.emfts-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}
</style>
