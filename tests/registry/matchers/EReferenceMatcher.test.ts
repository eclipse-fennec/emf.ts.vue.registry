import { describe, it, expect } from 'vitest';
import { EReferenceMatcher } from '../../../src/registry/matchers/EReferenceMatcher';
import { Priority } from '../../../src/types';
import { mockEClass, mockEReference, mockEPackage } from '../../mocks';

describe('EReferenceMatcher', () => {
  const pkg = mockEPackage('library', 'http://library/1.0');
  const authorClass = mockEClass('Author', pkg);
  const bookClass = mockEClass('Book', pkg);

  it('should match any reference without filters', () => {
    const matcher = new EReferenceMatcher();
    const ref = mockEReference('author', authorClass);
    const result = matcher.match({ feature: ref });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.DATA_TYPE);
  });

  it('should match containment reference', () => {
    const matcher = new EReferenceMatcher(true);
    const ref = mockEReference('chapters', bookClass, true);
    const result = matcher.match({ feature: ref });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.DATA_TYPE + 25);
  });

  it('should not match non-containment when containment required', () => {
    const matcher = new EReferenceMatcher(true);
    const ref = mockEReference('author', authorClass, false);
    const result = matcher.match({ feature: ref });

    expect(result.matches).toBe(false);
  });

  it('should match by target class', () => {
    const matcher = new EReferenceMatcher(undefined, authorClass);
    const ref = mockEReference('author', authorClass);
    const result = matcher.match({ feature: ref });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.DATA_TYPE + 25);
  });

  it('should match containment + target class with both bonuses', () => {
    const matcher = new EReferenceMatcher(true, bookClass);
    const ref = mockEReference('chapters', bookClass, true);
    const result = matcher.match({ feature: ref });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.DATA_TYPE + 50);
  });

  it('should not match wrong target class', () => {
    const matcher = new EReferenceMatcher(undefined, authorClass);
    const ref = mockEReference('chapters', bookClass);
    const result = matcher.match({ feature: ref });

    expect(result.matches).toBe(false);
  });

  it('should match subtype of target class', () => {
    const ebookClass = mockEClass('EBook', pkg, [bookClass]);
    const matcher = new EReferenceMatcher(undefined, bookClass);
    const ref = mockEReference('ebook', ebookClass);
    const result = matcher.match({ feature: ref });

    expect(result.matches).toBe(true);
  });

  it('should not match when no feature in context', () => {
    const matcher = new EReferenceMatcher();
    const result = matcher.match({});

    expect(result.matches).toBe(false);
  });

  it('should not match attribute features', () => {
    const matcher = new EReferenceMatcher();
    const attr = {
      getName: () => 'title',
      getEAttributeType: () => ({ getName: () => 'EString' }),
      eClass: () => ({ getName: () => 'EAttribute' }),
    };
    const result = matcher.match({ feature: attr as any });

    expect(result.matches).toBe(false);
  });
});