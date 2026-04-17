<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getEditableAttributes, type EObject, type EAttribute } from '../model/RedpandaModel';

interface Props {
  eObject: EObject | null;
  category: string | null;
}
const props = defineProps<Props>();
const emit = defineEmits<{ update: [] }>();

const localVersion = ref(0);

// Re-compute when eObject changes
watch(() => props.eObject, () => { localVersion.value++; });

const className = computed(() => {
  if (!props.eObject) return '';
  return props.eObject.eClass().getName() ?? '';
});

const displayName = computed(() => {
  return className.value.replace(/([A-Z])/g, ' $1').trim();
});

const attributes = computed(() => {
  void localVersion.value;
  if (!props.eObject) return [];
  return getEditableAttributes(props.eObject);
});

const label = computed({
  get: () => {
    void localVersion.value;
    if (!props.eObject) return '';
    const labelAttr = props.eObject.eClass().getEAllAttributes().find(
      (a: EAttribute) => a.getName() === 'label'
    );
    if (!labelAttr) return '';
    return (props.eObject.eGet(labelAttr) as string) ?? '';
  },
  set: (val: string) => {
    if (!props.eObject) return;
    const labelAttr = props.eObject.eClass().getEAllAttributes().find(
      (a: EAttribute) => a.getName() === 'label'
    );
    if (labelAttr) {
      props.eObject.eSet(labelAttr, val);
      localVersion.value++;
      emit('update');
    }
  },
});

function getValue(attr: EAttribute): string {
  void localVersion.value;
  if (!props.eObject) return '';
  const val = props.eObject.eGet(attr);
  return val != null ? String(val) : '';
}

function setValue(attr: EAttribute, raw: string) {
  if (!props.eObject) return;
  const typeName = attr.getEType()?.getName();
  let val: any = raw;
  if (typeName === 'EInt') val = parseInt(raw, 10) || 0;
  else if (typeName === 'EBoolean') val = raw === 'true';
  props.eObject.eSet(attr, val);
  localVersion.value++;
  emit('update');
}

function getTypeName(attr: EAttribute): string {
  return attr.getEType()?.getName() ?? 'String';
}

const categoryColors: Record<string, string> = {
  input: '#10b981',
  processor: '#3b82f6',
  output: '#f97316',
  buffer: '#eab308',
};
</script>

<template>
  <aside class="config-panel">
    <template v-if="props.eObject && props.category">
      <div class="config-header" :style="{ borderColor: categoryColors[props.category] }">
        <span class="config-badge" :style="{ background: categoryColors[props.category] }">
          {{ props.category.toUpperCase() }}
        </span>
        <h2 class="config-title">{{ displayName }}</h2>
        <p class="config-class">{{ className }}</p>
      </div>

      <div class="config-body">
        <!-- Label -->
        <div class="field">
          <label class="field-label">label</label>
          <input class="field-input" v-model="label" placeholder="optional label" />
        </div>

        <hr class="divider" />

        <!-- Attributes -->
        <div v-for="attr in attributes" :key="attr.getName()!" class="field">
          <label class="field-label">
            {{ attr.getName() }}
            <span class="field-type">{{ getTypeName(attr) }}</span>
          </label>
          <input
            v-if="getTypeName(attr) === 'EInt'"
            class="field-input"
            type="number"
            :value="getValue(attr)"
            @input="(e: Event) => setValue(attr, (e.target as HTMLInputElement).value)"
          />
          <select
            v-else-if="getTypeName(attr) === 'EBoolean'"
            class="field-input"
            :value="getValue(attr)"
            @change="(e: Event) => setValue(attr, (e.target as HTMLSelectElement).value)"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
          <textarea
            v-else-if="attr.getName() === 'mapping'"
            class="field-input field-textarea"
            :value="getValue(attr)"
            @input="(e: Event) => setValue(attr, (e.target as HTMLTextAreaElement).value)"
            rows="3"
            spellcheck="false"
          />
          <input
            v-else
            class="field-input"
            type="text"
            :value="getValue(attr)"
            @input="(e: Event) => setValue(attr, (e.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </template>

    <div v-else class="config-empty">
      <p>Select a node to edit its properties</p>
    </div>
  </aside>
</template>

<style scoped>
.config-panel {
  width: 280px;
  min-width: 280px;
  background: #fff;
  border-left: 1px solid #e2e8f0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.config-header {
  padding: 16px;
  border-bottom: 3px solid #e2e8f0;
}

.config-badge {
  display: inline-block;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #fff;
  padding: 2px 8px;
  border-radius: 3px;
  margin-bottom: 8px;
}

.config-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}

.config-class {
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.config-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.field-type {
  font-size: 0.625rem;
  color: #94a3b8;
  font-weight: 400;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.field-input {
  padding: 7px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #1e293b;
  background: #f8fafc;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #fff;
}

.field-textarea {
  resize: vertical;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
  line-height: 1.5;
}

.divider {
  border: none;
  border-top: 1px solid #f1f5f9;
  margin: 4px 0;
}

.config-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.config-empty p {
  color: #94a3b8;
  font-size: 0.8125rem;
  text-align: center;
}
</style>
