<script setup lang="ts">
import PipelinePalette from './pipeline/PipelinePalette.vue';
import PipelineCanvas from './pipeline/PipelineCanvas.vue';
import PipelineConfigPanel from './pipeline/PipelineConfigPanel.vue';
import { usePipeline } from './pipeline/usePipeline';

const {
  nodes, edges, buffer,
  selectedNodeId, selectedEObject, selectedCategory,
  setInput, setOutput, addProcessor, removeProcessor, toggleBuffer, selectNode, bump,
} = usePipeline();
</script>

<template>
  <div class="pipeline-app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="header-title">Redpanda Connect Pipeline Editor</h1>
        <span class="header-sub">EMF model-driven &middot; VueFlow</span>
      </div>
    </header>

    <div class="app-body">
      <PipelinePalette
        :has-buffer="!!buffer"
        @set-input="setInput"
        @add-processor="addProcessor"
        @set-output="setOutput"
        @toggle-buffer="toggleBuffer"
      />

      <PipelineCanvas
        :nodes="nodes"
        :edges="edges"
        :selected-node-id="selectedNodeId"
        @select-node="selectNode"
        @remove-processor="removeProcessor"
      />

      <PipelineConfigPanel
        :e-object="selectedEObject"
        :category="selectedCategory"
        @update="bump"
      />
    </div>
  </div>
</template>

<style scoped>
.pipeline-app {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 12px 20px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-title {
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
}

.header-sub {
  font-size: 0.75rem;
  color: #64748b;
}

.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>
