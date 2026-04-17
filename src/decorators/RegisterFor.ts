import type { Component } from 'vue';
import type { RegistrationTarget, RegistrationOptions } from '../types';
import { decoratorRegistry } from './DecoratorRegistry';

/**
 * Decorator to register a Vue component for EMF element rendering.
 *
 * @example
 * ```typescript
 * // Register for a specific data type
 * @RegisterFor({ type: 'datatype', dataTypeName: 'EString' })
 * class MyStringEditor extends Vue { ... }
 *
 * // Register for a specific EClass
 * @RegisterFor({ type: 'eclass', eClass: PersonClass })
 * class PersonEditor extends Vue { ... }
 *
 * // Register for a specific feature
 * @RegisterFor({ type: 'feature', eClass: PersonClass, featureName: 'email' })
 * class EmailEditor extends Vue { ... }
 * ```
 */
export function RegisterFor(
  target: RegistrationTarget,
  options?: RegistrationOptions
) {
  return function <T extends Component>(ComponentClass: T): T {
    decoratorRegistry.register(ComponentClass, target, options);
    return ComponentClass;
  };
}
