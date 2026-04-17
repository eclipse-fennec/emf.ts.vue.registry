import type { App, Plugin } from 'vue';
import { componentRegistry, ComponentRegistry } from '../registry/ComponentRegistry';
import { decoratorRegistry } from '../decorators/DecoratorRegistry';
import { COMPONENT_REGISTRY_KEY } from '../composables/useComponentRegistry';
import { INSTANCE_HOLDER_KEY, useInstanceHolder } from '../composables/useInstanceHolder';

// Default components
import EStringEditor from '../components/defaults/EStringEditor.vue';
import EIntEditor from '../components/defaults/EIntEditor.vue';
import EBooleanEditor from '../components/defaults/EBooleanEditor.vue';
import EDateEditor from '../components/defaults/EDateEditor.vue';
import EEnumEditor from '../components/defaults/EEnumEditor.vue';
import EReferenceEditor from '../components/defaults/EReferenceEditor.vue';
import ObjectComposer from '../components/ObjectComposer.vue';

/**
 * Plugin options for EmftsRendererPlugin.
 */
export interface EmftsRendererPluginOptions {
  /** Whether to register default components (default: true) */
  registerDefaults?: boolean;

  /** Use a custom registry instead of the global singleton */
  registry?: ComponentRegistry;

  /** Whether to provide an instance holder (default: true) */
  provideInstanceHolder?: boolean;

  /** Register ObjectComposer as a global component (default: false) */
  globalComposer?: boolean;

  /** Prefix for global component names (default: 'Emfts') */
  componentPrefix?: string;
}

/**
 * Register default components in the registry.
 */
function registerDefaultComponents(registry: ComponentRegistry): void {
  // String attributes
  registry.registerForDataType('EString', EStringEditor);
  registry.registerForDataType('String', EStringEditor);

  // Integer attributes
  registry.registerForDataType('EInt', EIntEditor);
  registry.registerForDataType('EInteger', EIntEditor);
  registry.registerForDataType('EShort', EIntEditor);
  registry.registerForDataType('EByte', EIntEditor);
  registry.registerForDataType('ELong', EIntEditor);
  registry.registerForDataType('int', EIntEditor);

  // Float attributes
  registry.registerForDataType('EFloat', EIntEditor);
  registry.registerForDataType('EDouble', EIntEditor);
  registry.registerForDataType('float', EIntEditor);
  registry.registerForDataType('double', EIntEditor);

  // Boolean attributes
  registry.registerForDataType('EBoolean', EBooleanEditor);
  registry.registerForDataType('boolean', EBooleanEditor);

  // Date attributes
  registry.registerForDataType('EDate', EDateEditor);
  registry.registerForDataType('Date', EDateEditor);

  // Enum attributes (matches all enums)
  registry.registerForEnum(EEnumEditor);

  // References (matches all references)
  registry.registerForReference(EReferenceEditor);
}

/**
 * Vue plugin for EMFTS Vue Registry.
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue';
 * import { EmftsRendererPlugin } from 'emfts-vue-registry';
 *
 * const app = createApp(App);
 *
 * // Basic usage - registers defaults
 * app.use(EmftsRendererPlugin);
 *
 * // With options
 * app.use(EmftsRendererPlugin, {
 *   registerDefaults: true,
 *   globalComposer: true,
 * });
 *
 * app.mount('#app');
 * ```
 */
export const EmftsRendererPlugin: Plugin<EmftsRendererPluginOptions[]> = {
  install(app: App, options: EmftsRendererPluginOptions = {}) {
    const {
      registerDefaults = true,
      registry = componentRegistry,
      provideInstanceHolder = true,
      globalComposer = false,
      componentPrefix = 'Emfts',
    } = options;

    // Provide the component registry
    app.provide(COMPONENT_REGISTRY_KEY, registry);

    // Also provide as 'componentRegistry' for backwards compatibility
    app.provide('componentRegistry', registry);

    // Provide instance holder if enabled
    if (provideInstanceHolder) {
      const instanceHolder = useInstanceHolder();
      app.provide(INSTANCE_HOLDER_KEY, instanceHolder);
      app.provide('instanceHolder', instanceHolder);
    }

    // Register default components
    if (registerDefaults) {
      registerDefaultComponents(registry);
    }

    // Register global components
    if (globalComposer) {
      app.component(`${componentPrefix}ObjectComposer`, ObjectComposer);
    }

    // Add $emfts property to component instances
    app.config.globalProperties.$emfts = {
      registry,
      decoratorRegistry,
    };
  },
};

/**
 * Create a new ComponentRegistry instance.
 * Useful for testing or isolated registry needs.
 */
export function createComponentRegistry(): ComponentRegistry {
  return new ComponentRegistry();
}

export default EmftsRendererPlugin;
