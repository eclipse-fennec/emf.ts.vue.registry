import type { Component } from 'vue';
import type { EClass } from 'emfts';
import type { RegistrationOptions } from '../types';
import { decoratorRegistry } from './DecoratorRegistry';

/**
 * Decorator to register a component for a specific EClass.
 *
 * @example
 * ```typescript
 * // Using EClass instance directly
 * @ForEClass(PersonClass)
 * class PersonEditor extends Vue { ... }
 *
 * // Using class name (resolved at runtime when package is loaded)
 * @ForEClass('Person', 'http://example.org/mymodel')
 * class PersonEditor extends Vue { ... }
 *
 * // Using class name without package URI (matches first found)
 * @ForEClass('Person')
 * class PersonEditor extends Vue { ... }
 * ```
 */
export function ForEClass(
  eClassOrName: EClass | string,
  packageNsUriOrOptions?: string | RegistrationOptions,
  options?: RegistrationOptions
) {
  return function <T extends Component>(ComponentClass: T): T {
    if (typeof eClassOrName === 'string') {
      // Lazy resolution - store for later resolution
      const packageNsUri =
        typeof packageNsUriOrOptions === 'string' ? packageNsUriOrOptions : undefined;
      const opts =
        typeof packageNsUriOrOptions === 'object' ? packageNsUriOrOptions : options;

      decoratorRegistry.registerLazy(
        ComponentClass,
        {
          type: 'eclass-by-name',
          className: eClassOrName,
          packageNsUri,
        },
        opts
      );
    } else {
      // Immediate registration with EClass instance
      const opts =
        typeof packageNsUriOrOptions === 'object' ? packageNsUriOrOptions : options;

      decoratorRegistry.register(
        ComponentClass,
        { type: 'eclass', eClass: eClassOrName },
        opts
      );
    }
    return ComponentClass;
  };
}
