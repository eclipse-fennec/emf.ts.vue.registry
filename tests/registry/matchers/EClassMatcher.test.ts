import { describe, it, expect } from 'vitest';
import { EClassMatcher } from '../../../src/registry/matchers/EClassMatcher';
import { Priority } from '../../../src/types';
import { mockEClass, mockEPackage } from '../../mocks';

describe('EClassMatcher', () => {
  const pkg = mockEPackage('library', 'http://library/1.0');
  const bookClass = mockEClass('Book', pkg);

  it('should match exact same EClass reference', () => {
    const matcher = new EClassMatcher(bookClass);
    const result = matcher.match({ eClass: bookClass });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.ECLASS + 50);
  });

  it('should match by name and package URI', () => {
    const matcher = new EClassMatcher(bookClass);
    const otherBookClass = mockEClass('Book', pkg);
    const result = matcher.match({ eClass: otherBookClass });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.ECLASS + 50);
  });

  it('should not match different class names', () => {
    const matcher = new EClassMatcher(bookClass);
    const authorClass = mockEClass('Author', pkg);
    const result = matcher.match({ eClass: authorClass });

    expect(result.matches).toBe(false);
  });

  it('should not match same name but different package URI', () => {
    const otherPkg = mockEPackage('other', 'http://other/1.0');
    const matcher = new EClassMatcher(bookClass);
    const otherBook = mockEClass('Book', otherPkg);
    const result = matcher.match({ eClass: otherBook });

    expect(result.matches).toBe(false);
  });

  it('should match subtype with lower priority', () => {
    const matcher = new EClassMatcher(bookClass);
    const ebookClass = mockEClass('EBook', pkg, [bookClass]);
    const result = matcher.match({ eClass: ebookClass });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.ECLASS);
  });

  it('should not match when no eClass in context', () => {
    const matcher = new EClassMatcher(bookClass);
    const result = matcher.match({});

    expect(result.matches).toBe(false);
  });

  it('should match subtype by name and package URI', () => {
    const superClass = mockEClass('Document', pkg);
    const superClassCopy = mockEClass('Document', pkg);
    const subClass = mockEClass('Invoice', pkg, [superClassCopy]);

    const matcher = new EClassMatcher(superClass);
    const result = matcher.match({ eClass: subClass });

    expect(result.matches).toBe(true);
    expect(result.priority).toBe(Priority.ECLASS);
  });
});