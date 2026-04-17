<script setup lang="ts">
import { computed } from 'vue';
import type { Circle } from '../model/CircleModel';
import { radiusFeature, colorFeature, xFeature, yFeature } from '../model/CircleModel';

/**
 * Visual preview of a Circle.
 */
interface Props {
  circle: Circle;
}

const props = defineProps<Props>();

const radius = computed(() => props.circle.eGet(radiusFeature) as number);
const color = computed(() => props.circle.eGet(colorFeature) as string);
const x = computed(() => props.circle.eGet(xFeature) as number);
const y = computed(() => props.circle.eGet(yFeature) as number);

const circleStyle = computed(() => ({
  width: `${radius.value * 2}px`,
  height: `${radius.value * 2}px`,
  backgroundColor: color.value,
  left: `${x.value - radius.value}px`,
  top: `${y.value - radius.value}px`,
}));
</script>

<template>
  <div class="preview-container">
    <h3>Vorschau</h3>
    <div class="canvas">
      <div class="circle" :style="circleStyle"></div>
      <div class="crosshair" :style="{ left: `${x}px`, top: `${y}px` }"></div>
    </div>
    <div class="info">
      <span>Position: ({{ x }}, {{ y }})</span>
      <span>Radius: {{ radius }}px</span>
      <span>Farbe: {{ color }}</span>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}

.preview-container h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  color: #374151;
}

.canvas {
  position: relative;
  width: 300px;
  height: 300px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  transition: all 0.2s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.crosshair {
  position: absolute;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  margin-top: -5px;
  border: 2px solid #ef4444;
  border-radius: 50%;
  background: white;
  z-index: 10;
}

.crosshair::before,
.crosshair::after {
  content: '';
  position: absolute;
  background: #ef4444;
}

.crosshair::before {
  width: 1px;
  height: 20px;
  left: 50%;
  top: -8px;
  transform: translateX(-50%);
}

.crosshair::after {
  width: 20px;
  height: 1px;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
}

.info {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.75rem;
  color: #6b7280;
}

.info span {
  background: #e5e7eb;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
