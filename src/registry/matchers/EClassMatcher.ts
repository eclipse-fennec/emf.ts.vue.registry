import type { EClass } from '@emfts/core';
import type { MatchContext, MatchResult } from '../../types';
import { Priority, noMatch, match } from '../../types';

/**
 * Matcher for EClass-based component selection.
 * Supports exact match and supertype matching.
 */
export class EClassMatcher {
  constructor(private readonly eClass: EClass) {}

  /**
   * Match the context against this EClass.
   * Exact matches get higher priority than supertype matches.
   */
  match(context: MatchContext): MatchResult {
    const targetClass = context.eClass;
    if (!targetClass) {
      return noMatch();
    }

    // Exact match - highest priority for EClass matching
    if (targetClass === this.eClass) {
      return match(Priority.ECLASS + 50);
    }

    // Check by name if the same object reference isn't available
    if (targetClass.getName() === this.eClass.getName()) {
      const targetPkg = targetClass.getEPackage();
      const thisPkg = this.eClass.getEPackage();
      if (targetPkg && thisPkg && targetPkg.getNsURI() === thisPkg.getNsURI()) {
        return match(Priority.ECLASS + 50);
      }
    }

    // Subtype match (lower priority)
    if (this.isSuperTypeOf(this.eClass, targetClass)) {
      return match(Priority.ECLASS);
    }

    return noMatch();
  }

  /**
   * Check if eClass is a supertype of potentialSubType.
   */
  private isSuperTypeOf(eClass: EClass, potentialSubType: EClass): boolean {
    const superTypes = potentialSubType.getEAllSuperTypes();
    if (!superTypes) return false;

    for (const superType of superTypes) {
      if (superType === eClass) return true;
      if (superType.getName() === eClass.getName()) {
        const superPkg = superType.getEPackage();
        const pkg = eClass.getEPackage();
        if (superPkg && pkg && superPkg.getNsURI() === pkg.getNsURI()) {
          return true;
        }
      }
    }
    return false;
  }
}
