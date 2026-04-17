<script setup lang="ts">
import { computed } from 'vue';
import type { EClass, EStructuralFeature, EAttribute, EReference } from 'emfts';

interface Props {
  eClass: EClass;
}

const props = defineProps<Props>();

const className = computed(() => props.eClass.getName?.() ?? 'Unknown');

const packageInfo = computed(() => {
  const pkg = props.eClass.getEPackage?.();
  return {
    name: pkg?.getName?.() ?? '',
    nsURI: pkg?.getNsURI?.() ?? '',
    nsPrefix: pkg?.getNsPrefix?.() ?? ''
  };
});

const features = computed(() => {
  const allFeatures = props.eClass.getEAllStructuralFeatures?.();
  if (!allFeatures) return [];
  if (typeof allFeatures[Symbol.iterator] === 'function') {
    return Array.from(allFeatures as Iterable<EStructuralFeature>);
  }
  return [];
});

function isAttribute(feature: EStructuralFeature): boolean {
  return 'getEAttributeType' in feature ||
    feature.eClass?.()?.getName?.() === 'EAttribute';
}

function isReference(feature: EStructuralFeature): boolean {
  return 'getEReferenceType' in feature ||
    'isContainment' in feature ||
    feature.eClass?.()?.getName?.() === 'EReference';
}

function getFeatureDetails(feature: EStructuralFeature): string {
  const parts: string[] = [];

  const lower = feature.getLowerBound?.() ?? 0;
  const upper = feature.getUpperBound?.() ?? 1;
  const multiplicity = upper === -1 ? `${lower}..*` : lower === upper ? `${lower}` : `${lower}..${upper}`;
  parts.push(multiplicity);

  if (isReference(feature)) {
    const ref = feature as EReference;
    if (ref.isContainment?.()) parts.push('containment');
  }

  const defaultVal = feature.getDefaultValueLiteral?.();
  if (defaultVal) parts.push(`default="${defaultVal}"`);

  return parts.join(', ');
}
</script>

<template>
  <div class="eclass-tree">
    <div class="tree-header">
      <span class="tree-icon">🔷</span>
      <span class="keyword">EClass</span>
      <span class="class-name">{{ className }}</span>
    </div>

    <div class="package-info">
      <div class="info-line">
        <span class="label">nsURI:</span>
        <span class="value">{{ packageInfo.nsURI }}</span>
      </div>
      <div class="info-line">
        <span class="label">nsPrefix:</span>
        <span class="value">{{ packageInfo.nsPrefix }}</span>
      </div>
    </div>

    <div class="features-section">
      <div class="section-header">Structural Features</div>

      <div
        v-for="feature in features"
        :key="feature.getName?.()"
        class="feature-node"
      >
        <span class="feature-icon">
          {{ isAttribute(feature) ? '📝' : '🔗' }}
        </span>
        <span class="feature-kind">
          {{ isAttribute(feature) ? 'EAttribute' : 'EReference' }}
        </span>
        <span class="feature-name">{{ feature.getName?.() }}</span>
        <span class="feature-type">: {{ feature.getEType?.()?.getName?.() }}</span>
        <span class="feature-details" v-if="getFeatureDetails(feature)">
          [{{ getFeatureDetails(feature) }}]
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eclass-tree {
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
}

.tree-icon {
  font-size: 1rem;
}

.keyword {
  color: #c586c0;
  font-weight: 500;
}

.class-name {
  color: #4ec9b0;
  font-weight: 600;
}

.package-info {
  margin: 12px 0;
  padding: 8px 12px;
  background: #252526;
  border-radius: 4px;
}

.info-line {
  display: flex;
  gap: 8px;
  padding: 2px 0;
}

.info-line .label {
  color: #569cd6;
}

.info-line .value {
  color: #ce9178;
}

.features-section {
  margin-top: 12px;
}

.section-header {
  color: #808080;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.feature-node {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 0 4px 12px;
}

.feature-icon {
  font-size: 0.875rem;
}

.feature-kind {
  color: #c586c0;
  font-size: 0.75rem;
}

.feature-name {
  color: #9cdcfe;
  font-weight: 500;
}

.feature-type {
  color: #4ec9b0;
}

.feature-details {
  color: #6a9955;
  font-size: 0.75rem;
  margin-left: 4px;
}
</style>
