import { inject, type Component } from 'vue';
import type { EObject, EClass, EStructuralFeature } from '@emfts/core';
import { ComponentRegistry, componentRegistry } from '../registry/ComponentRegistry';
import type { MatchContext } from '../types';

/**
 * Injection key for the component registry.
 */
export const COMPONENT_REGISTRY_KEY = Symbol('componentRegistry');

/**
 * Composable to access the component registry.
 *
 * @example
 * ```typescript
 * const { getComponentForFeature, getComponentForEClass } = useComponentRegistry();
 *
 * // Get component for a feature
 * const EditorComponent = getComponentForFeature(feature, eObject);
 *
 * // Get component for a class
 * const ClassEditor = getComponentForEClass(eClass);
 * ```
 */
export function useComponentRegistry() {
  // Try to inject registry, fall back to global singleton
  const registry =
    inject<ComponentRegistry>(COMPONENT_REGISTRY_KEY) ?? componentRegistry;

  /**
   * Get the best matching component for a context.
   */
  function getComponent(context: MatchContext): Component | undefined {
    return registry.getComponent(context);
  }

  /**
   * Get component for an EStructuralFeature.
   */
  function getComponentForFeature(
    feature: EStructuralFeature,
    eObject?: EObject
  ): Component | undefined {
    return registry.getComponentForFeature(feature, eObject);
  }

  /**
   * Get component for rendering an EClass (object editor).
   */
  function getComponentForEClass(
    eClass: EClass,
    eObject?: EObject
  ): Component | undefined {
    return registry.getComponentForEClass(eClass, eObject);
  }

  /**
   * Register a component for a target.
   * Returns an unregister function.
   */
  function register(
    component: Component,
    target: Parameters<ComponentRegistry['register']>[1],
    options?: Parameters<ComponentRegistry['register']>[2]
  ): () => void {
    return registry.register(component, target, options);
  }

  /**
   * Register for a specific instance.
   */
  function registerForInstance(
    eObject: EObject,
    component: Component
  ): () => void {
    return registry.registerForInstance(eObject, component);
  }

  /**
   * Register for an EClass.
   */
  function registerForEClass(
    eClass: EClass,
    component: Component,
    options?: Parameters<ComponentRegistry['registerForEClass']>[2]
  ): () => void {
    return registry.registerForEClass(eClass, component, options);
  }

  /**
   * Register for a data type.
   */
  function registerForDataType(
    dataTypeName: string,
    component: Component,
    options?: Parameters<ComponentRegistry['registerForDataType']>[2]
  ): () => void {
    return registry.registerForDataType(dataTypeName, component, options);
  }

  /**
   * Register for enums.
   */
  function registerForEnum(
    component: Component,
    enumName?: string,
    options?: Parameters<ComponentRegistry['registerForEnum']>[2]
  ): () => void {
    return registry.registerForEnum(component, enumName, options);
  }

  /**
   * Register for references.
   */
  function registerForReference(
    component: Component,
    options?: Parameters<ComponentRegistry['registerForReference']>[1]
  ): () => void {
    return registry.registerForReference(component, options);
  }

  /**
   * Register for a specific feature.
   */
  function registerForFeature(
    eClass: EClass,
    featureName: string,
    component: Component,
    options?: Parameters<ComponentRegistry['registerForFeature']>[3]
  ): () => void {
    return registry.registerForFeature(eClass, featureName, component, options);
  }

  return {
    registry,
    getComponent,
    getComponentForFeature,
    getComponentForEClass,
    register,
    registerForInstance,
    registerForEClass,
    registerForDataType,
    registerForEnum,
    registerForReference,
    registerForFeature,
  };
}
