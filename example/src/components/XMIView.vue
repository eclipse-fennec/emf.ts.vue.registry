<script setup lang="ts">
import { computed } from 'vue';
import type { EObject } from 'emfts';
import { XMISave, XMIResource, URI } from 'emfts';

interface Props {
  eObjects: EObject[];
  version?: number;
}

const props = defineProps<Props>();

/**
 * Generate XMI representation using emfts XMISave
 */
const xmiContent = computed(() => {
  // Access version for reactivity
  void props.version;

  const objects = props.eObjects;
  if (!objects || objects.length === 0) return '';

  try {
    // Create a temporary XMI resource
    const resource = new XMIResource(URI.createURI('temp://circles.xmi'));

    // Add all objects to the resource
    for (const obj of objects) {
      resource.getContents().push(obj);
    }

    // Use XMISave to serialize
    const saver = new XMISave();
    const xmi = saver.save(resource);

    // Remove all objects from the temporary resource to avoid side effects
    resource.getContents().clear();

    return xmi;
  } catch (e) {
    console.error('XMI serialization error:', e);
    return `<!-- Error: ${e} -->`;
  }
});
</script>

<template>
  <div class="xmi-view">
    <div class="view-header">
      <span class="view-icon">📄</span>
      <span class="view-title">XMI Serialisierung (emfts)</span>
    </div>
    <pre class="xmi-content">{{ xmiContent }}</pre>
  </div>
</template>

<style scoped>
.xmi-view {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.8125rem;
  background: #1e1e1e;
  color: #9cdcfe;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3c3c3c;
  margin-bottom: 12px;
}

.view-icon {
  font-size: 1rem;
}

.view-title {
  color: #4ec9b0;
  font-weight: 600;
}

.xmi-content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
</style>
