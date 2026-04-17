/**
 * Priority levels for component selection.
 * Higher values take precedence.
 */
export enum Priority {
  /** Fallback/default component */
  DEFAULT = 0,

  /** Generic type match (e.g., all EString attributes) */
  DATA_TYPE = 100,

  /** EClass match (e.g., all Person instances) */
  ECLASS = 200,

  /** Feature-specific match (e.g., Person.name attribute) */
  FEATURE = 300,

  /** Package-specific match */
  PACKAGE = 400,

  /** Specific instance match */
  INSTANCE = 500,

  /** User/runtime override */
  OVERRIDE = 1000,
}

/**
 * Calculate combined priority from base priority and modifiers.
 * @param base - The base priority level
 * @param modifiers - Additional priority modifiers (e.g., exact match bonus)
 */
export function calculatePriority(base: Priority, modifiers: number = 0): number {
  return base + modifiers;
}
