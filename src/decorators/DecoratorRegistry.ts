import type { Component } from 'vue';
import type { EPackage, EClass, EEnum } from '@emfts/core';
import type { RegistrationTarget, RegistrationOptions, LazyTarget } from '../types';
import { componentRegistry } from '../registry/ComponentRegistry';

/**
 * Pending lazy registration that needs package resolution.
 */
interface LazyRegistration {
  component: Component;
  target: LazyTarget;
  options?: RegistrationOptions;
}

/**
 * Registry for decorated components.
 * Handles immediate registrations and lazy resolution for name-based references.
 */
class DecoratorRegistryImpl {
  private lazyRegistrations: LazyRegistration[] = [];
  private resolvedPackages: Map<string, EPackage> = new Map();

  /**
   * Register a decorated component immediately.
   */
  register(
    component: Component,
    target: RegistrationTarget,
    options?: RegistrationOptions
  ): void {
    componentRegistry.register(component, target, options);
  }

  /**
   * Register for lazy resolution (when EClass/EEnum is specified by name).
   */
  registerLazy(
    component: Component,
    target: LazyTarget,
    options?: RegistrationOptions
  ): void {
    this.lazyRegistrations.push({ component, target, options });

    // Try to resolve immediately if packages are available
    this.tryResolveAll();
  }

  /**
   * Add a package for lazy resolution.
   */
  addPackage(pkg: EPackage): void {
    const nsUri = pkg.getNsURI?.();
    if (nsUri) {
      this.resolvedPackages.set(nsUri, pkg);
    }
    // Also store by name as fallback
    const name = pkg.getName?.();
    if (name) {
      this.resolvedPackages.set(name, pkg);
    }

    // Try to resolve pending registrations
    this.tryResolveAll();
  }

  /**
   * Resolve lazy registrations using available packages.
   */
  resolveWith(packages: EPackage[]): void {
    for (const pkg of packages) {
      this.addPackage(pkg);
    }
  }

  /**
   * Try to resolve all pending lazy registrations.
   */
  private tryResolveAll(): void {
    const remaining: LazyRegistration[] = [];

    for (const lazy of this.lazyRegistrations) {
      const resolved = this.tryResolve(lazy.target);
      if (resolved) {
        componentRegistry.register(lazy.component, resolved, lazy.options);
      } else {
        remaining.push(lazy);
      }
    }

    this.lazyRegistrations = remaining;
  }

  /**
   * Try to resolve a lazy target to a concrete registration target.
   */
  private tryResolve(target: LazyTarget): RegistrationTarget | null {
    switch (target.type) {
      case 'eclass-by-name':
        return this.resolveEClass(target.className, target.packageNsUri);

      case 'enum-by-name':
        return this.resolveEnum(target.enumName, target.packageNsUri);

      case 'feature-by-name':
        return this.resolveFeature(
          target.className,
          target.featureName,
          target.packageNsUri
        );

      default:
        return null;
    }
  }

  /**
   * Resolve an EClass by name.
   */
  private resolveEClass(
    className: string,
    packageNsUri?: string
  ): RegistrationTarget | null {
    for (const [uri, pkg] of this.resolvedPackages) {
      if (packageNsUri && uri !== packageNsUri) {
        continue;
      }

      const classifier = pkg.getEClassifier?.(className);
      if (classifier && this.isEClass(classifier)) {
        return { type: 'eclass', eClass: classifier as EClass };
      }
    }
    return null;
  }

  /**
   * Resolve an EEnum by name.
   */
  private resolveEnum(
    enumName: string,
    packageNsUri?: string
  ): RegistrationTarget | null {
    for (const [uri, pkg] of this.resolvedPackages) {
      if (packageNsUri && uri !== packageNsUri) {
        continue;
      }

      const classifier = pkg.getEClassifier?.(enumName);
      if (classifier && this.isEEnum(classifier)) {
        return { type: 'enum', enumType: classifier as EEnum, enumName };
      }
    }
    // Return partial target if enum not found yet
    return null;
  }

  /**
   * Resolve a feature by class name and feature name.
   */
  private resolveFeature(
    className: string,
    featureName: string,
    packageNsUri?: string
  ): RegistrationTarget | null {
    for (const [uri, pkg] of this.resolvedPackages) {
      if (packageNsUri && uri !== packageNsUri) {
        continue;
      }

      const classifier = pkg.getEClassifier?.(className);
      if (classifier && this.isEClass(classifier)) {
        return {
          type: 'feature',
          eClass: classifier as EClass,
          featureName,
        };
      }
    }
    return null;
  }

  /**
   * Check if value is an EClass.
   */
  private isEClass(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    return 'getEAllStructuralFeatures' in value;
  }

  /**
   * Check if value is an EEnum.
   */
  private isEEnum(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    return 'getELiterals' in value;
  }

  /**
   * Get pending lazy registrations (for debugging).
   */
  getPending(): LazyRegistration[] {
    return [...this.lazyRegistrations];
  }

  /**
   * Clear all pending registrations and packages.
   */
  clear(): void {
    this.lazyRegistrations = [];
    this.resolvedPackages.clear();
  }
}

/**
 * Global singleton instance of the decorator registry.
 */
export const decoratorRegistry = new DecoratorRegistryImpl();
