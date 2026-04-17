import type { EEnum, EAttribute } from '@emfts/core';
import type { MatchContext, MatchResult } from '../../types';
import { Priority, noMatch, match } from '../../types';

/**
 * Matcher for EEnum type-based component selection.
 * Can match all enums or a specific enum by name.
 */
export class EEnumMatcher {
  constructor(private readonly enumName?: string) {}

  /**
   * Match the context for enum types.
   */
  match(context: MatchContext): MatchResult {
    // Check if we have an enum in context directly
    if (context.enumType) {
      return this.matchEnum(context.enumType);
    }

    // Check if feature is an attribute with enum type
    const feature = context.feature || context.attribute;
    if (feature && this.isEAttribute(feature)) {
      const eType = feature.getEType?.();
      if (eType && this.isEEnum(eType)) {
        return this.matchEnum(eType as EEnum);
      }
    }

    return noMatch();
  }

  /**
   * Match against a specific enum.
   */
  private matchEnum(enumType: EEnum): MatchResult {
    // If no specific enum name is required, match any enum
    if (!this.enumName) {
      return match(Priority.DATA_TYPE);
    }

    // Match specific enum by name
    const name = enumType.getName?.();
    if (name === this.enumName) {
      return match(Priority.DATA_TYPE + 50);
    }

    return noMatch();
  }

  /**
   * Check if the value is an EAttribute.
   */
  private isEAttribute(value: unknown): value is EAttribute {
    if (!value || typeof value !== 'object') return false;
    return 'getEAttributeType' in value ||
           ('eClass' in value &&
            typeof (value as { eClass: () => { getName: () => string } }).eClass === 'function' &&
            (value as { eClass: () => { getName: () => string } }).eClass()?.getName?.() === 'EAttribute');
  }

  /**
   * Check if the value is an EEnum.
   */
  private isEEnum(value: unknown): value is EEnum {
    if (!value || typeof value !== 'object') return false;
    return 'getELiterals' in value ||
           ('eClass' in value &&
            typeof (value as { eClass: () => { getName: () => string } }).eClass === 'function' &&
            (value as { eClass: () => { getName: () => string } }).eClass()?.getName?.() === 'EEnum');
  }
}
