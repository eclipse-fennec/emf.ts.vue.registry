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

### Default editors

`EStringEditor`, `EIntEditor`, `EBooleanEditor`, `EDateEditor`,
`EEnumEditor` and `EReferenceEditor` render a feature from `eObject` and
`feature`. The caller may override what the editor would otherwise derive
from the feature — a label instead of `name (EType)`, the required flag
instead of the multiplicity — and hand in the result of its own
validation:

```vue
<EStringEditor
  :e-object="order"
  :feature="deliveryDateFeature"
  label="Delivery date"
  placeholder="dd.mm.yyyy"
  :required="true"
  :readonly="false"
  :invalid="!!message"
  :validation-message="message"
/>
```

Declaring `validationMessage` is also the signal to
[`@emfts/uimodel-composer`](https://github.com/eclipse-fennec/emf.ts.ui)
that the editor shows the message itself.

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

## Deployment & Artifacts

| | |
|---|---|
| Registry | [npmjs.com](https://www.npmjs.com/package/@emfts/vue-registry) |
| Package | [`@emfts/vue-registry`](https://www.npmjs.com/package/@emfts/vue-registry) (public) |
| Build output | `dist/` (ESM) — only `dist` is published (see `files` in `package.json`) |
| Source | <https://github.com/eclipse-fennec/emf.ts.vue.registry> (default branch `main`) |
| Project | [Eclipse Fennec](https://projects.eclipse.org/projects/modeling.fennec) |

Releases are published to the npm registry under the `@emfts` scope.

## License

[EPL-2.0](https://www.eclipse.org/legal/epl-2.0/) — see [`LICENSE`](./LICENSE).