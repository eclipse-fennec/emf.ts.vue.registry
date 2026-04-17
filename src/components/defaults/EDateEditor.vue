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
  get: () => {
    const val = props.eObject.eGet(props.feature);
    if (val instanceof Date) {
      return val.toISOString().split('T')[0];
    }
    if (typeof val === 'string') {
      return val.split('T')[0];
    }
    return '';
  },
  set: (newValue: string) => {
    if (!props.readonly && newValue) {
      props.eObject.eSet(props.feature, new Date(newValue));
    }
  },
});

const label = computed(() => {
  const name = props.feature.getName?.() ?? 'unknown';
  const typeName = props.feature.getEType?.()?.getName?.() ?? 'Date';
  return `${name} (${typeName})`;
});

const isRequired = computed(() => props.feature.isRequired?.() ?? false);
const featureName = computed(() => props.feature.getName?.() ?? 'field');
</script>

<template>
  <div class="emfts-date-editor">
    <label :for="featureName">
      {{ label }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    <input
      :id="featureName"
      v-model="value"
      type="date"
      :disabled="readonly"
      :required="isRequired"
      class="emfts-input"
    />
  </div>
</template>

<style scoped>
.emfts-date-editor {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.emfts-date-editor label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.emfts-date-editor .required {
  color: #ef4444;
  margin-left: 2px;
}

.emfts-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.emfts-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.emfts-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>
