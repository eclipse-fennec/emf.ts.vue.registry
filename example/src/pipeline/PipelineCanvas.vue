<script setup lang="ts">
import { watch, nextTick } from 'vue';
import { VueFlow, useVueFlow, Handle, Position } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import type { Node, Edge, NodeMouseEvent } from '@vue-flow/core';

interface Props {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  selectNode: [id: string];
  removeProcessor: [index: number];
}>();

const { setNodes, setEdges } = useVueFlow({ id: 'pipeline-flow' });

// Sync: set nodes first, then edges after DOM update
watch(
  () => [props.nodes, props.edges] as const,
  ([newNodes, newEdges]) => {
    setNodes(newNodes);
    nextTick(() => {
      setEdges(newEdges);
    });
  },
  { immediate: true, deep: true },
);

function onNodeClick(e: NodeMouseEvent) {
  emit('selectNode', e.node.id);
}

function onPaneClick() {
  emit('selectNode', '');
}

function isSelected(nodeId: string): boolean {
  return props.selectedNodeId === nodeId;
}
</script>

<template>
  <div class="canvas-wrapper">
    <VueFlow
      id="pipeline-flow"
      :default-viewport="{ x: 30, y: 80, zoom: 0.85 }"
      :nodes-draggable="true"
      :nodes-connectable="false"
      :zoom-on-scroll="true"
      :pan-on-scroll="false"
      fit-view-on-init
      @node-click="onNodeClick"
      @pane-click="onPaneClick"
    >
      <Background :gap="20" :size="1" pattern-color="#e2e8f0" />

      <!-- Input Node -->
      <template #node-pipelineInput="{ data, id }">
        <div class="pipeline-node input-node" :class="{ selected: isSelected(id) }">
          <div class="node-badge input-badge">INPUT</div>
          <div class="node-label">{{ data.label }}</div>
          <Handle type="source" :position="Position.Right" class="handle handle-source" />
        </div>
      </template>

      <!-- Buffer Node -->
      <template #node-pipelineBuffer="{ data, id }">
        <div class="pipeline-node buffer-node" :class="{ selected: isSelected(id) }">
          <Handle type="target" :position="Position.Left" class="handle handle-target" />
          <div class="node-badge buffer-badge">BUFFER</div>
          <div class="node-label">{{ data.label }}</div>
          <Handle type="source" :position="Position.Right" class="handle handle-source" />
        </div>
      </template>

      <!-- Processor Node -->
      <template #node-pipelineProcessor="{ data, id }">
        <div class="pipeline-node processor-node" :class="{ selected: isSelected(id) }">
          <Handle type="target" :position="Position.Left" class="handle handle-target" />
          <button
            class="node-delete"
            title="Remove processor"
            @click.stop="emit('removeProcessor', data.index)"
          >x</button>
          <div class="node-badge processor-badge">PROCESSOR</div>
          <div class="node-label">{{ data.label }}</div>
          <Handle type="source" :position="Position.Right" class="handle handle-source" />
        </div>
      </template>

      <!-- Output Node -->
      <template #node-pipelineOutput="{ data, id }">
        <div class="pipeline-node output-node" :class="{ selected: isSelected(id) }">
          <Handle type="target" :position="Position.Left" class="handle handle-target" />
          <div class="node-badge output-badge">OUTPUT</div>
          <div class="node-label">{{ data.label }}</div>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  flex: 1;
  min-height: 0;
  background: #f8fafc;
}

/* ---- Nodes ---- */
.pipeline-node {
  position: relative;
  min-width: 160px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #fff;
  border: 2px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: border-color 0.15s, box-shadow 0.15s;
  cursor: pointer;
}

.pipeline-node.selected {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.input-node { border-color: #10b981; }
.input-node.selected { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25); }

.buffer-node { border-color: #eab308; }
.buffer-node.selected { border-color: #eab308; box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.25); }

.processor-node { border-color: #3b82f6; }
.processor-node.selected { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25); }

.output-node { border-color: #f97316; }
.output-node.selected { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.25); }

/* ---- Badge ---- */
.node-badge {
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #fff;
  padding: 1px 6px;
  border-radius: 3px;
  display: inline-block;
  margin-bottom: 6px;
}

.input-badge { background: #10b981; }
.buffer-badge { background: #eab308; }
.processor-badge { background: #3b82f6; }
.output-badge { background: #f97316; }

/* ---- Label ---- */
.node-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}

/* ---- Delete button ---- */
.node-delete {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #94a3b8;
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  opacity: 0;
}

.pipeline-node:hover .node-delete {
  opacity: 1;
}

.node-delete:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

/* ---- Handles ---- */
.handle {
  width: 10px !important;
  height: 10px !important;
  border: 2px solid #94a3b8 !important;
  background: #fff !important;
}
</style>
