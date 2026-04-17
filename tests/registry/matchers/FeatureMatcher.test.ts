import { describe, it, expect } from 'vitest';
import { FeatureMatcher } from '../../../src/registry/matchers/FeatureMatcher';
import { Priority } from '../../../src/types';
import { mockEClass, mockEAttribute, mockEPackage } from '../../mocks';

describe('FeatureMatcher', () => {
  const pkg = mockEPackage('library', 'http://library/1.0');
  const bookClass = mockEClass('Book', pkg);

  it('should match exact feature by name and class', () => {
    const matcher = new FeatureMatcher(bookClass, 'title');
    const attr = mockEAttribute('title', 'EString', bookClass);
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.FEATURE);
  });

  it('should not match different feature name', () => {
    const matcher = new FeatureMatcher(bookClass, 'title');
    const attr = mockEAttribute('author', 'EString', bookClass);
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(false);
  });

  it('should not match same feature name on different class', () => {
    const authorClass = mockEClass('Author', pkg);
    const matcher = new FeatureMatcher(bookClass, 'name');
    const attr = mockEAttribute('name', 'EString', authorClass);
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(false);
  });

  it('should match by class name and package URI', () => {
    const matcher = new FeatureMatcher(bookClass, 'title');
    const bookClassCopy = mockEClass('Book', pkg);
    const attr = mockEAttribute('title', 'EString', bookClassCopy);
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.FEATURE);
  });

  it('should match inherited feature with lower priority', () => {
    const ebookClass = mockEClass('EBook', pkg, [bookClass]);
    const matcher = new FeatureMatcher(bookClass, 'title');
    const attr = mockEAttribute('title', 'EString', ebookClass);
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.FEATURE - 10);
  });

  it('should not match when no feature in context', () => {
    const matcher = new FeatureMatcher(bookClass, 'title');
    const result = matcher.match({});

    expect(result.matches).toBe(false);
  });

  it('should not match when feature has no containing class', () => {
    const matcher = new FeatureMatcher(bookClass, 'title');
    const attr = mockEAttribute('title', 'EString');
    const result = matcher.match({ feature: attr });

    expect(result.matches).toBe(false);
  });
});