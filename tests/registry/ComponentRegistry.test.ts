import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry } from '../../src/registry/ComponentRegistry';
import { Priority } from '../../src/types';
import {
  mockEClass,
  mockEPackage,
  mockEObject,
  mockEAttribute,
  mockEReference,
  mockEEnum,
  mockEnumAttribute,
  dummyComponent,
} from '../mocks';

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;

  const pkg = mockEPackage('library', 'http://library/1.0');
  const bookClass = mockEClass('Book', pkg);
  const authorClass = mockEClass('Author', pkg);

  beforeEach(() => {
    registry = new ComponentRegistry();
  });

  describe('register / unregister', () => {
    it('should register a component and increase size', () => {
      const comp = dummyComponent('BookEditor');
      registry.registerForEClass(bookClass, comp);

      expect(registry.size).toBe(1);
    });

    it('should return unregister function', () => {
      const comp = dummyComponent('BookEditor');
      const unregister = registry.registerForEClass(bookClass, comp);

      expect(registry.size).toBe(1);
      unregister();
      expect(registry.size).toBe(0);
    });

    it('should unregister by id', () => {
      const comp = dummyComponent('BookEditor');
      registry.registerForEClass(bookClass, comp);
      const descriptors = registry.getAll();

      expect(descriptors).toHaveLength(1);
      const removed = registry.unregister(descriptors[0].id);
      expect(removed).toBe(true);
      expect(registry.size).toBe(0);
    });

    it('should return false when unregistering unknown id', () => {
      expect(registry.unregister('unknown-id')).toBe(false);
    });

    it('should clear all registrations', () => {
      registry.registerForEClass(bookClass, dummyComponent());
      registry.registerForEClass(authorClass, dummyComponent());

      expect(registry.size).toBe(2);
      registry.clear();
      expect(registry.size).toBe(0);
    });
  });

  describe('getComponent', () => {
    it('should return component for matching EClass', () => {
      const comp = dummyComponent('BookEditor');
      registry.registerForEClass(bookClass, comp);

      const result = registry.getComponent({ eClass: bookClass });
      expect(result).toBe(comp);
    });

    it('should return undefined when no match', () => {
      const comp = dummyComponent('BookEditor');
      registry.registerForEClass(bookClass, comp);

      const result = registry.getComponent({ eClass: authorClass });
      expect(result).toBeUndefined();
    });

    it('should return highest priority component', () => {
      const generic = dummyComponent('GenericEditor');
      const specific = dummyComponent('BookEditor');

      registry.registerForDataType('EString', generic);
      registry.registerForEClass(bookClass, specific);

      const result = registry.getComponent({ eClass: bookClass });
      expect(result).toBe(specific);
    });

    it('should prefer instance override over class match', () => {
      const classComp = dummyComponent('ClassEditor');
      const instanceComp = dummyComponent('InstanceEditor');
      const eObject = mockEObject(bookClass);

      registry.registerForEClass(bookClass, classComp);
      registry.registerForInstance(eObject, instanceComp);

      const result = registry.getComponent({ eClass: bookClass, eObject });
      expect(result).toBe(instanceComp);
    });

    it('should allow unregistering instance override', () => {
      const classComp = dummyComponent('ClassEditor');
      const instanceComp = dummyComponent('InstanceEditor');
      const eObject = mockEObject(bookClass);

      registry.registerForEClass(bookClass, classComp);
      const unregister = registry.registerForInstance(eObject, instanceComp);

      unregister();

      const result = registry.getComponent({ eClass: bookClass, eObject });
      expect(result).toBe(classComp);
    });
  });

  describe('registerForDataType', () => {
    it('should match attribute by data type name', () => {
      const comp = dummyComponent('StringEditor');
      registry.registerForDataType('EString', comp);

      const attr = mockEAttribute('name', 'EString', bookClass);
      const result = registry.getComponentForFeature(attr);
      expect(result).toBe(comp);
    });
  });

  describe('registerForEnum', () => {
    it('should match enum attribute', () => {
      const comp = dummyComponent('EnumEditor');
      const colorEnum = mockEEnum('Color');
      registry.registerForEnum(comp);

      const attr = mockEnumAttribute('color', colorEnum, bookClass);
      const result = registry.getComponentForFeature(attr);
      expect(result).toBe(comp);
    });
  });

  describe('registerForReference', () => {
    it('should match reference feature', () => {
      const comp = dummyComponent('RefEditor');
      registry.registerForReference(comp);

      const ref = mockEReference('author', authorClass, false, bookClass);
      const result = registry.getComponentForFeature(ref);
      expect(result).toBe(comp);
    });
  });

  describe('registerForFeature', () => {
    it('should match specific feature', () => {
      const comp = dummyComponent('TitleEditor');
      registry.registerForFeature(bookClass, 'title', comp);

      const attr = mockEAttribute('title', 'EString', bookClass);
      const result = registry.getComponentForFeature(attr);
      expect(result).toBe(comp);
    });

    it('should prefer feature over data type', () => {
      const stringComp = dummyComponent('StringEditor');
      const titleComp = dummyComponent('TitleEditor');

      registry.registerForDataType('EString', stringComp);
      registry.registerForFeature(bookClass, 'title', titleComp);

      const attr = mockEAttribute('title', 'EString', bookClass);
      const result = registry.getComponentForFeature(attr);
      expect(result).toBe(titleComp);
    });
  });

  describe('replace option', () => {
    it('should replace existing registration for same target', () => {
      const comp1 = dummyComponent('Editor1');
      const comp2 = dummyComponent('Editor2');

      registry.registerForEClass(bookClass, comp1);
      registry.registerForEClass(bookClass, comp2, { replace: true });

      expect(registry.size).toBe(1);
      const result = registry.getComponent({ eClass: bookClass });
      expect(result).toBe(comp2);
    });
  });

  describe('custom matcher', () => {
    it('should use custom matcher when provided', () => {
      const comp = dummyComponent('CustomEditor');
      registry.register(comp, { type: 'custom', matcher: () => ({ matches: true, priority: 999 }) }, {
        matcher: (ctx) => ({
          matches: ctx.custom?.special === true,
          priority: Priority.OVERRIDE,
        }),
      });

      expect(registry.getComponent({ custom: { special: true } })).toBe(comp);
      expect(registry.getComponent({ custom: { special: false } })).toBeUndefined();
    });
  });

  describe('getComponentForEClass', () => {
    it('should return component for EClass', () => {
      const comp = dummyComponent('BookEditor');
      registry.registerForEClass(bookClass, comp);

      expect(registry.getComponentForEClass(bookClass)).toBe(comp);
    });

    it('should pass eObject through', () => {
      const instanceComp = dummyComponent('InstanceEditor');
      const eObject = mockEObject(bookClass);
      registry.registerForInstance(eObject, instanceComp);

      expect(registry.getComponentForEClass(bookClass, eObject)).toBe(instanceComp);
    });
  });

  describe('getAll', () => {
    it('should return all descriptors', () => {
      registry.registerForEClass(bookClass, dummyComponent('A'));
      registry.registerForEClass(authorClass, dummyComponent('B'));

      const all = registry.getAll();
      expect(all).toHaveLength(2);
    });
  });
});