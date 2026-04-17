/**
 * Redpanda Connect pipeline model - parsed from redpanda-connect.ecore
 */
import ecoreXml from '../../../redpanda-connect.ecore?raw';
import {
  XMIResource,
  EResourceSetImpl,
  URI,
  DynamicEObject,
  type EPackage,
  type EClass,
  type EObject,
  type EAttribute,
} from 'emfts';

// ============================================
// Parse the .ecore file
// ============================================
const resourceSet = new EResourceSetImpl();
const resource = new XMIResource(URI.createURI('redpanda-connect.ecore'));
resource.setResourceSet(resourceSet);
resource.loadFromString(ecoreXml);

if (resource.getErrors().length > 0) {
  console.error('Ecore parse errors:', resource.getErrors());
}

export const rpConnectPackage = resource.getContents().get(0) as EPackage;

// ============================================
// EClass lookup helper
// ============================================
const classMap = new Map<string, EClass>();
{
  const classifiers = rpConnectPackage.getEClassifiers();
  for (const c of classifiers) {
    // EEnum loaded as DynamicEObject has no getName() - skip those
    if (typeof (c as any).getName !== 'function') continue;
    const name = (c as EClass).getName();
    if (name) classMap.set(name, c as EClass);
  }
}

export function findClass(name: string): EClass {
  const cls = classMap.get(name);
  if (!cls) throw new Error(`EClass '${name}' not found in rpconnect`);
  return cls;
}

// ============================================
// Component catalog (built from parsed EClasses)
// ============================================
export type ComponentCategory = 'input' | 'processor' | 'output' | 'buffer';

export interface ComponentInfo {
  name: string;
  eClass: EClass;
  category: ComponentCategory;
  description: string;
}

function inferCategory(className: string): ComponentCategory | null {
  if (className.endsWith('Input')) return 'input';
  if (className.endsWith('Output')) return 'output';
  if (className.endsWith('Processor')) return 'processor';
  if (className.endsWith('Buffer')) return 'buffer';
  return null;
}

function stripCategory(className: string): string {
  return className
    .replace(/(Input|Output|Processor|Buffer)$/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

function buildCatalog(): ComponentInfo[] {
  const catalog: ComponentInfo[] = [];
  for (const [name, cls] of classMap) {
    if (typeof cls.isAbstract === 'function' && cls.isAbstract()) continue;
    const category = inferCategory(name);
    if (!category) continue;
    catalog.push({
      name: stripCategory(name) || name,
      eClass: cls,
      category,
      description: name,
    });
  }
  return catalog;
}

export const componentCatalog = buildCatalog();

// ============================================
// Factory + helpers
// ============================================
export function createComponent(eClass: EClass): EObject {
  return new DynamicEObject(eClass);
}

/** Get editable EAttributes of an EObject (label shown separately) */
export function getEditableAttributes(eObject: EObject): EAttribute[] {
  return (eObject.eClass().getEAllAttributes() as EAttribute[]).filter(
    (a) => a.getName() !== 'label'
  );
}

/** Human-readable component name from EClass */
export function getDisplayName(eObject: EObject): string {
  const name = eObject.eClass().getName() ?? '';
  return name.replace(/([A-Z])/g, ' $1').trim();
}

export type { EClass, EObject, EAttribute };
