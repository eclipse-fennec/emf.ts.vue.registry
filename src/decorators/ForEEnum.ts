import type { Component } from 'vue';
import type { EEnum } from 'emfts';
import type { RegistrationOptions } from '../types';
import { decoratorRegistry } from './DecoratorRegistry';

/**
 * Decorator to register a component for enum types.
 *
 * @example
 * ```typescript
 * // Register for all enum types
 * @ForEEnum()
 * class EnumEditor extends Vue { ... }
 *
 * // Register for a specific enum by name
 * @ForEEnum('Gender')
 * class GenderEditor extends Vue { ... }
 *
 * // Register for a specific enum instance
 * @ForEEnum(GenderEnum)
 * class GenderEditor extends Vue { ... }
 * ```
 */
export function ForEEnum(
  enumOrName?: EEnum | string,
  packageNsUriOrOptions?: string | RegistrationOptions,
  options?: RegistrationOptions
) {
  return function <T extends Component>(ComponentClass: T): T {
    if (enumOrName === undefined) {
      // Register for all enums
      decoratorRegistry.register(ComponentClass, { type: 'enum' }, options);
    } else if (typeof enumOrName === 'string') {
      // Lazy resolution by name
      const packageNsUri =
        typeof packageNsUriOrOptions === 'string' ? packageNsUriOrOptions : undefined;
      const opts =
        typeof packageNsUriOrOptions === 'object' ? packageNsUriOrOptions : options;

      if (packageNsUri) {
        // Use lazy registration for specific package
        decoratorRegistry.registerLazy(
          ComponentClass,
          {
            type: 'enum-by-name',
            enumName: enumOrName,
            packageNsUri,
          },
          opts
        );
      } else {
        // Register directly with enum name (will match any enum with this name)
        decoratorRegistry.register(
          ComponentClass,
          { type: 'enum', enumName: enumOrName },
          opts
        );
      }
    } else {
      // Immediate registration with EEnum instance
      const opts =
        typeof packageNsUriOrOptions === 'object' ? packageNsUriOrOptions : options;

      decoratorRegistry.register(
        ComponentClass,
        { type: 'enum', enumType: enumOrName, enumName: enumOrName.getName?.() ?? undefined },
        opts
      );
    }
    return ComponentClass;
  };
}
