import type { Component } from 'vue';
import type { RegistrationOptions } from '../types';
import { decoratorRegistry } from './DecoratorRegistry';

/**
 * Decorator to register a component for attributes of a specific data type.
 *
 * @example
 * ```typescript
 * // Register for all EString attributes
 * @ForEAttribute('EString')
 * class StringEditor extends Vue { ... }
 *
 * // Register for all EInt attributes
 * @ForEAttribute('EInt')
 * class IntEditor extends Vue { ... }
 *
 * // Register for EDate attributes with custom priority
 * @ForEAttribute('EDate', { priority: 150 })
 * class DateEditor extends Vue { ... }
 * ```
 */
export function ForEAttribute(dataTypeName: string, options?: RegistrationOptions) {
  return function <T extends Component>(ComponentClass: T): T {
    decoratorRegistry.register(
      ComponentClass,
      { type: 'datatype', dataTypeName },
      options
    );
    return ComponentClass;
  };
}
