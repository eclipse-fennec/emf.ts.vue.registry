/**
 * JSON schema for component registry configuration.
 */
export interface RendererConfig {
  /** Version for future compatibility */
  version: '1.0';

  /** Component registrations */
  components: ComponentConfig[];

  /** Default settings */
  defaults?: DefaultsConfig;
}

/**
 * Configuration for a single component registration.
 */
export interface ComponentConfig {
  /** Unique ID for this registration */
  id: string;

  /** Path to the Vue component (relative or module path) */
  component: string;

  /** What this component handles */
  target: TargetConfig;

  /** Optional priority override */
  priority?: number;

  /** Category */
  category?: 'editor' | 'viewer' | 'custom';

  /** Whether this is enabled */
  enabled?: boolean;

  /** Display name for debugging */
  displayName?: string;

  /** Description */
  description?: string;
}

/**
 * Target configuration for what a component handles.
 */
export type TargetConfig =
  | EClassTargetConfig
  | DataTypeTargetConfig
  | EnumTargetConfig
  | ReferenceTargetConfig
  | FeatureTargetConfig
  | CustomTargetConfig;

/**
 * Target configuration for EClass-based components.
 */
export interface EClassTargetConfig {
  type: 'eclass';
  className: string;
  packageNsUri?: string;
}

/**
 * Target configuration for data type-based components.
 */
export interface DataTypeTargetConfig {
  type: 'datatype';
  typeName: string;
}

/**
 * Target configuration for enum-based components.
 */
export interface EnumTargetConfig {
  type: 'enum';
  enumName?: string;
  packageNsUri?: string;
}

/**
 * Target configuration for reference-based components.
 */
export interface ReferenceTargetConfig {
  type: 'reference';
  containment?: boolean;
  targetClassName?: string;
  targetPackageNsUri?: string;
}

/**
 * Target configuration for feature-specific components.
 */
export interface FeatureTargetConfig {
  type: 'feature';
  className: string;
  featureName: string;
  packageNsUri?: string;
}

/**
 * Target configuration for custom matchers.
 */
export interface CustomTargetConfig {
  type: 'custom';
  /** Expression that evaluates to a matcher function */
  matcherExpression?: string;
}

/**
 * Default component settings.
 */
export interface DefaultsConfig {
  /** Default component for EClass (object editor) */
  eclassEditor?: string;

  /** Default component for unknown attributes */
  attributeEditor?: string;

  /** Default component for references */
  referenceEditor?: string;

  /** Default component for enums */
  enumEditor?: string;

  /** Default component for strings */
  stringEditor?: string;

  /** Default component for integers */
  intEditor?: string;

  /** Default component for booleans */
  booleanEditor?: string;

  /** Default component for dates */
  dateEditor?: string;
}

/**
 * Validate a renderer configuration.
 */
export function validateConfig(config: unknown): config is RendererConfig {
  if (!config || typeof config !== 'object') return false;

  const c = config as Record<string, unknown>;

  if (c.version !== '1.0') return false;
  if (!Array.isArray(c.components)) return false;

  for (const comp of c.components) {
    if (!validateComponentConfig(comp)) return false;
  }

  return true;
}

/**
 * Validate a component configuration.
 */
function validateComponentConfig(config: unknown): config is ComponentConfig {
  if (!config || typeof config !== 'object') return false;

  const c = config as Record<string, unknown>;

  if (typeof c.id !== 'string') return false;
  if (typeof c.component !== 'string') return false;
  if (!c.target || typeof c.target !== 'object') return false;

  return validateTargetConfig(c.target);
}

/**
 * Validate a target configuration.
 */
function validateTargetConfig(config: unknown): config is TargetConfig {
  if (!config || typeof config !== 'object') return false;

  const c = config as Record<string, unknown>;
  const validTypes = ['eclass', 'datatype', 'enum', 'reference', 'feature', 'custom'];

  if (typeof c.type !== 'string' || !validTypes.includes(c.type)) return false;

  switch (c.type) {
    case 'eclass':
      return typeof c.className === 'string';
    case 'datatype':
      return typeof c.typeName === 'string';
    case 'feature':
      return typeof c.className === 'string' && typeof c.featureName === 'string';
    default:
      return true;
  }
}
