/**
 * Die Default-Editoren übernehmen Label, Pflichtfeld, Platzhalter und
 * Validierungsmeldung vom Aufrufer, statt alles aus dem Feature abzuleiten
 * (eclipse-fennec/emf.ts.ui#22). Gerendert wird serverseitig — das Repo
 * braucht dafür kein DOM.
 */
import { describe, it, expect } from 'vitest';
import { createSSRApp, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import type { EAttribute, EObject } from '@emfts/core';
import { mockEAttribute, mockEClass, mockEPackage } from '../mocks';
import EStringEditor from '../../src/components/defaults/EStringEditor.vue';
import EIntEditor from '../../src/components/defaults/EIntEditor.vue';
import EBooleanEditor from '../../src/components/defaults/EBooleanEditor.vue';
import EDateEditor from '../../src/components/defaults/EDateEditor.vue';

const pkg = mockEPackage('t', 'http://t/1.0');
const person = mockEClass('Person', pkg);

/** EObject mit lesbaren und schreibbaren Feature-Werten. */
function editable(values: Record<string, unknown> = {}): EObject {
  const store = new Map<string, unknown>(Object.entries(values));
  return {
    eClass: () => person,
    eGet: (f: EAttribute) => store.get(f.getName?.() ?? ''),
    eSet: (f: EAttribute, v: unknown) => store.set(f.getName?.() ?? '', v),
  } as unknown as EObject;
}

function render(component: Component, props: Record<string, unknown>) {
  return renderToString(createSSRApp(component, props));
}

describe('Label', () => {
  it('ohne Prop die Ableitung aus Name und Typ', async () => {
    const html = await render(EStringEditor, {
      eObject: editable({ note: 'x' }),
      feature: mockEAttribute('note', 'EString', person),
    });
    expect(html).toContain('note (EString)');
  });

  it('die Prop ersetzt die Ableitung', async () => {
    const html = await render(EStringEditor, {
      eObject: editable({ deliveryDate: '' }),
      feature: mockEAttribute('deliveryDate', 'EString', person),
      label: 'Liefertermin',
    });
    expect(html).toContain('Liefertermin');
    expect(html).not.toContain('(EString)');
  });

  it('gilt auch für Zahl, Datum und Wahrheitswert', async () => {
    const cases: Array<[Component, string]> = [
      [EIntEditor, 'EInt'],
      [EDateEditor, 'EDate'],
      [EBooleanEditor, 'EBoolean'],
    ];
    for (const [component, typeName] of cases) {
      const html = await render(component, {
        eObject: editable({ feld: null }),
        feature: mockEAttribute('feld', typeName, person),
        label: 'Eigener Text',
      });
      expect(html).toContain('Eigener Text');
      expect(html).not.toContain('feld (');
    }
  });
});

describe('Pflichtfeld, Platzhalter, schreibgeschützt', () => {
  it('die required-Prop ersetzt die Ableitung aus der Multiplizität', async () => {
    const html = await render(EStringEditor, {
      eObject: editable({ note: '' }),
      feature: mockEAttribute('note', 'EString', person),
      required: true,
    });
    expect(html).toContain('required');
    expect(html).toContain('class="required"');
  });

  it('Platzhalter und readonly landen am Eingabefeld', async () => {
    const html = await render(EStringEditor, {
      eObject: editable({ note: '' }),
      feature: mockEAttribute('note', 'EString', person),
      placeholder: 'Kurznotiz',
      readonly: true,
    });
    expect(html).toContain('placeholder="Kurznotiz"');
    expect(html).toContain('disabled');
  });
});

describe('Validierungsmeldung', () => {
  it('wird ausgegeben und markiert das Feld', async () => {
    const html = await render(EStringEditor, {
      eObject: editable({ note: '' }),
      feature: mockEAttribute('note', 'EString', person),
      invalid: true,
      validationMessage: 'Pflichtfeld',
    });
    expect(html).toContain('Pflichtfeld');
    expect(html).toContain('emfts-validation-message');
    expect(html).toContain('aria-invalid="true"');
  });

  it('ohne Meldung bleibt das Feld unmarkiert', async () => {
    const html = await render(EStringEditor, {
      eObject: editable({ note: '' }),
      feature: mockEAttribute('note', 'EString', person),
    });
    expect(html).not.toContain('emfts-validation-message');
    expect(html).not.toContain('aria-invalid');
  });
});
