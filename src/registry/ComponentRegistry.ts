import type { Component } from 'vue';
import type { EObject, EClass, EStructuralFeature, EAttribute, EReference, EEnum } from '@emfts/core';
import type {
  ComponentDescriptor,
  MatchContext,
  MatchResult,
  RegistrationOptions,
  RegistrationTarget,
} from '../types';
import { Priority, noMatch, match } from '../types';
import {
  EClassMatcher,
  EAttributeTypeMatcher,
  EEnumMatcher,
  EReferenceMatcher,
  FeatureMatcher,
} from './matchers';

/**
 * Internal registry entry that combines descriptor with target and options.
 */
interface RegistryEntry {
  descriptor: ComponentDescriptor;
  target: RegistrationTarget;
  options: RegistrationOptions;
}

let descriptorIdCounter = 0;

/**
 * Generate a unique descriptor ID.
 */
function generateId(): string {
  return `descriptor-${++descriptorIdCounter}`;
}

/**
 * Central registry for Vue components that render EMF elements.
 * Supports priority-based component selection with multiple registration methods.
 */
export class ComponentRegistry {
  private entries: RegistryEntry[] = [];
  private instanceOverrides: WeakMap<EObject, ComponentDescriptor> = new WeakMap();

  /**
   * Register a component for a specific target.
   * @returns Unregister function
   */
  register(
    component: Component,
    target: RegistrationTarget,
    options: RegistrationOptions = {}
  ): () => void {
    const descriptor = this.createDescriptor(component, target, options);
    const entry: RegistryEntry = { descriptor, target, options };

    if (options.replace) {
      this.entries = this.entries.filter((e) => !this.targetsEqual(e.target, target));
    }

    this.entries.push(entry);

    return () => this.unregister(descriptor.id);
  }

  /**
   * Register for a specific EObject instance (highest priority).
   * @returns Unregister function
   */
  registerForInstance(eObject: EObject, component: Component): () => void {
    const descriptor = this.createDescriptor(
      component,
      { type: 'instance', eObject },
      { priority: Priority.INSTANCE }
    );
    this.instanceOverrides.set(eObject, descriptor);
    return () => {
      this.instanceOverrides.delete(eObject);
    };
  }

  /**
   * Register for an EClass (all instances of that class).
   * @returns Unregister function
   */
  registerForEClass(
    eClass: EClass,
    component: Component,
    options?: RegistrationOptions
  ): () => void {
    return this.register(
      component,
      { type: 'eclass', eClass },
      { priority: Priority.ECLASS, ...options }
    );
  }

  /**
   * Register for a data type (e.g., EString, EInt).
   * @returns Unregister function
   */
  registerForDataType(
    dataTypeName: string,
    component: Component,
    options?: RegistrationOptions
  ): () => void {
    return this.register(
      component,
      { type: 'datatype', dataTypeName },
      { priority: Priority.DATA_TYPE, ...options }
    );
  }

  /**
   * Register for enum types.
   * @param component - The Vue component
   * @param enumName - Optional specific enum name (matches all enums if not specified)
   * @returns Unregister function
   */
  registerForEnum(
    component: Component,
    enumName?: string,
    options?: RegistrationOptions
  ): () => void {
    return this.register(
      component,
      { type: 'enum', enumName },
      { priority: Priority.DATA_TYPE, ...options }
    );
  }

  /**
   * Register for references.
   * @returns Unregister function
   */
  registerForReference(
    component: Component,
    options?: RegistrationOptions & {
      containment?: boolean;
      targetClass?: EClass;
    }
  ): () => void {
    return this.register(
      component,
      {
        type: 'reference',
        containment: options?.containment,
        targetClass: options?.targetClass,
      },
      { priority: Priority.DATA_TYPE, ...options }
    );
  }

  /**
   * Register for a specific feature of an EClass.
   * @returns Unregister function
   */
  registerForFeature(
    eClass: EClass,
    featureName: string,
    component: Component,
    options?: RegistrationOptions
  ): () => void {
    return this.register(
      component,
      { type: 'feature', eClass, featureName },
      { priority: Priority.FEATURE, ...options }
    );
  }

  /**
   * Get the best matching component for a context.
   */
  getComponent(context: MatchContext): Component | undefined {
    // Check instance overrides first (highest priority)
    if (context.eObject) {
      const instanceOverride = this.instanceOverrides.get(context.eObject);
      if (instanceOverride) {
        return instanceOverride.component;
      }
    }

    // Find all matching components with their priorities
    const matches = this.entries
      .map((entry) => ({
        entry,
        result: entry.descriptor.canHandle(context),
      }))
      .filter((m) => m.result.matches)
      .sort((a, b) => b.result.priority - a.result.priority);

    return matches[0]?.entry.descriptor.component;
  }

  /**
   * Get component for an EStructuralFeature.
   */
  getComponentForFeature(
    feature: EStructuralFeature,
    eObject?: EObject
  ): Component | undefined {
    const context: MatchContext = { feature, eObject };

    // Determine if it's an attribute or reference
    if (this.isEAttribute(feature)) {
      context.attribute = feature as EAttribute;
      const eType = feature.getEType?.();
      if (eType && this.isEEnum(eType)) {
        context.enumType = eType as EEnum;
      }
    } else if (this.isEReference(feature)) {
      context.reference = feature as EReference;
    }

    if (eObject) {
      context.eClass = eObject.eClass?.();
    } else {
      const containingClass = feature.getEContainingClass?.();
      if (containingClass) {
        context.eClass = containingClass;
      }
    }

    return this.getComponent(context);
  }

