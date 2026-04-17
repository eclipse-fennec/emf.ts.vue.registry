import type { Component } from 'vue';
import type { EClass } from 'emfts';
import type { RegistrationOptions } from '../types';
import { decoratorRegistry } from './DecoratorRegistry';

/**
 * Decorator to register a component for a specific feature of an EClass.
 *
 * @example
 * ```typescript
 * // Using EClass instance
 * @ForFeature(PersonClass, 'email')
 * class EmailEditor extends Vue { ... }
 *
 * // Using class name (resolved at runtime)
 * @ForFeature('Person', 'email', 'http://example.org/mymodel')
 * class EmailEditor extends Vue { ... }
 *
 * // Using class name without package URI
 * @ForFeature('Person', 'email')
 * class EmailEditor extends Vue { ... }
 * ```
 */
export function ForFeature(
  eClassOrName: EClass | string,
  featureName: string,
  packageNsUriOrOptions?: string | RegistrationOptions,
  options?: RegistrationOptions
) {
  return function <T extends Component>(ComponentClass: T): T {
    if (typeof eClassOrName === 'string') {
      // Lazy resolution
      const packageNsUri =
        typeof packageNsUriOrOptions === 'string' ? packageNsUriOrOptions : undefined;
      const opts =
        typeof packageNsUriOrOptions === 'object' ? packageNsUriOrOptions : options;

      decoratorRegistry.registerLazy(
        ComponentClass,
        {
          type: 'feature-by-name',
          className: eClassOrName,
          featureName,
          packageNsUri,
        },
        opts
      );
    } else {
      // Immediate registration
      const opts =
        typeof packageNsUriOrOptions === 'object' ? packageNsUriOrOptions : options;

      decoratorRegistry.register(
        ComponentClass,
        {
          type: 'feature',
          eClass: eClassOrName,
          featureName,
        },
        opts
      );
    }
    return ComponentClass;
  };
}
