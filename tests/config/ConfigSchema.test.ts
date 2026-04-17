import { describe, it, expect } from 'vitest';
import { validateConfig } from '../../src/config/ConfigSchema';

describe('validateConfig', () => {
  it('should accept valid config', () => {
    const config = {
      version: '1.0',
      components: [
        {
          id: 'string-editor',
          component: './editors/StringEditor.vue',
          target: { type: 'datatype', typeName: 'EString' },
        },
      ],
    };
    expect(validateConfig(config)).toBe(true);
  });

  it('should reject null', () => {
    expect(validateConfig(null)).toBe(false);
  });

  it('should reject wrong version', () => {
    expect(validateConfig({ version: '2.0', components: [] })).toBe(false);
  });

  it('should reject missing components', () => {
    expect(validateConfig({ version: '1.0' })).toBe(false);
  });

  it('should reject non-array components', () => {
    expect(validateConfig({ version: '1.0', components: 'nope' })).toBe(false);
  });

  it('should reject component without id', () => {
    const config = {
      version: '1.0',
      components: [
        { component: './Foo.vue', target: { type: 'datatype', typeName: 'EString' } },
      ],
    };
    expect(validateConfig(config)).toBe(false);
  });

  it('should reject component without component path', () => {
    const config = {
      version: '1.0',
      components: [
        { id: 'foo', target: { type: 'datatype', typeName: 'EString' } },
      ],
    };
    expect(validateConfig(config)).toBe(false);
  });

  it('should reject component without target', () => {
    const config = {
      version: '1.0',
      components: [
        { id: 'foo', component: './Foo.vue' },
      ],
    };
    expect(validateConfig(config)).toBe(false);
  });

  it('should reject invalid target type', () => {
    const config = {
      version: '1.0',
      components: [
        { id: 'foo', component: './Foo.vue', target: { type: 'invalid' } },
      ],
    };
    expect(validateConfig(config)).toBe(false);
  });

  it('should accept eclass target with className', () => {
    const config = {
      version: '1.0',
      components: [
        { id: 'foo', component: './Foo.vue', target: { type: 'eclass', className: 'Book' } },
      ],
    };
    expect(validateConfig(config)).toBe(true);
  });

  it('should reject eclass target without className', () => {
    const config = {
      version: '1.0',
      components: [
        { id: 'foo', component: './Foo.vue', target: { type: 'eclass' } },
      ],
    };
    expect(validateConfig(config)).toBe(false);
  });

  it('should accept feature target with className and featureName', () => {
    const config = {
      version: '1.0',
      components: [
        {
          id: 'foo',
          component: './Foo.vue',
          target: { type: 'feature', className: 'Book', featureName: 'title' },
        },
      ],
    };
    expect(validateConfig(config)).toBe(true);
  });

  it('should reject feature target without featureName', () => {
    const config = {
      version: '1.0',
      components: [
        {
          id: 'foo',
          component: './Foo.vue',
          target: { type: 'feature', className: 'Book' },
        },
      ],
    };
    expect(validateConfig(config)).toBe(false);
  });

  it('should accept enum target without name', () => {
    const config = {
      version: '1.0',
      components: [
        { id: 'foo', component: './Foo.vue', target: { type: 'enum' } },
      ],
    };
    expect(validateConfig(config)).toBe(true);
  });

  it('should accept reference target', () => {
    const config = {
      version: '1.0',
      components: [
        { id: 'foo', component: './Foo.vue', target: { type: 'reference', containment: true } },
      ],
    };
    expect(validateConfig(config)).toBe(true);
  });

  it('should accept custom target', () => {
    const config = {
      version: '1.0',
      components: [
        { id: 'foo', component: './Foo.vue', target: { type: 'custom' } },
      ],
    };
    expect(validateConfig(config)).toBe(true);
  });

  it('should accept empty components array', () => {
    expect(validateConfig({ version: '1.0', components: [] })).toBe(true);
  });
});