  /**
   * Get component for rendering an EClass (object editor).
   */
  getComponentForEClass(eClass: EClass, eObject?: EObject): Component | undefined {
    return this.getComponent({ eClass, eObject });
  }

  /**
   * Unregister by descriptor ID.
   */
  unregister(id: string): boolean {
    const initialLength = this.entries.length;
    this.entries = this.entries.filter((e) => e.descriptor.id !== id);
    return this.entries.length !== initialLength;
  }

  /**
   * Get all registered descriptors.
   */
  getAll(): ComponentDescriptor[] {
    return this.entries.map((e) => e.descriptor);
  }

  /**
   * Clear all registrations.
   */
  clear(): void {
    this.entries = [];
    this.instanceOverrides = new WeakMap();
  }

  /**
   * Get the number of registered components.
   */
  get size(): number {
    return this.entries.length;
  }

  /**
   * Create a component descriptor from component, target, and options.
   */
  private createDescriptor(
    component: Component,
    target: RegistrationTarget,
    options: RegistrationOptions
  ): ComponentDescriptor {
    const id = generateId();

    // If custom matcher is provided, use it
    if (options.matcher) {
      return {
        id,
        component,
        canHandle: options.matcher,
        displayName: options.displayName,
        description: options.description,
        category: options.category,
      };
    }

    // Create matcher based on target type
    const matcher = this.createMatcher(target, options.priority);

    return {
      id,
      component,
      canHandle: matcher,
      displayName: options.displayName,
      description: options.description,
      category: options.category,
    };
  }

  /**
   * Create a matcher function based on registration target.
   */
  private createMatcher(
    target: RegistrationTarget,
    priorityOverride?: number
  ): (context: MatchContext) => MatchResult {
    switch (target.type) {
      case 'eclass': {
        const matcher = new EClassMatcher(target.eClass);
        return (ctx) => {
          const result = matcher.match(ctx);
          if (result.matches && priorityOverride !== undefined) {
            return { matches: true, priority: priorityOverride };
          }
          return result;
        };
      }

      case 'datatype': {
        const matcher = new EAttributeTypeMatcher(target.dataTypeName);
        return (ctx) => {
          const result = matcher.match(ctx);
          if (result.matches && priorityOverride !== undefined) {
            return { matches: true, priority: priorityOverride };
          }
          return result;
        };
      }

      case 'enum': {
        const matcher = new EEnumMatcher(target.enumName);
        return (ctx) => {
          const result = matcher.match(ctx);
          if (result.matches && priorityOverride !== undefined) {
            return { matches: true, priority: priorityOverride };
          }
          return result;
        };
      }

      case 'reference': {
        const matcher = new EReferenceMatcher(target.containment, target.targetClass);
        return (ctx) => {
          const result = matcher.match(ctx);
          if (result.matches && priorityOverride !== undefined) {
            return { matches: true, priority: priorityOverride };
          }
          return result;
        };
      }

      case 'feature': {
        const matcher = new FeatureMatcher(target.eClass, target.featureName);
        return (ctx) => {
          const result = matcher.match(ctx);
          if (result.matches && priorityOverride !== undefined) {
            return { matches: true, priority: priorityOverride };
          }
          return result;
        };
      }

      case 'instance': {
        return (ctx) => {
          if (ctx.eObject === target.eObject) {
            return match(priorityOverride ?? Priority.INSTANCE);
          }
          return noMatch();
        };
      }

      case 'custom': {
        return target.matcher;
      }

      default:
        return () => noMatch();
    }
  }

  /**
   * Compare two registration targets for equality.
   */
  private targetsEqual(a: RegistrationTarget, b: RegistrationTarget): boolean {
    if (a.type !== b.type) return false;

    switch (a.type) {
      case 'eclass':
        return a.eClass === (b as typeof a).eClass;
      case 'datatype':
        return a.dataTypeName === (b as typeof a).dataTypeName;
      case 'enum':
        return a.enumName === (b as typeof a).enumName;
      case 'reference':
        return (
          a.containment === (b as typeof a).containment &&
          a.targetClass === (b as typeof a).targetClass
        );
      case 'feature':
        return (
          a.eClass === (b as typeof a).eClass &&
          a.featureName === (b as typeof a).featureName
        );
      case 'instance':
        return a.eObject === (b as typeof a).eObject;
      default:
        return false;
    }
  }

  /**
   * Check if value is an EAttribute.
   */
  private isEAttribute(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    return (
      'getEAttributeType' in value ||
      ('eClass' in value &&
        typeof (value as { eClass: () => { getName: () => string } }).eClass === 'function' &&
        (value as { eClass: () => { getName: () => string } }).eClass()?.getName?.() ===
          'EAttribute')
    );
  }

  /**
   * Check if value is an EReference.
   */
  private isEReference(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    return (
      'getEReferenceType' in value ||
      'isContainment' in value ||
      ('eClass' in value &&
        typeof (value as { eClass: () => { getName: () => string } }).eClass === 'function' &&
        (value as { eClass: () => { getName: () => string } }).eClass()?.getName?.() ===
          'EReference')
    );
  }

  /**
   * Check if value is an EEnum.
   */
  private isEEnum(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    return (
      'getELiterals' in value ||
      ('eClass' in value &&
        typeof (value as { eClass: () => { getName: () => string } }).eClass === 'function' &&
        (value as { eClass: () => { getName: () => string } }).eClass()?.getName?.() === 'EEnum')
    );
  }
}

/**
 * Global singleton instance of the component registry.
 */
export const componentRegistry = new ComponentRegistry();
