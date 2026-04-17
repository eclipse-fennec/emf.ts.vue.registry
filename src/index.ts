// Types
export * from './types';

// Registry
export { ComponentRegistry, componentRegistry } from './registry/ComponentRegistry';
export * from './registry/matchers';

// Decorators
export {
  decoratorRegistry,
  RegisterFor,
  ForEClass,
  ForEAttribute,
  ForEEnum,
  ForEReference,
  ForFeature,
} from './decorators';
export type { ForEReferenceOptions } from './decorators';

// Configuration
export {
  ConfigLoader,
  createViteConfigLoader,
  createConfigLoader,
  validateConfig,
} from './config';
export type {
  RendererConfig,
  ComponentConfig,
  TargetConfig,
  DefaultsConfig,
  ComponentResolver,
} from './config';

// Components
export {
  EStringEditor,
  EIntEditor,
  EBooleanEditor,
  EDateEditor,
  EEnumEditor,
  EReferenceEditor,
  ObjectComposer,
} from './components';

// Composables
export {
  useComponentRegistry,
  useEObject,
  useFeatureValue,
  useInstanceHolder,
  COMPONENT_REGISTRY_KEY,
  INSTANCE_HOLDER_KEY,
} from './composables';
export type {
  UseEObjectOptions,
  UseFeatureValueOptions,
  UseFeatureValueReturn,
  InstanceHolder,
} from './composables';

// Plugin
export {
  EmftsRendererPlugin,
  createComponentRegistry,
} from './plugin';
export type { EmftsRendererPluginOptions } from './plugin';

// Default export is the plugin
export { default } from './plugin';
