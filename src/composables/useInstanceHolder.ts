import { ref, type Ref } from 'vue';
import type { EObject, EClass } from 'emfts';

/**
 * Instance holder for managing EObject instances.
 * Provides functions to register, find, and identify instances.
 */
export interface InstanceHolder {
  /** All registered instances */
  instances: Ref<Map<string, EObject>>;
  /** Get an instance by ID */
  getInstance: (id: string) => EObject | undefined;
  /** Register an instance */
  setInstance: (id: string, eObject: EObject) => void;
  /** Remove an instance */
  removeInstance: (id: string) => boolean;
  /** Find instances by EClass (including subtypes) */
  findInstancesByClass: (eClass: EClass) => Map<string, EObject>;
  /** Get the ID for an instance */
  identify: (eObject: EObject) => string | undefined;
  /** Clear all instances */
  clear: () => void;
}

/**
 * Composable for managing EObject instances.
 *
 * @example
 * ```typescript
 * const { setInstance, findInstancesByClass, identify } = useInstanceHolder();
 *
 * // Register instances
 * setInstance('person-1', person1);
 * setInstance('person-2', person2);
 *
 * // Find all Person instances
 * const persons = findInstancesByClass(PersonClass);
 *
 * // Get ID for an instance
 * const id = identify(person1); // 'person-1'
 * ```
 */
export function useInstanceHolder(): InstanceHolder {
  const instances = ref<Map<string, EObject>>(new Map());
  const reverseMap = new WeakMap<EObject, string>();

  /**
   * Get an instance by ID.
   */
  function getInstance(id: string): EObject | undefined {
    return instances.value.get(id);
  }

  /**
   * Register an instance with an ID.
   */
  function setInstance(id: string, eObject: EObject): void {
    instances.value.set(id, eObject);
    reverseMap.set(eObject, id);
  }

  /**
   * Remove an instance by ID.
   */
  function removeInstance(id: string): boolean {
    const instance = instances.value.get(id);
    if (instance) {
      reverseMap.delete(instance);
    }
    return instances.value.delete(id);
  }

  /**
   * Find all instances of an EClass (including subtypes).
   */
  function findInstancesByClass(eClass: EClass): Map<string, EObject> {
    const result = new Map<string, EObject>();
    const className = eClass.getName?.();

    for (const [id, instance] of instances.value) {
      const instanceClass = instance.eClass?.();
      if (!instanceClass) continue;

      // Check exact match
      if (instanceClass === eClass) {
        result.set(id, instance);
        continue;
      }

      // Check by name
      if (instanceClass.getName?.() === className) {
        result.set(id, instance);
        continue;
      }

      // Check supertypes
      if (isSuperTypeOf(eClass, instanceClass)) {
        result.set(id, instance);
      }
    }

    return result;
  }

  /**
   * Get the ID for an instance.
   */
  function identify(eObject: EObject): string | undefined {
    return reverseMap.get(eObject);
  }

  /**
   * Clear all instances.
   */
  function clear(): void {
    instances.value.clear();
  }

  /**
   * Check if eClass is a supertype of instanceClass.
   */
  function isSuperTypeOf(eClass: EClass, instanceClass: EClass): boolean {
    const superTypes = instanceClass.getEAllSuperTypes?.();
    if (!superTypes) return false;

    const className = eClass.getName?.();

    for (const superType of superTypes) {
      if (superType === eClass) return true;
      if (superType.getName?.() === className) return true;
    }

    return false;
  }

  return {
    instances,
    getInstance,
    setInstance,
    removeInstance,
    findInstancesByClass,
    identify,
    clear,
  };
}

/**
 * Injection key for the instance holder.
 */
export const INSTANCE_HOLDER_KEY = Symbol('instanceHolder');
