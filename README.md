# emf.ts.vue.registry

Vue 3 component registry for [emf.ts](https://github.com/eclipse-fennec/emf.ts) with priority-based component selection.

## Features

- Priority-based component registry for rendering EMF model elements
- Register components for EClass, EAttribute types, EEnum, EReference, and specific features
- Instance-level overrides for fine-grained control
- Decorator-based registration (`@ForEClass`, `@ForEAttribute`, `@ForEEnum`, `@ForEReference`, `@ForFeature`)
- Lazy resolution for name-based registrations
- JSON configuration support for declarative setup
- Vue 3 composables (`useComponentRegistry`, `useEObject`, `useFeatureValue`, `useInstanceHolder`)
- Default editors for common data types (EString, EInt, EBoolean, EDate, EEnum, EReference)

## Installation

```bash
npm install @emfts/vue-registry
```

## Usage

```typescript
import { ComponentRegistry, useComponentRegistry } from '@emfts/vue-registry';

// Create and register components
const registry = new ComponentRegistry();
registry.registerForDataType('EString', MyStringEditor);
registry.registerForEClass(myEClass, MyClassEditor);
registry.registerForFeature(myEClass, 'name', MyNameEditor);
```

### Vue Plugin

```typescript
import { createApp } from 'vue';
import { EmftsRendererPlugin } from '@emfts/vue-registry';

const app = createApp(App);
app.use(EmftsRendererPlugin);
```

### Decorators

```typescript
import { ForEClass, ForEAttribute, ForFeature } from '@emfts/vue-registry';

@ForEClass('Person')
class PersonEditor { /* ... */ }

@ForEAttribute('EString')
class StringEditor { /* ... */ }

@ForFeature('Person', 'name')
class PersonNameEditor { /* ... */ }
```

## License

[EPL-2.0](https://www.eclipse.org/legal/epl-2.0/)