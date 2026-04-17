import type { EClass } from 'emfts';
import type { MatchContext, MatchResult } from '../../types';
import { Priority, noMatch, match } from '../../types';

/**
 * Matcher for specific feature of an EClass.
 * Highest specificity for feature-based matching.
 */
export class FeatureMatcher {
  constructor(
    private readonly eClass: EClass,
    private readonly featureName: string
  ) {}

  /**
   * Match the context against this specific feature.
   */
  match(context: MatchContext): MatchResult {
    const feature = context.feature || context.attribute || context.reference;
    if (!feature) {
      return noMatch();
    }

    // Check feature name
    const name = feature.getName?.();
    if (name !== this.featureName) {
      return noMatch();
    }

    // Check containing class
    const containingClass = feature.getEContainingClass?.();
    if (!containingClass) {
      return noMatch();
    }

    // Exact class match
    if (containingClass === this.eClass) {
      return match(Priority.FEATURE);
    }

    // Check by name and package
    const containingName = containingClass.getName?.();
    const targetName = this.eClass.getName?.();

    if (containingName === targetName) {
      const containingPkg = containingClass.getEPackage?.();
      const targetPkg = this.eClass.getEPackage?.();

      if (containingPkg && targetPkg) {
        if (containingPkg.getNsURI?.() === targetPkg.getNsURI?.()) {
          return match(Priority.FEATURE);
        }
      }
    }

    // Check if the feature is inherited from this class
    if (this.isInheritedFrom(containingClass, this.eClass)) {
      return match(Priority.FEATURE - 10); // Slightly lower for inherited
    }

    return noMatch();
  }

  /**
   * Check if subClass inherits from superClass.
   */
  private isInheritedFrom(subClass: EClass, superClass: EClass): boolean {
    const superTypes = subClass.getEAllSuperTypes?.();
    if (!superTypes) return false;

    for (const st of superTypes) {
      if (st === superClass) return true;
      if (st.getName?.() === superClass.getName?.()) {
        const stPkg = st.getEPackage?.();
        const superPkg = superClass.getEPackage?.();
        if (stPkg && superPkg && stPkg.getNsURI?.() === superPkg.getNsURI?.()) {
          return true;
        }
      }
    }
    return false;
  }
}
