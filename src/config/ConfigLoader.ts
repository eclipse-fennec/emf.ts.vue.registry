import type { Component } from 'vue';
import type {
  RendererConfig,
  ComponentConfig,
  TargetConfig,
  DefaultsConfig,
} from './ConfigSchema';
import { validateConfig } from './ConfigSchema';
import { componentRegistry } from '../registry/ComponentRegistry';
import { decoratorRegistry } from '../decorators/DecoratorRegistry';
import type { RegistrationTarget, RegistrationOptions } from '../types';
import { Priority } from '../types';

/**
 * Component resolver function type.
 * Takes a component path and returns the loaded component.
 */
export type ComponentResolver = (path: string) => Promise<Component>;

/**
 * Loads and processes renderer configuration.
 */
export class ConfigLoader {
  private componentResolver: ComponentResolver;
  private loadedComponents: Map<string, Component> = new Map();

  constructor(resolver: ComponentResolver) {
    this.componentResolver = resolver;
  }

  /**
   * Load configuration from a JSON object.
   */
  async loadConfig(config: RendererConfig): Promise<void> {
    if (!validateConfig(config)) {
      throw new Error('Invalid configuration format');
    }

    // Load defaults first
    if (config.defaults) {
      await this.loadDefaults(config.defaults);
    }

    // Load component registrations
    for (const compConfig of config.components) {
      if (compConfig.enabled === false) continue;

      try {
        const component = await this.resolveComponent(compConfig.component);
        this.registerFromConfig(component, compConfig);
      } catch (error) {
        console.warn(
          `Failed to load component ${compConfig.component}:`,
          error
        );
      }
    }
  }

  /**
   * Load configuration from a URL (fetch JSON).
   */
  async loadFromUrl(url: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch config from ${url}: ${response.statusText}`);
    }
    const config = (await response.json()) as RendererConfig;
    await this.loadConfig(config);
  }

  /**
   * Load configuration from a JSON string.
   */
  async loadFromString(jsonString: string): Promise<void> {
    const config = JSON.parse(jsonString) as RendererConfig;
    await this.loadConfig(config);
  }

  /**
   * Resolve a component by path.
   */
  private async resolveComponent(path: string): Promise<Component> {
    // Check cache first
    if (this.loadedComponents.has(path)) {
      return this.loadedComponents.get(path)!;
    }

    const component = await this.componentResolver(path);
    this.loadedComponents.set(path, component);
    return component;
  }

  /**
   * Load default component settings.
   */
  private async loadDefaults(defaults: DefaultsConfig): Promise<void> {
    const defaultRegistrations: Array<{
      path?: string;
      target: RegistrationTarget;
      priority: number;
    }> = [];

    if (defaults.stringEditor) {
      defaultRegistrations.push({
        path: defaults.stringEditor,
        target: { type: 'datatype', dataTypeName: 'EString' },
        priority: Priority.DEFAULT,
      });
    }

    if (defaults.intEditor) {
      defaultRegistrations.push({
        path: defaults.intEditor,
        target: { type: 'datatype', dataTypeName: 'EInt' },
        priority: Priority.DEFAULT,
      });
    }

    if (defaults.booleanEditor) {
      defaultRegistrations.push({
        path: defaults.booleanEditor,
        target: { type: 'datatype', dataTypeName: 'EBoolean' },
        priority: Priority.DEFAULT,
      });
    }

    if (defaults.dateEditor) {
      defaultRegistrations.push({
        path: defaults.dateEditor,
        target: { type: 'datatype', dataTypeName: 'EDate' },
        priority: Priority.DEFAULT,
      });
    }

    if (defaults.enumEditor) {
      defaultRegistrations.push({
        path: defaults.enumEditor,
        target: { type: 'enum' },
        priority: Priority.DEFAULT,
      });
    }

    if (defaults.referenceEditor) {
      defaultRegistrations.push({
        path: defaults.referenceEditor,
        target: { type: 'reference' },
        priority: Priority.DEFAULT,
      });
    }

    for (const reg of defaultRegistrations) {
      if (reg.path) {
        try {
          const component = await this.resolveComponent(reg.path);
          componentRegistry.register(component, reg.target, {
            priority: reg.priority,
          });
        } catch (error) {
          console.warn(`Failed to load default component ${reg.path}:`, error);
        }
      }
    }
  }

  /**
   * Register a component from configuration.
   */
  private registerFromConfig(
    component: Component,
    config: ComponentConfig
  ): void {
    const target = this.convertTarget(config.target);
    const options: RegistrationOptions = {
      priority: config.priority,
      category: config.category,
      displayName: config.displayName,
      description: config.description,
    };

    if (target) {
      componentRegistry.register(component, target, options);
    } else {
      // Use lazy registration for targets that need resolution
      this.registerLazyFromConfig(component, config);
    }
  }

  /**
   * Convert target config to registration target.
   * Returns null if lazy resolution is needed.
   */
  private convertTarget(config: TargetConfig): RegistrationTarget | null {
    switch (config.type) {
      case 'datatype':
        return { type: 'datatype', dataTypeName: config.typeName };

      case 'enum':
        return { type: 'enum', enumName: config.enumName };

      case 'reference':
        return {
          type: 'reference',
          containment: config.containment,
          // targetClass needs lazy resolution
        };

      case 'eclass':
      case 'feature':
        // These need lazy resolution
        return null;

      case 'custom':
        // Custom targets can't be loaded from JSON without code execution
        console.warn('Custom targets are not supported in JSON configuration');
        return null;

      default:
        return null;
    }
  }

  /**
   * Register with lazy resolution for targets that reference types by name.
   */
  private registerLazyFromConfig(
    component: Component,
    config: ComponentConfig
  ): void {
    const target = config.target;

    switch (target.type) {
      case 'eclass':
        decoratorRegistry.registerLazy(
          component,
          {
            type: 'eclass-by-name',
            className: target.className,
            packageNsUri: target.packageNsUri,
          },
          {
            priority: config.priority,
            category: config.category,
            displayName: config.displayName,
            description: config.description,
          }
        );
        break;

      case 'feature':
        decoratorRegistry.registerLazy(
          component,
          {
            type: 'feature-by-name',
            className: target.className,
            featureName: target.featureName,
            packageNsUri: target.packageNsUri,
          },
          {
            priority: config.priority,
            category: config.category,
            displayName: config.displayName,
            description: config.description,
          }
        );
        break;
    }
  }

  /**
   * Clear the component cache.
   */
  clearCache(): void {
    this.loadedComponents.clear();
  }
}

/**
 * Create a config loader with Vite-compatible dynamic imports.
 *
 * @example
 * ```typescript
 * const loader = createViteConfigLoader();
 * await loader.loadFromUrl('/config/renderer.json');
 * ```
 */
export function createViteConfigLoader(): ConfigLoader {
  return new ConfigLoader(async (path: string) => {
    // Use Vite's dynamic import
    // The @vite-ignore comment tells Vite not to analyze this import
    const module = await import(/* @vite-ignore */ path);
    return module.default;
  });
}

/**
 * Create a config loader with a custom resolver.
 *
 * @example
 * ```typescript
 * const componentMap = {
 *   '@/components/PersonEditor.vue': PersonEditor,
 *   '@/components/StringEditor.vue': StringEditor,
 * };
 *
 * const loader = createConfigLoader((path) => {
 *   const component = componentMap[path];
 *   if (!component) throw new Error(`Unknown component: ${path}`);
 *   return Promise.resolve(component);
 * });
 * ```
 */
export function createConfigLoader(resolver: ComponentResolver): ConfigLoader {
  return new ConfigLoader(resolver);
}
