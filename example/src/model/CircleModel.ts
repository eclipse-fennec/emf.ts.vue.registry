/**
 * Circle model using the real emfts library.
 */
import {
  BasicEClass,
  BasicEAttribute,
  BasicEReference,
  BasicEPackage,
  DynamicEObject,
  getEcorePackage,
  type EClass,
  type EAttribute,
  type EReference,
  type EObject,
  type EStructuralFeature,
  type EList,
} from 'emfts';

// ============================================
// Initialize Ecore Package (for standard types)
// ============================================
const ecorePackage = getEcorePackage();

// ============================================
// Shapes Package
// ============================================
export const ShapesPackage = new BasicEPackage();
ShapesPackage.setName('shapes');
ShapesPackage.setNsURI('http://example.org/shapes');
ShapesPackage.setNsPrefix('shapes');

// ============================================
// Circle EClass
// ============================================
export const CircleEClass = new BasicEClass();
CircleEClass.setName('Circle');

// Create attributes using Ecore data types
export const radiusFeature = new BasicEAttribute();
radiusFeature.setName('radius');
radiusFeature.setEType(ecorePackage.getEFloat());
radiusFeature.setDefaultValueLiteral('50');

export const colorFeature = new BasicEAttribute();
colorFeature.setName('color');
colorFeature.setEType(ecorePackage.getEString());
colorFeature.setDefaultValueLiteral('#3b82f6');

export const xFeature = new BasicEAttribute();
xFeature.setName('x');
xFeature.setEType(ecorePackage.getEInt());
xFeature.setDefaultValueLiteral('100');

export const yFeature = new BasicEAttribute();
yFeature.setName('y');
yFeature.setEType(ecorePackage.getEInt());
yFeature.setDefaultValueLiteral('100');

// Create reference to other circles (0..*)
export const connectedToFeature = new BasicEReference();
connectedToFeature.setName('connectedTo');
connectedToFeature.setEType(CircleEClass);  // Self-reference
connectedToFeature.setUpperBound(-1);        // Many (0..*)
connectedToFeature.setContainment(false);    // Non-containment reference

// Add features to Circle class
CircleEClass.addFeature(radiusFeature);
CircleEClass.addFeature(colorFeature);
CircleEClass.addFeature(xFeature);
CircleEClass.addFeature(yFeature);
CircleEClass.addFeature(connectedToFeature);

// Add Circle to package
ShapesPackage.getEClassifiers().push(CircleEClass);
CircleEClass.setEPackage(ShapesPackage);

// ============================================
// Circle Type (extends DynamicEObject for convenience)
// ============================================
export interface Circle extends EObject {
  radius: number;
  color: string;
  x: number;
  y: number;
  connectedTo: EList<Circle>;
}

/**
 * Create a new Circle instance using DynamicEObject.
 */
export function createCircle(
  radius: number = 50,
  color: string = '#3b82f6',
  x: number = 100,
  y: number = 100
): Circle {
  const circle = new DynamicEObject(CircleEClass);

  // Set initial values
  circle.eSet(radiusFeature, radius);
  circle.eSet(colorFeature, color);
  circle.eSet(xFeature, x);
  circle.eSet(yFeature, y);

  // Add convenience getters/setters
  Object.defineProperties(circle, {
    radius: {
      get() { return this.eGet(radiusFeature) as number; },
      set(v: number) { this.eSet(radiusFeature, v); },
    },
    color: {
      get() { return this.eGet(colorFeature) as string; },
      set(v: string) { this.eSet(colorFeature, v); },
    },
    x: {
      get() { return this.eGet(xFeature) as number; },
      set(v: number) { this.eSet(xFeature, v); },
    },
    y: {
      get() { return this.eGet(yFeature) as number; },
      set(v: number) { this.eSet(yFeature, v); },
    },
    connectedTo: {
      get() { return this.eGet(connectedToFeature) as EList<Circle>; },
    },
  });

  return circle as Circle;
}

// Re-export types from emfts for convenience
export type { EClass, EAttribute, EReference, EObject, EStructuralFeature, EList };
