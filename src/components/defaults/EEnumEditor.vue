<script setup lang="ts">
import { computed } from 'vue';
import type { EObject, EAttribute, EEnum, EEnumLiteral } from 'emfts';

interface Props {
  eObject: EObject;
  feature: EAttribute;
  readonly?: boolean;
}

const props = defineProps<Props>();

/**
 * Check if the type is an EEnum.
 */
function isEEnum(value: unknown): value is EEnum {
  if (!value || typeof value !== 'object') return false;
  return 'getELiterals' in value;
}

const enumType = computed<EEnum | null>(() => {
  const type = props.feature.getEType?.();
  return type && isEEnum(type) ? type : null;
});

const literals = computed<EEnumLiteral[]>(() => {
  const eLiterals = enumType.value?.getELiterals?.();
  if (!eLiterals) return [];
  // Convert to array if it's an EList
  if (typeof eLiterals[Symbol.iterator] === 'function') {
    return Array.from(eLiterals as Iterable<EEnumLiteral>);
  }
  return [];
});

const value = computed({
  get: () => {
    const val = props.eObject.eGet(props.feature);
    // Return the literal value or instance
    if (val && typeof val === 'object' && 'getValue' in val) {
      return (val as EEnumLiteral).getValue?.();
    }
    return val;
  },
  set: (newValue: unknown) => {
    if (!props.readonly) {
      // Find the literal by value
      const literal = literals.value.find((l) => l.getValue?.() === newValue);
      if (literal) {
        const instance = literal.getInstance?.();
        props.eObject.eSet(props.feature, instance ?? literal);
      } else {
        props.eObject.eSet(props.feature, newValue);
      }
    }
  },
});

const label = computed(() => {
  const name = props.feature.getName?.() ?? 'unknown';
  const typeName = enumType.value?.getName?.() ?? 'Enum';
  return `${name} (${typeName})`;
});

const isRequired = computed(() => props.feature.isRequired?.() ?? false);
const featureName = computed(() => props.feature.getName?.() ?? 'field');
</script>

<template>
  <div class="emfts-enum-editor">
    <label :for="featureName">
      {{ label }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    <select
      :id="featureName"
      v-model="value"
      :disabled="readonly"
      :required="isRequired"
      class="emfts-select"
    >
      <option v-if="!isRequired" :value="undefined">-- Select --</option>
      <option
        v-for="literal in literals"
        :key="literal.getValue?.()"
        :value="literal.getValue?.()"
      >
        {{ literal.getName?.() ?? literal.getLiteral?.() }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.emfts-enum-editor {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.emfts-enum-editor label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.emfts-enum-editor .required {
  color: #ef4444;
  margin-left: 2px;
}

.emfts-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.emfts-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.emfts-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>
