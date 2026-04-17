<script setup lang="ts">
import { computed } from 'vue';
import type { EObject, EStructuralFeature } from 'emfts';

/**
 * Custom Color Picker component for EString color attributes.
 */
interface Props {
  eObject: EObject;
  feature: EStructuralFeature;
  readonly?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ update: [] }>();

const value = computed({
  get: () => (props.eObject.eGet(props.feature) as string) ?? '#000000',
  set: (newValue: string) => {
    if (!props.readonly) {
      props.eObject.eSet(props.feature, newValue);
      emit('update');
    }
  },
});

const label = computed(() => {
  const name = props.feature.getName?.() ?? 'unknown';
  return `${name} (Farbe)`;
});

const featureName = computed(() => props.feature.getName?.() ?? 'field');
</script>

<template>
  <div class="color-picker">
    <label :for="featureName">{{ label }}</label>
    <div class="color-input-wrapper">
      <input
        :id="featureName"
        v-model="value"
        type="color"
        :disabled="readonly"
        class="color-input"
      />
      <input
        v-model="value"
        type="text"
        :disabled="readonly"
        class="color-text"
        placeholder="#000000"
      />
    </div>
  </div>
</template>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.color-picker label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 50px;
  height: 40px;
  padding: 2px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-input::-webkit-color-swatch {
  border-radius: 4px;
  border: none;
}

.color-text {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-family: monospace;
}

.color-text:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
