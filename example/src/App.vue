<script setup lang="ts">
import { ref, computed } from 'vue';
import { useComponentRegistry } from '../../src/composables/useComponentRegistry';
import { Priority } from '../../src/types/Priority';

// Model
import {
  CircleEClass,
  colorFeature,
  radiusFeature,
  xFeature,
  yFeature,
  connectedToFeature,
  type Circle,
} from './model/CircleModel';

// Components
import ColorPicker from './components/ColorPicker.vue';
import RadiusSlider from './components/RadiusSlider.vue';
import CircleCanvas from './components/CircleCanvas.vue';
import EObjectTree from './components/EObjectTree.vue';
import EClassTree from './components/EClassTree.vue';
import XMIView from './components/XMIView.vue';

// Version counter for reactivity
const version = ref(0);

// Canvas ref
const canvasRef = ref<InstanceType<typeof CircleCanvas> | null>(null);

// Selected circle (from canvas)
const selectedCircle = ref<Circle | null>(null);

// Get the registry
const { registry } = useComponentRegistry();

// Register custom components for specific features
registry.registerForFeature(CircleEClass, 'color', ColorPicker, { priority: Priority.FEATURE });
registry.registerForFeature(CircleEClass, 'radius', RadiusSlider, { priority: Priority.FEATURE });

// Get editable features (exclude connectedTo for now)
const editableFeatures = [radiusFeature, colorFeature, xFeature, yFeature];

// Get component for a feature
function getComponentForFeature(feature: any) {
  if (!selectedCircle.value) return null;
  return registry.getComponentForFeature(feature, selectedCircle.value);
}

// Handle selection change
function onSelect(circle: Circle | null) {
  selectedCircle.value = circle;
  updateVersion();
}

// Force update
function updateVersion() {
  version.value++;
}

// Get all circles from canvas for XMI
const allCircles = computed(() => canvasRef.value?.circles ?? []);
</script>

<template>
  <div class="app">
    <header>
      <h1>Circle Graph Editor</h1>
      <p>EMF-basierter Editor mit Referenzen zwischen Objekten</p>
    </header>

    <main>
      <!-- Canvas -->
      <div class="canvas-panel">
        <CircleCanvas
          ref="canvasRef"
          @select="onSelect"
          @update="updateVersion"
        />
      </div>

      <!-- Editor Panel -->
      <div class="editor-panel">
        <h2>{{ selectedCircle ? 'Eigenschaften' : 'Kein Kreis ausgewählt' }}</h2>

        <template v-if="selectedCircle">
          <div v-for="feature in editableFeatures" :key="feature.getName()" class="feature-editor">
            <component
              :is="getComponentForFeature(feature)"
              v-if="getComponentForFeature(feature)"
              :eObject="selectedCircle"
              :feature="feature"
              :key="version"
              @update="updateVersion"
            />

            <!-- Fallback for features without custom component -->
            <div v-else class="default-editor">
              <label>{{ feature.getName() }} ({{ feature.getEType()?.getName() }})</label>
              <input
                v-if="feature.getEType()?.getName() === 'EInt'"
                type="number"
                :value="selectedCircle.eGet(feature)"
                @input="(e: Event) => { selectedCircle!.eSet(feature, Number((e.target as HTMLInputElement).value)); updateVersion(); }"
              />
              <input
                v-else
                type="text"
                :value="selectedCircle.eGet(feature)"
                @input="(e: Event) => { selectedCircle!.eSet(feature, (e.target as HTMLInputElement).value); updateVersion(); }"
              />
            </div>
          </div>

          <!-- Connections info -->
          <div class="connections-info">
            <h3>Verbindungen</h3>
            <p v-if="(selectedCircle.eGet(connectedToFeature) as any)?.length === 0">
              Keine Verbindungen
            </p>
            <ul v-else>
              <li v-for="(target, i) in (selectedCircle.eGet(connectedToFeature) as any)" :key="i">
                → Kreis bei ({{ target.x }}, {{ target.y }})
              </li>
            </ul>
          </div>
        </template>
      </div>
    </main>

    <!-- Model & XMI Views -->
    <section class="tree-section">
      <div class="tree-grid">
        <div class="tree-panel">
          <h3>Metamodel (EClass)</h3>
          <EClassTree :eClass="CircleEClass" />
        </div>

        <div class="tree-panel">
          <h3>Ausgewählte Instanz</h3>
          <EObjectTree v-if="selectedCircle" :eObject="selectedCircle" :version="version" />
          <p v-else class="no-selection">Kein Kreis ausgewählt</p>
        </div>

        <div class="tree-panel tree-panel-wide">
          <h3>XMI ({{ allCircles.length }} Objekte)</h3>
          <XMIView v-if="allCircles.length > 0" :eObjects="allCircles" :version="version" />
          <p v-else class="no-selection">Keine Kreise vorhanden</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  background: #f3f4f6;
  min-height: 100vh;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

header {
  text-align: center;
  margin-bottom: 24px;
}

header h1 {
  font-size: 1.75rem;
  color: #1f2937;
  margin-bottom: 4px;
}

header p {
  color: #6b7280;
  font-size: 0.875rem;
}

main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  main {
    grid-template-columns: 1fr;
  }
}

.canvas-panel {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.editor-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.editor-panel h2 {
  font-size: 1.125rem;
  color: #374151;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.feature-editor {
  margin-bottom: 8px;
}

.default-editor {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.default-editor label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
}

.default-editor input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.default-editor input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.connections-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.connections-info h3 {
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 8px;
}

.connections-info p {
  font-size: 0.8125rem;
  color: #6b7280;
}

.connections-info ul {
  list-style: none;
  font-size: 0.8125rem;
  color: #374151;
}

.connections-info li {
  padding: 4px 0;
}

.tree-section {
  margin-top: 24px;
}

.tree-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .tree-grid {
    grid-template-columns: 1fr;
  }
}

.tree-panel h3 {
  font-size: 1rem;
  color: #374151;
  margin-bottom: 12px;
}

.tree-panel-wide {
  grid-column: 1 / -1;
}

.no-selection {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  background: #1e1e1e;
  border-radius: 8px;
}
</style>
