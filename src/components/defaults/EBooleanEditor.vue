<script setup lang="ts">
import { computed } from 'vue';
import type { EObject, EAttribute } from '@emfts/core';

interface Props {
  eObject: EObject;
  feature: EAttribute;
  readonly?: boolean;
  /** Angezeigtes Label; ersetzt die Ableitung aus Name und Typ (#22). */
  label?: string;
  /** Platzhalter des Eingabefelds. */
  placeholder?: string;
  /** Pflichtfeld; ersetzt die Ableitung aus der Multiplizität. */
  required?: boolean;
  /** Das Feld ist ungültig — der Aufrufer hat validiert. */
  invalid?: boolean;
  /** Meldung zur fehlgeschlagenen Validierung. */
  validationMessage?: string;
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

const displayLabel = computed(() => {
  if (props.label !== undefined) return props.label;
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
        :aria-invalid="invalid || undefined"
        class="emfts-checkbox"
      />
      <span class="checkbox-text">{{ displayLabel }}</span>
    </label>
    <p v-if="validationMessage" class="emfts-validation-message" role="alert">
      {{ validationMessage }}
    </p>
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

.emfts-validation-message {
  margin: 0;
  font-size: 0.8125rem;
  color: #b91c1c;
}
</style>
