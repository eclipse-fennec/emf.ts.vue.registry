import type { EAttribute } from 'emfts';
import type { MatchContext, MatchResult } from '../../types';
import { Priority, noMatch, match } from '../../types';

/**
 * Matcher for EAttribute type-based component selection.
 * Matches attributes by their data type name (e.g., 'EString', 'EInt').
 */
export class EAttributeTypeMatcher {
  constructor(private readonly dataTypeName: string) {}

  /**
   * Match the context against this data type name.
   */
  match(context: MatchContext): MatchResult {
    const feature = context.feature || context.attribute;

    // Only match attributes
    if (!feature || !this.isEAttribute(feature)) {
      return noMatch();
    }

    const eType = feature.getEType?.();
    if (!eType) {
      return noMatch();
    }

    const typeName = eType.getName?.();
    if (typeName === this.dataTypeName) {
      return match(Priority.DATA_TYPE);
    }

    return noMatch();
  }

  /**
   * Check if the feature is an EAttribute.
   */
  private isEAttribute(feature: unknown): feature is EAttribute {
    if (!feature || typeof feature !== 'object') return false;
    // Check for EAttribute-specific method
    return 'getEAttributeType' in feature ||
           ('eClass' in feature &&
            typeof (feature as { eClass: () => { getName: () => string } }).eClass === 'function' &&
            (feature as { eClass: () => { getName: () => string } }).eClass()?.getName?.() === 'EAttribute');
  }
}
