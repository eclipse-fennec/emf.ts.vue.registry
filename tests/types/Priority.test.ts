import { describe, it, expect } from 'vitest';
import { Priority, calculatePriority, noMatch, match } from '../../src/types';

describe('Priority', () => {
  it('should have correct ordering', () => {
    expect(Priority.DEFAULT).toBeLessThan(Priority.DATA_TYPE);
    expect(Priority.DATA_TYPE).toBeLessThan(Priority.ECLASS);
    expect(Priority.ECLASS).toBeLessThan(Priority.FEATURE);
    expect(Priority.FEATURE).toBeLessThan(Priority.PACKAGE);
    expect(Priority.PACKAGE).toBeLessThan(Priority.INSTANCE);
    expect(Priority.INSTANCE).toBeLessThan(Priority.OVERRIDE);
  });
});

describe('calculatePriority', () => {
  it('should return base when no modifiers', () => {
    expect(calculatePriority(Priority.ECLASS)).toBe(200);
  });

  it('should add modifiers to base', () => {
    expect(calculatePriority(Priority.ECLASS, 50)).toBe(250);
  });
});

describe('noMatch', () => {
  it('should return non-matching result', () => {
    const result = noMatch();
    expect(result.matches).toBe(false);
    expect(result.priority).toBe(0);
  });
});

describe('match', () => {
  it('should return matching result with priority', () => {
    const result = match(300);
    expect(result.matches).toBe(true);
    expect(result.priority).toBe(300);
  });
});