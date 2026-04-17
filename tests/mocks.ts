import type { EClass, EObject, EAttribute, EReference, EEnum, EPackage, EStructuralFeature } from '@emfts/core';
import { defineComponent, h } from 'vue';

/**
 * Create a mock EPackage.
 */
export function mockEPackage(name: string, nsUri: string): EPackage {
  const classifiers = new Map<string, unknown>();
  return {
    getName: () => name,
    getNsURI: () => nsUri,
    getEClassifier: (n: string) => classifiers.get(n),
    _classifiers: classifiers,
  } as unknown as EPackage & { _classifiers: Map<string, unknown> };
}

/**
 * Create a mock EClass.
 */
export function mockEClass(
  name: string,
  pkg?: EPackage,
  superTypes: EClass[] = []
): EClass {
  return {
    getName: () => name,
    getEPackage: () => pkg,
    getEAllSuperTypes: () => superTypes,
    getEAllStructuralFeatures: () => [],
  } as unknown as EClass;
}

/**
 * Create a mock EObject.
 */
export function mockEObject(eClass: EClass): EObject {
  return {
    eClass: () => eClass,
  } as unknown as EObject;
}

/**
 * Create a mock EAttribute.
 */
export function mockEAttribute(
  name: string,
  typeName: string,
  containingClass?: EClass
): EAttribute {
  return {
    getName: () => name,
    getEType: () => ({ getName: () => typeName }),
    getEContainingClass: () => containingClass,
    getEAttributeType: () => ({ getName: () => typeName }),
    eClass: () => ({ getName: () => 'EAttribute' }),
  } as unknown as EAttribute;
}

/**
 * Create a mock EEnum.
 */
export function mockEEnum(name: string): EEnum {
  return {
    getName: () => name,
    getELiterals: () => [],
    eClass: () => ({ getName: () => 'EEnum' }),
  } as unknown as EEnum;
}

/**
 * Create a mock EAttribute with enum type.
 */
export function mockEnumAttribute(
  name: string,
  enumType: EEnum,
  containingClass?: EClass
): EAttribute {
  return {
    getName: () => name,
    getEType: () => enumType,
    getEContainingClass: () => containingClass,
    getEAttributeType: () => enumType,
    eClass: () => ({ getName: () => 'EAttribute' }),
  } as unknown as EAttribute;
}

/**
 * Create a mock EReference.
 */
export function mockEReference(
  name: string,
  targetClass: EClass,
  containment: boolean = false,
  containingClass?: EClass
): EReference {
  return {
    getName: () => name,
    getEReferenceType: () => targetClass,
    isContainment: () => containment,
    getEContainingClass: () => containingClass,
    eClass: () => ({ getName: () => 'EReference' }),
  } as unknown as EReference;
}

/**
 * Create a dummy Vue component for testing.
 */
export function dummyComponent(name: string = 'DummyComponent') {
  return defineComponent({ name, render: () => h('div') });
}