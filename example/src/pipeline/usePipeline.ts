import { ref, computed } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import {
  createComponent,
  getDisplayName,
  findClass,
  type EClass,
  type EObject,
} from '../model/RedpandaModel';

const NODE_GAP = 280;
const NODE_Y = 120;

export function usePipeline() {
  const input = ref<EObject>(createComponent(findClass('GenerateInput')));
  const processors = ref<EObject[]>([]);
  const output = ref<EObject>(createComponent(findClass('StdoutOutput')));
  const buffer = ref<EObject | null>(null);
  const selectedNodeId = ref<string | null>(null);
  const version = ref(0);

  function bump() {
    version.value++;
  }

  const nodes = computed<Node[]>(() => {
    void version.value;
    const result: Node[] = [];
    let x = 50;

    result.push({
      id: 'input',
      type: 'pipelineInput',
      position: { x, y: NODE_Y },
      data: { eObject: input.value, label: getDisplayName(input.value), category: 'input' },
    });
    x += NODE_GAP;

    if (buffer.value) {
      result.push({
        id: 'buffer',
        type: 'pipelineBuffer',
        position: { x, y: NODE_Y },
        data: { eObject: buffer.value, label: getDisplayName(buffer.value), category: 'buffer' },
      });
      x += NODE_GAP;
    }

    for (let i = 0; i < processors.value.length; i++) {
      const proc = processors.value[i];
      result.push({
        id: `proc-${i}`,
        type: 'pipelineProcessor',
        position: { x, y: NODE_Y },
        data: { eObject: proc, label: getDisplayName(proc), category: 'processor', index: i },
      });
      x += NODE_GAP;
    }

    result.push({
      id: 'output',
      type: 'pipelineOutput',
      position: { x, y: NODE_Y },
      data: { eObject: output.value, label: getDisplayName(output.value), category: 'output' },
    });

    return result;
  });

  const edges = computed<Edge[]>(() => {
    void version.value;
    const ids = nodes.value.map(n => n.id);
    return ids.slice(0, -1).map((id, i) => ({
      id: `e-${id}-${ids[i + 1]}`,
      source: id,
      target: ids[i + 1],
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    }));
  });

  const selectedEObject = computed<EObject | null>(() => {
    void version.value;
    if (!selectedNodeId.value) return null;
    const node = nodes.value.find(n => n.id === selectedNodeId.value);
    return node?.data?.eObject ?? null;
  });

  const selectedCategory = computed<string | null>(() => {
    if (!selectedNodeId.value) return null;
    const node = nodes.value.find(n => n.id === selectedNodeId.value);
    return node?.data?.category ?? null;
  });

  function setInput(eClass: EClass) {
    input.value = createComponent(eClass);
    selectedNodeId.value = 'input';
    bump();
  }

  function setOutput(eClass: EClass) {
    output.value = createComponent(eClass);
    selectedNodeId.value = 'output';
    bump();
  }

  function addProcessor(eClass: EClass) {
    const proc = createComponent(eClass);
    processors.value = [...processors.value, proc];
    selectedNodeId.value = `proc-${processors.value.length - 1}`;
    bump();
  }

  function removeProcessor(index: number) {
    processors.value = processors.value.filter((_, i) => i !== index);
    if (selectedNodeId.value === `proc-${index}`) {
      selectedNodeId.value = null;
    }
    bump();
  }

  function toggleBuffer(eClass: EClass | null) {
    buffer.value = eClass ? createComponent(eClass) : null;
    if (eClass) selectedNodeId.value = 'buffer';
    else if (selectedNodeId.value === 'buffer') selectedNodeId.value = null;
    bump();
  }

  function selectNode(id: string | null) {
    selectedNodeId.value = id;
  }

  return {
    input, processors, output, buffer,
    nodes, edges,
    selectedNodeId, selectedEObject, selectedCategory,
    version, bump,
    setInput, setOutput, addProcessor, removeProcessor, toggleBuffer, selectNode,
  };
}
