import type { Component } from 'vue';
import type { EClass } from 'emfts';
import type { RegistrationOptions } from '../types';
import { decoratorRegistry } from './DecoratorRegistry';

/**
 * Options for the ForEReference decorator.
 */
export interface ForEReferenceOptions extends RegistrationOptions {
  /** Only match containment references */
  containment?: boolean;
  /** Only match references to a specific target class */
  targetClass?: EClass;
}

/**
 * Decorator to register a component for references.
 *
 * @example
 * ```typescript
 * // Register for all references
 * @ForEReference()
 * class ReferenceEditor extends Vue { ... }
 *
 * // Register for containment references only
 * @ForEReference({ containment: true })
 * class ContainmentEditor extends Vue { ... }
 *
 * // Register for non-containment references
 * @ForEReference({ containment: false })
 * class NonContainmentEditor extends Vue { ... }
 *
 * // Register for references to a specific class
 * @ForEReference({ targetClass: AddressClass })
 * class AddressReferenceEditor extends Vue { ... }
 * ```
 */
export function ForEReference(options?: ForEReferenceOptions) {
  return function <T extends Component>(ComponentClass: T): T {
    decoratorRegistry.register(
      ComponentClass,
      {
        type: 'reference',
        containment: options?.containment,
        targetClass: options?.targetClass,
      },
      options
    );
    return ComponentClass;
  };
}
