import type { EClass, EReference } from 'emfts';
import type { MatchContext, MatchResult } from '../../types';
import { Priority, noMatch, match } from '../../types';

/**
 * Matcher for EReference-based component selection.
 * Can filter by containment and target class.
 */
export class EReferenceMatcher {
  constructor(
    private readonly containment?: boolean,
    private readonly targetClass?: EClass
  ) {}

  /**
   * Match the context against reference criteria.
   */
  match(context: MatchContext): MatchResult {
    const feature = context.feature || context.reference;

    // Only match references
    if (!feature || !this.isEReference(feature)) {
      return noMatch();
    }

    const ref = feature as EReference;
    let priority = Priority.DATA_TYPE;

    // Check containment filter
    if (this.containment !== undefined) {
      const isContainment = ref.isContainment?.() ?? false;
      if (isContainment !== this.containment) {
        return noMatch();
      }
      // Containment-specific match gets bonus priority
      priority += 25;
    }

    // Check target class filter
    if (this.targetClass) {
      const refType = ref.getEReferenceType?.();
      if (!refType) {
        return noMatch();
      }

      const refTypeName = refType.getName?.();
      const targetName = this.targetClass.getName?.();

      if (refTypeName !== targetName) {
        // Check if target is supertype
        if (!this.isSuperTypeOf(this.targetClass, refType)) {
          return noMatch();
        }
      }
      // Target-specific match gets bonus priority
      priority += 25;
    }

    return match(priority);
  }

  /**
   * Check if the value is an EReference.
   */
  private isEReference(value: unknown): value is EReference {
    if (!value || typeof value !== 'object') return false;
    return 'getEReferenceType' in value || 'isContainment' in value ||
           ('eClass' in value &&
            typeof (value as { eClass: () => { getName: () => string } }).eClass === 'function' &&
            (value as { eClass: () => { getName: () => string } }).eClass()?.getName?.() === 'EReference');
  }

  /**
   * Check if eClass is a supertype of potentialSubType.
   */
  private isSuperTypeOf(eClass: EClass, potentialSubType: EClass): boolean {
    const superTypes = potentialSubType.getEAllSuperTypes?.();
    if (!superTypes) return false;

    for (const superType of superTypes) {
      if (superType === eClass) return true;
      if (superType.getName?.() === eClass.getName?.()) {
        return true;
      }
    }
    return false;
  }
}
