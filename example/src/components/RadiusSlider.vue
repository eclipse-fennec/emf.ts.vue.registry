<script setup lang="ts">
import { computed } from 'vue';
import type { EObject, EStructuralFeature } from 'emfts';

/**
 * Custom Radius Slider component for numeric radius attributes.
 */
interface Props {
  eObject: EObject;
  feature: EStructuralFeature;
  readonly?: boolean;
  min?: number;
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  min: 10,
  max: 200,
});

const emit = defineEmits<{ update: [] }>();

const value = computed({
  get: () => {
    const val = props.eObject.eGet(props.feature);
    return val !== undefined && val !== null ? Number(val) : 50;
  },
  set: (newValue: number) => {
    if (!props.readonly) {
      props.eObject.eSet(props.feature, newValue);
      emit('update');
    }
  },
});

const label = computed(() => {
  const name = props.feature.getName?.() ?? 'unknown';
  return `${name} (Radius)`;
});

const featureName = computed(() => props.feature.getName?.() ?? 'field');
</script>

<template>
  <div class="radius-slider">
    <label :for="featureName">
      {{ label }}: <span class="value-display">{{ value }}px</span>
    </label>
    <div class="slider-wrapper">
      <span class="min-label">{{ min }}</span>
      <input
        :id="featureName"
        v-model.number="value"
        type="range"
        :min="min"
        :max="max"
        :disabled="readonly"
        class="slider"
      />
      <span class="max-label">{{ max }}</span>
    </div>
    <input
      v-model.number="value"
      type="number"
      :min="min"
      :max="max"
      :disabled="readonly"
      class="number-input"
    />
  </div>
</template>

<style scoped>
.radius-slider {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.radius-slider label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.value-display {
  font-weight: 700;
  color: #3b82f6;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.min-label,
.max-label {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 30px;
}

.max-label {
  text-align: right;
}

.slider {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 4px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.number-input {
  width: 100px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
}

.number-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
