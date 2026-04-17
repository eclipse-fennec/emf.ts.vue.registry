<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import type { EObject, EReference, EClass } from 'emfts';

interface Props {
  eObject: EObject;
  feature: EReference;
  readonly?: boolean;
}

const props = defineProps<Props>();

/**
 * Instance holder injection key for finding available instances.
 */
const instanceHolder = inject<{
  findInstancesByClass: (eClass: EClass) => Map<string, EObject>;
  identify: (eObject: EObject) => string | undefined;
}>('instanceHolder', {
  findInstancesByClass: () => new Map(),
  identify: () => undefined,
});

const isMultiValued = computed(() => {
  const upper = props.feature.getUpperBound?.();
  return upper === undefined || upper === -1 || upper > 1;
});

const referenceType = computed<EClass | null>(() => {
  const type = props.feature.getEReferenceType?.();
  return type ?? null;
});

const availableInstances = computed<Map<string, EObject>>(() => {
  if (!referenceType.value) return new Map();
  return instanceHolder.findInstancesByClass(referenceType.value);
});

const availableOptions = computed(() => {
  const options: Array<{ id: string; label: string; instance: EObject }> = [];
  for (const [id, instance] of availableInstances.value) {
    // Get a label for the instance
    let label = id;
    const nameFeature = instance.eClass?.()?.getEStructuralFeature?.('name');
    if (nameFeature) {
      const name = instance.eGet?.(nameFeature);
      if (name) label = String(name);
    }
    options.push({ id, label, instance });
  }
  return options;
});

// Single-valued reference
const singleValue = computed({
  get: () => {
    if (isMultiValued.value) return null;
    const val = props.eObject.eGet(props.feature) as EObject | null;
    if (!val) return null;
    return instanceHolder.identify(val) ?? null;
  },
  set: (newId: string | null) => {
    if (props.readonly) return;
    if (!newId) {
      props.eObject.eSet(props.feature, null);
      return;
    }
    const instance = availableInstances.value.get(newId);
    if (instance) {
      props.eObject.eSet(props.feature, instance);
    }
  },
});

// Multi-valued reference
const multiValue = computed(() => {
  if (!isMultiValued.value) return [];
  const val = props.eObject.eGet(props.feature);
  if (!val) return [];
  if (typeof val[Symbol.iterator] === 'function') {
    const ids: string[] = [];
    for (const obj of val as Iterable<EObject>) {
      const id = instanceHolder.identify(obj);
      if (id) ids.push(id);
    }
    return ids;
  }
  return [];
});

const selectedMulti = ref<string[]>([]);

// Sync selected with actual value
if (isMultiValued.value) {
  selectedMulti.value = [...multiValue.value];
}

function toggleMultiValue(id: string) {
  if (props.readonly) return;

  const idx = selectedMulti.value.indexOf(id);
  if (idx >= 0) {
    selectedMulti.value.splice(idx, 1);
  } else {
    selectedMulti.value.push(id);
  }

  // Update the EObject
  const list = props.eObject.eGet(props.feature);
  if (list && typeof list === 'object' && 'clear' in list) {
    const eList = list as { clear: () => void; add: (obj: EObject) => void };
    eList.clear();
    for (const selId of selectedMulti.value) {
      const instance = availableInstances.value.get(selId);
      if (instance) {
        eList.add(instance);
      }
    }
  }
}

const label = computed(() => {
  const name = props.feature.getName?.() ?? 'unknown';
  const typeName = referenceType.value?.getName?.() ?? 'Reference';
  const multi = isMultiValued.value ? '[]' : '';
  return `${name} (${typeName}${multi})`;
});

const isRequired = computed(() => props.feature.isRequired?.() ?? false);
const featureName = computed(() => props.feature.getName?.() ?? 'field');
</script>

<template>
  <div class="emfts-reference-editor">
    <label :for="featureName">
      {{ label }}
      <span v-if="isRequired" class="required">*</span>
    </label>

    <!-- Single-valued reference -->
    <select
      v-if="!isMultiValued"
      :id="featureName"
      v-model="singleValue"
      :disabled="readonly"
      :required="isRequired"
      class="emfts-select"
    >
      <option v-if="!isRequired" :value="null">-- None --</option>
      <option v-for="opt in availableOptions" :key="opt.id" :value="opt.id">
        {{ opt.label }}
      </option>
    </select>

    <!-- Multi-valued reference -->
    <div v-else class="multi-reference">
      <div
        v-for="opt in availableOptions"
        :key="opt.id"
        class="multi-option"
        :class="{ selected: selectedMulti.includes(opt.id), disabled: readonly }"
        @click="toggleMultiValue(opt.id)"
      >
        <input
          type="checkbox"
          :checked="selectedMulti.includes(opt.id)"
          :disabled="readonly"
          @click.stop
          @change="toggleMultiValue(opt.id)"
        />
        <span>{{ opt.label }}</span>
      </div>
      <div v-if="availableOptions.length === 0" class="no-options">
        No available instances
      </div>
    </div>
  </div>
</template>

<style scoped>
.emfts-reference-editor {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.emfts-reference-editor label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.emfts-reference-editor .required {
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

.multi-reference {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.multi-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.multi-option:hover:not(.disabled) {
  background-color: #f3f4f6;
}

.multi-option.selected {
  background-color: #eff6ff;
}

.multi-option.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.multi-option input {
  cursor: pointer;
}

.multi-option.disabled input {
  cursor: not-allowed;
}

.no-options {
  padding: 12px;
  color: #6b7280;
  font-style: italic;
  text-align: center;
}
</style>
