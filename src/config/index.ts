export type {
  RendererConfig,
  ComponentConfig,
  TargetConfig,
  EClassTargetConfig,
  DataTypeTargetConfig,
  EnumTargetConfig,
  ReferenceTargetConfig,
  FeatureTargetConfig,
  CustomTargetConfig,
  DefaultsConfig,
} from './ConfigSchema';
export { validateConfig } from './ConfigSchema';
export {
  ConfigLoader,
  createViteConfigLoader,
  createConfigLoader,
} from './ConfigLoader';
export type { ComponentResolver } from './ConfigLoader';
