<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  createCircle,
  connectedToFeature,
  type Circle,
} from '../model/CircleModel';

const emit = defineEmits<{
  select: [circle: Circle | null];
  update: [];
}>();

// All circles
const circles = ref<Circle[]>([createCircle(50, '#3b82f6', 150, 150)]);

// Selected circle
const selectedCircle = ref<Circle | null>(circles.value[0]);

// Dragging state for creating connections
const isDragging = ref(false);
const dragStart = ref<{ circle: Circle; x: number; y: number } | null>(null);
const dragEnd = ref<{ x: number; y: number } | null>(null);

// Canvas ref
const canvasRef = ref<HTMLDivElement | null>(null);

// Random colors for new circles
const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
let colorIndex = 0;

function getNextColor(): string {
  const color = colors[colorIndex % colors.length];
  colorIndex++;
  return color;
}

// Get position relative to canvas
function getCanvasPosition(e: MouseEvent): { x: number; y: number } {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return { x: 0, y: 0 };
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// Check if point is inside circle center (for drag start)
function isInCircleCenter(x: number, y: number, circle: Circle): boolean {
  const cx = circle.x;
  const cy = circle.y;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  return dist < 15; // Center handle radius
}

// Check if point is inside circle
function isInCircle(x: number, y: number, circle: Circle): boolean {
  const cx = circle.x;
  const cy = circle.y;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  return dist < circle.radius;
}

// Find circle at position
function findCircleAt(x: number, y: number): Circle | null {
  // Check in reverse order (top-most first)
  for (let i = circles.value.length - 1; i >= 0; i--) {
    if (isInCircle(x, y, circles.value[i])) {
      return circles.value[i];
    }
  }
  return null;
}

// Handle canvas click
function onCanvasClick(e: MouseEvent) {
  if (isDragging.value) return;

  const pos = getCanvasPosition(e);
  const circle = findCircleAt(pos.x, pos.y);

  if (circle) {
    // Select existing circle
    selectedCircle.value = circle;
    emit('select', circle);
  } else {
    // Create new circle at click position
    const newCircle = createCircle(40, getNextColor(), pos.x, pos.y);
    circles.value.push(newCircle);
    selectedCircle.value = newCircle;
    emit('select', newCircle);
    emit('update');
  }
}

// Handle mouse down (start drag from center)
function onMouseDown(e: MouseEvent) {
  const pos = getCanvasPosition(e);

  // Check if we're starting from a circle center
  for (const circle of circles.value) {
    if (isInCircleCenter(pos.x, pos.y, circle)) {
      isDragging.value = true;
      dragStart.value = { circle, x: circle.x, y: circle.y };
      dragEnd.value = { x: pos.x, y: pos.y };
      e.preventDefault();
      return;
    }
  }
}

// Handle mouse move (update drag line)
function onMouseMove(e: MouseEvent) {
  if (!isDragging.value || !dragStart.value) return;

  const pos = getCanvasPosition(e);
  dragEnd.value = { x: pos.x, y: pos.y };
}

// Handle mouse up (create connection)
function onMouseUp(e: MouseEvent) {
  if (!isDragging.value || !dragStart.value) {
    isDragging.value = false;
    return;
  }

  const pos = getCanvasPosition(e);
  const targetCircle = findCircleAt(pos.x, pos.y);

  if (targetCircle && targetCircle !== dragStart.value.circle) {
    // Create connection
    const sourceConnections = dragStart.value.circle.eGet(connectedToFeature) as any;
    if (sourceConnections && !sourceConnections.includes(targetCircle)) {
      sourceConnections.push(targetCircle);
      emit('update');
    }
  }

  isDragging.value = false;
  dragStart.value = null;
  dragEnd.value = null;
}

// Get all connections as line coordinates
const connections = computed(() => {
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  for (const circle of circles.value) {
    const connected = circle.eGet(connectedToFeature) as Iterable<Circle> | null;
    if (connected) {
      for (const target of connected) {
        lines.push({
          x1: circle.x,
          y1: circle.y,
          x2: target.x,
          y2: target.y,
        });
      }
    }
  }

  return lines;
});

// Delete selected circle
function deleteSelected() {
  if (!selectedCircle.value) return;

  // Remove from other circles' connections
  for (const circle of circles.value) {
    const connected = circle.eGet(connectedToFeature) as any;
    if (connected) {
      const idx = connected.indexOf(selectedCircle.value);
      if (idx >= 0) {
        connected.splice(idx, 1);
      }
    }
  }

  // Remove the circle
  const idx = circles.value.indexOf(selectedCircle.value);
  if (idx >= 0) {
    circles.value.splice(idx, 1);
  }

  selectedCircle.value = circles.value[0] || null;
  emit('select', selectedCircle.value);
  emit('update');
}

// Expose circles and selected for parent
defineExpose({ circles, selectedCircle, deleteSelected });

// Initial emit
emit('select', selectedCircle.value);
</script>

<template>
  <div class="canvas-container">
    <div class="toolbar">
      <span class="hint">Klick = neuer Kreis | Klick auf Kreis = auswählen | Ziehen vom Zentrum = verbinden</span>
      <button @click="deleteSelected" :disabled="!selectedCircle" class="delete-btn">
        Löschen
      </button>
    </div>

    <div
      ref="canvasRef"
      class="canvas"
      @click="onCanvasClick"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <!-- Connection lines -->
      <svg class="connections-layer">
        <!-- Existing connections -->
        <line
          v-for="(conn, i) in connections"
          :key="'conn-' + i"
          :x1="conn.x1"
          :y1="conn.y1"
          :x2="conn.x2"
          :y2="conn.y2"
          class="connection-line"
        />
        <!-- Drag preview line -->
        <line
          v-if="isDragging && dragStart && dragEnd"
          :x1="dragStart.x"
          :y1="dragStart.y"
          :x2="dragEnd.x"
          :y2="dragEnd.y"
          class="drag-line"
        />
      </svg>

      <!-- Circles -->
      <div
        v-for="(circle, i) in circles"
        :key="i"
        class="circle"
        :class="{ selected: circle === selectedCircle }"
        :style="{
          left: `${circle.x}px`,
          top: `${circle.y}px`,
          width: `${circle.radius * 2}px`,
          height: `${circle.radius * 2}px`,
          backgroundColor: circle.color,
          transform: 'translate(-50%, -50%)',
        }"
      >
        <!-- Center handle for dragging connections -->
        <div class="center-handle"></div>
      </div>
    </div>

    <div class="info">
      {{ circles.length }} Kreise | {{ connections.length }} Verbindungen
    </div>
  </div>
</template>

<style scoped>
.canvas-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
}

.hint {
  font-size: 0.75rem;
  color: #6b7280;
}

.delete-btn {
  padding: 4px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.delete-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.delete-btn:hover:not(:disabled) {
  background: #dc2626;
}

.canvas {
  position: relative;
  width: 100%;
  height: 400px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: crosshair;
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connection-line {
  stroke: #6b7280;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
}

.drag-line {
  stroke: #3b82f6;
  stroke-width: 2;
  stroke-dasharray: 3, 3;
}

.circle {
  position: absolute;
  border-radius: 50%;
  cursor: pointer;
  transition: box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle:hover {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.circle.selected {
  box-shadow: 0 0 0 4px #3b82f6;
}

.center-handle {
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #374151;
  border-radius: 50%;
  cursor: grab;
  opacity: 0.8;
  transition: transform 0.2s, opacity 0.2s;
}

.center-handle:hover {
  transform: scale(1.3);
  opacity: 1;
}

.info {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}
</style>
