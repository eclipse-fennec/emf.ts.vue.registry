import { describe, it, expect } from 'vitest';
import { EEnumMatcher } from '../../../src/registry/matchers/EEnumMatcher';
import { Priority } from '../../../src/types';
import { mockEEnum, mockEnumAttribute } from '../../mocks';

describe('EEnumMatcher', () => {
  const colorEnum = mockEEnum('Color');

  it('should match any enum when no name specified', () => {
    const matcher = new EEnumMatcher();
    const result = matcher.match({ enumType: colorEnum });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.DATA_TYPE);
  });

  it('should match specific enum by name', () => {
    const matcher = new EEnumMatcher('Color');
    const result = matcher.match({ enumType: colorEnum });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.DATA_TYPE + 50);
  });

  it('should not match different enum name', () => {
    const matcher = new EEnumMatcher('Status');
    const result = matcher.match({ enumType: colorEnum });

    expect(result.matches).toBe(false);
  });

  it('should match enum attribute via feature context', () => {
    const matcher = new EEnumMatcher();
    const attr = mockEnumAttribute('color', colorEnum);
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(true);
  });

  it('should match specific enum attribute via feature context', () => {
    const matcher = new EEnumMatcher('Color');
    const attr = mockEnumAttribute('color', colorEnum);
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.DATA_TYPE + 50);
  });

  it('should not match when no enum in context', () => {
    const matcher = new EEnumMatcher();
    const result = matcher.match({});

    expect(result.matches).toBe(false);
  });
});