import type { EClass, EDataType, EEnum, EObject } from '@emfts/core';
import type { MatchContext, MatchResult } from './MatchContext';

/**
 * Target for registration - what this component handles.
 */
export type RegistrationTarget =
  | EClassTarget
  | DataTypeTarget
  | EnumTarget
  | ReferenceTarget
  | FeatureTarget
  | InstanceTarget
  | CustomTarget;

/**
 * Target for all instances of an EClass.
 */
export interface EClassTarget {
  type: 'eclass';
  eClass: EClass;
}

/**
 * Target for attributes of a specific data type.
 */
export interface DataTypeTarget {
  type: 'datatype';
  /** The data type instance (optional) */
  dataType?: EDataType;
  /** The data type name for matching (e.g., 'EString', 'EInt') */
  dataTypeName: string;
}

/**
 * Target for enum attributes.
 */
export interface EnumTarget {
  type: 'enum';
  /** Specific enum type (optional - if not set, matches all enums) */
  enumType?: EEnum;
  /** Enum name for matching */
  enumName?: string;
}

/**
 * Target for references.
 */
export interface ReferenceTarget {
  type: 'reference';
  /** Match only containment references */
  containment?: boolean;
  /** Match only references to specific target class */
  targetClass?: EClass;
}

/**
 * Target for a specific feature of an EClass.
 */
export interface FeatureTarget {
  type: 'feature';
  eClass: EClass;
  featureName: string;
}

/**
 * Target for a specific EObject instance (highest priority).
 */
export interface InstanceTarget {
  type: 'instance';
  eObject: EObject;
}

/**
 * Custom target with user-defined matcher.
 */
export interface CustomTarget {
  type: 'custom';
  matcher: (context: MatchContext) => MatchResult;
}

/**
 * Lazy target for deferred resolution (used by decorators).
 */
export type LazyTarget =
  | { type: 'eclass-by-name'; className: string; packageNsUri?: string }
  | { type: 'enum-by-name'; enumName: string; packageNsUri?: string }
  | { type: 'feature-by-name'; className: string; featureName: string; packageNsUri?: string };
