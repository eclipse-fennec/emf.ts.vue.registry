import type {
  EObject,
  EClass,
  EStructuralFeature,
  EAttribute,
  EReference,
  EEnum,
  EPackage,
} from 'emfts';

/**
 * Context provided when matching components.
 * Contains all information needed to determine which component should render an element.
 */
export interface MatchContext {
  /** The EObject instance being rendered (if available) */
  eObject?: EObject;

  /** The EClass being rendered */
  eClass?: EClass;

  /** The structural feature being rendered (for attribute/reference editors) */
  feature?: EStructuralFeature;

  /** The attribute being rendered (narrower type than feature) */
  attribute?: EAttribute;

  /** The reference being rendered (narrower type than feature) */
  reference?: EReference;

  /** The enum type (if the attribute is an enum) */
  enumType?: EEnum;

  /** The containing package */
  ePackage?: EPackage;

  /** Custom context data for application-specific matching */
  custom?: Record<string, unknown>;
}

/**
 * Result of a component match with priority score.
 */
export interface MatchResult {
  /** Whether the component can handle this context */
  matches: boolean;

  /** Priority score (higher = more specific match) */
  priority: number;
}

/**
 * Create a non-matching result.
 */
export function noMatch(): MatchResult {
  return { matches: false, priority: 0 };
}

/**
 * Create a matching result with the given priority.
 */
export function match(priority: number): MatchResult {
  return { matches: true, priority };
}
