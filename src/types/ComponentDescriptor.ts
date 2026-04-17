import type { Component, DefineComponent } from 'vue';
import type { MatchContext, MatchResult } from './MatchContext';

/**
 * Describes a registered component that can render EMF elements.
 */
export interface ComponentDescriptor<P = unknown> {
  /** Unique identifier for this descriptor */
  id: string;

  /** The Vue component */
  component: Component<P> | DefineComponent<P, unknown, unknown>;

  /**
   * Determine if this component can handle the given context.
   * Returns match result with priority.
   */
  canHandle(context: MatchContext): MatchResult;

  /** Optional display name for debugging/UI */
  displayName?: string;

  /** Optional description */
  description?: string;

  /** Component category (editor, viewer, custom) */
  category?: ComponentCategory;
}

/**
 * Categories for component descriptors.
 */
export type ComponentCategory = 'editor' | 'viewer' | 'custom';

/**
 * Options for registering a component.
 */
export interface RegistrationOptions {
  /** Priority override */
  priority?: number;

  /** Category for the component */
  category?: ComponentCategory;

  /** Custom matcher function (overrides default target-based matching) */
  matcher?: (context: MatchContext) => MatchResult;

  /** Replace existing registration with same target */
  replace?: boolean;

  /** Display name for debugging */
  displayName?: string;

  /** Description */
  description?: string;
}
