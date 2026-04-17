import { computed, ref, watch, type Ref, type ComputedRef } from 'vue';
import type { EObject, EStructuralFeature } from '@emfts/core';

/**
 * Options for the useFeatureValue composable.
 */
export interface UseFeatureValueOptions {
  /** Transform value when getting */
  get?: (value: unknown) => unknown;
  /** Transform value when setting */
  set?: (value: unknown) => unknown;
  /** Whether the feature is read-only */
  readonly?: boolean;
}

/**
 * Return type for useFeatureValue.
 */
export interface UseFeatureValueReturn<T> {
  /** The current value (reactive) */
  value: ComputedRef<T | undefined>;
  /** Set the value */
  set: (newValue: T) => void;
  /** Whether the feature is set */
  isSet: ComputedRef<boolean>;
  /** Unset the feature */
  unset: () => void;
  /** The feature label (name + type) */
  label: ComputedRef<string>;
  /** Whether the feature is required */
  isRequired: ComputedRef<boolean>;
  /** Whether the feature is many-valued */
  isMany: ComputedRef<boolean>;
}

/**
 * Composable for working with a single feature value.
 *
 * @example
 * ```typescript
 * const { value, set, isRequired } = useFeatureValue(eObject, nameFeature);
 *
 * // Use in template
 * <input v-model="value.value" />
 *
 * // Or programmatically
 * set('New Name');
 * ```
 */
export function useFeatureValue<T = unknown>(
  eObject: Ref<EObject | undefined> | EObject,
  feature: Ref<EStructuralFeature | undefined> | EStructuralFeature,
  options: UseFeatureValueOptions = {}
): UseFeatureValueReturn<T> {
  // Normalize to refs
  const eObjectRef = ref(
    'value' in (eObject ?? {})
      ? (eObject as Ref<EObject | undefined>).value
      : (eObject as EObject)
  );

  const featureRef = ref(
    'value' in (feature ?? {})
      ? (feature as Ref<EStructuralFeature | undefined>).value
      : (feature as EStructuralFeature)
  );

  // Watch for changes if refs were passed
  if ('value' in (eObject ?? {})) {
    watch(eObject as Ref<EObject | undefined>, (newVal) => {
      eObjectRef.value = newVal;
    });
  }

  if ('value' in (feature ?? {})) {
    watch(feature as Ref<EStructuralFeature | undefined>, (newVal) => {
      featureRef.value = newVal;
    });
  }

  // Version counter for reactivity
  const version = ref(0);

  /**
   * The current value.
   */
  const value = computed<T | undefined>(() => {
    // Access version for dependency tracking
    void version.value;

    const obj = eObjectRef.value;
    const feat = featureRef.value;

    if (!obj || !feat) return undefined;

    let val = obj.eGet?.(feat) as T | undefined;

    if (options.get) {
      val = options.get(val) as T | undefined;
    }

    return val;
  });

  /**
   * Set the value.
   */
  function set(newValue: T): void {
    if (options.readonly) return;

    const obj = eObjectRef.value;
    const feat = featureRef.value;

    if (!obj || !feat) return;

    let val: unknown = newValue;
    if (options.set) {
      val = options.set(val);
    }

    obj.eSet?.(feat, val);
    version.value++;
  }

  /**
   * Whether the feature is set.
   */
  const isSet = computed<boolean>(() => {
    void version.value;
    const obj = eObjectRef.value;
    const feat = featureRef.value;
    return obj?.eIsSet?.(feat!) ?? false;
  });

  /**
   * Unset the feature.
   */
  function unset(): void {
    const obj = eObjectRef.value;
    const feat = featureRef.value;

    if (obj && feat) {
      obj.eUnset?.(feat);
      version.value++;
    }
  }

  /**
   * Feature label (name + type).
   */
  const label = computed<string>(() => {
    const feat = featureRef.value;
    if (!feat) return '';

    const name = feat.getName?.() ?? 'unknown';
    const typeName = feat.getEType?.()?.getName?.() ?? 'unknown';
    return `${name} (${typeName})`;
  });

  /**
   * Whether the feature is required.
   */
  const isRequired = computed<boolean>(() => {
    const feat = featureRef.value;
    return feat?.isRequired?.() ?? false;
  });

  /**
   * Whether the feature is many-valued.
   */
  const isMany = computed<boolean>(() => {
    const feat = featureRef.value;
    const upper = feat?.getUpperBound?.();
    return upper === undefined || upper === -1 || upper > 1;
  });

  return {
    value,
    set,
    isSet,
    unset,
    label,
    isRequired,
    isMany,
  };
}
