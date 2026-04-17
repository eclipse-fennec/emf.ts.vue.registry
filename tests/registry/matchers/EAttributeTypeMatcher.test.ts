import { describe, it, expect } from 'vitest';
import { EAttributeTypeMatcher } from '../../../src/registry/matchers/EAttributeTypeMatcher';
import { Priority } from '../../../src/types';
import { mockEAttribute } from '../../mocks';

describe('EAttributeTypeMatcher', () => {
  it('should match attribute with matching type name', () => {
    const matcher = new EAttributeTypeMatcher('EString');
    const attr = mockEAttribute('name', 'EString');
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.DATA_TYPE);
  });

  it('should match via attribute field in context', () => {
    const matcher = new EAttributeTypeMatcher('EInt');
    const attr = mockEAttribute('age', 'EInt');
    const result = matcher.match({ attribute: attr });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.DATA_TYPE);
  });

  it('should not match different type name', () => {
    const matcher = new EAttributeTypeMatcher('EString');
    const attr = mockEAttribute('count', 'EInt');
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(false);
  });

  it('should not match when no feature in context', () => {
    const matcher = new EAttributeTypeMatcher('EString');
    const result = matcher.match({});

    expect(result.matches).toBe(false);
  });

  it('should not match reference features', () => {
    const matcher = new EAttributeTypeMatcher('EString');
    const ref = {
      getName: () => 'author',
      getEReferenceType: () => ({ getName: () => 'Author' }),
      isContainment: () => false,
      eClass: () => ({ getName: () => 'EReference' }),
    };
    const result = matcher.match({ feature: ref as any });

    expect(result.matches).toBe(false);
  });
});