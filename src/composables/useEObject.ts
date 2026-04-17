import { ref, computed, watch, type Ref } from 'vue';
import type { EObject, EStructuralFeature, EClass } from 'emfts';

/**
 * Options for the useEObject composable.
 */
export interface UseEObjectOptions {
  /** Whether to automatically sync with EMF notifications */
  autoSync?: boolean;
}

/**
 * Composable to work with EObjects reactively.
 *
 * @example
 * ```typescript
 * const { eClass, features, getValue, setValue } = useEObject(myEObject);
 *
 * // Get the class name
 * console.log(eClass.value?.getName());
 *
 * // Get a feature value reactively
 * const name = getValue(nameFeature);
 *
 * // Set a feature value
 * setValue(nameFeature, 'New Name');
 * ```
 */
export function useEObject(
  eObjectRef: Ref<EObject | undefined> | EObject | undefined,
  _options: UseEObjectOptions = {}
) {
  // Normalize to ref
  const eObject = ref(
    'value' in (eObjectRef ?? {})
      ? (eObjectRef as Ref<EObject | undefined>).value
      : (eObjectRef as EObject | undefined)
  );

  // If passed a ref, watch for changes
  if (eObjectRef && 'value' in eObjectRef) {
    watch(
      eObjectRef as Ref<EObject | undefined>,
      (newVal) => {
        eObject.value = newVal;
      }
    );
  }

  /**
   * The EClass of the current EObject.
   */
  const eClass = computed<EClass | undefined>(() => {
    return eObject.value?.eClass?.();
  });

  /**
   * All structural features of the EClass.
   */
  const features = computed<EStructuralFeature[]>(() => {
    const cls = eClass.value;
    if (!cls) return [];

    const allFeatures = cls.getEAllStructuralFeatures?.();
    if (!allFeatures) return [];

    if (typeof allFeatures[Symbol.iterator] === 'function') {
      return Array.from(allFeatures as Iterable<EStructuralFeature>);
    }

    return [];
  });

  /**
   * Version counter to trigger reactivity on changes.
   */
  const version = ref(0);

  /**
   * Get a feature value.
   */
  function getValue<T = unknown>(feature: EStructuralFeature): T | undefined {
    // Access version to establish dependency
    void version.value;
    return eObject.value?.eGet?.(feature) as T | undefined;
  }

  /**
   * Set a feature value.
   */
  function setValue(feature: EStructuralFeature, value: unknown): void {
    if (eObject.value) {
      eObject.value.eSet?.(feature, value);
      // Increment version to trigger reactive updates
      version.value++;
    }
  }

  /**
   * Check if a feature is set.
   */
  function isSet(feature: EStructuralFeature): boolean {
    return eObject.value?.eIsSet?.(feature) ?? false;
  }

  /**
   * Unset a feature.
   */
  function unset(feature: EStructuralFeature): void {
    if (eObject.value) {
      eObject.value.eUnset?.(feature);
      version.value++;
    }
  }

  /**
   * Get feature by name.
   */
  function getFeature(name: string): EStructuralFeature | undefined {
    return eClass.value?.getEStructuralFeature?.(name) ?? undefined;
  }

  /**
   * Get value by feature name.
   */
  function getValueByName<T = unknown>(featureName: string): T | undefined {
    const feature = getFeature(featureName);
    if (feature) {
      return getValue<T>(feature);
    }
    return undefined;
  }

  /**
   * Set value by feature name.
   */
  function setValueByName(featureName: string, value: unknown): void {
    const feature = getFeature(featureName);
    if (feature) {
      setValue(feature, value);
    }
  }

  /**
   * Force a reactive update (useful after external changes).
   */
  function refresh(): void {
    version.value++;
  }

  return {
    eObject,
    eClass,
    features,
    version,
    getValue,
    setValue,
    isSet,
    unset,
    getFeature,
    getValueByName,
    setValueByName,
    refresh,
  };
}
