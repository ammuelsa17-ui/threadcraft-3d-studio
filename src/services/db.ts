import Dexie, { Table } from 'dexie';
import { ProjectRecord } from '../types/project';
import { PRODUCT_CATALOG, CustomProductRecord } from '../types/product';

export class StudioDatabase extends Dexie {
  projects!: Table<ProjectRecord, string>;
  customProducts!: Table<CustomProductRecord, string>;

  constructor() {
    super('ThreadCraftStudioDB');
    this.version(1).stores({
      projects: 'id, name, productType, createdAt, updatedAt',
    });
    this.version(2).stores({
      projects: 'id, name, productType, createdAt, updatedAt',
      customProducts: 'id, name, category, createdAt',
    });
  }
}

export const db = new StudioDatabase();

// Default starter templates
export async function ensureInitialTemplates(): Promise<void> {
  const count = await db.projects.count();
  if (count > 0) return;

  const sampleTShirt: ProjectRecord = {
    id: 'sample-tee-monolith',
    name: 'Monolith Architectural Heavy Tee',
    thumbnail: '',
    productType: 'tshirt',
    garmentColor: '#1e212d',
    materialSettings: PRODUCT_CATALOG.tshirt.defaultMaterial,
    canvases: {
      front: JSON.stringify({
        version: '5.3.0',
        objects: [
          {
            type: 'i-text',
            version: '5.3.0',
            originX: 'center',
            originY: 'center',
            left: 500,
            top: 420,
            width: 580,
            height: 110,
            fill: '#ffffff',
            stroke: null,
            strokeWidth: 1,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            opacity: 0.95,
            text: 'MONOLITH',
            fontSize: 92,
            fontWeight: '800',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            lineHeight: 1.16,
            textAlign: 'center',
            charSpacing: 350,
          },
          {
            type: 'i-text',
            version: '5.3.0',
            originX: 'center',
            originY: 'center',
            left: 500,
            top: 530,
            width: 480,
            height: 30,
            fill: '#6366f1',
            stroke: null,
            strokeWidth: 1,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            opacity: 0.9,
            text: 'STUDIO SPECIMEN 01 // 240 GSM COMBED COTTON',
            fontSize: 16,
            fontWeight: '600',
            fontFamily: 'JetBrains Mono',
            fontStyle: 'normal',
            lineHeight: 1,
            textAlign: 'center',
            charSpacing: 200,
          },
          {
            type: 'rect',
            version: '5.3.0',
            originX: 'center',
            originY: 'center',
            left: 500,
            top: 580,
            width: 140,
            height: 3,
            fill: '#6366f1',
            stroke: null,
            strokeWidth: 0,
            opacity: 0.8,
          },
        ],
      }),
      back: JSON.stringify({
        version: '5.3.0',
        objects: [
          {
            type: 'i-text',
            version: '5.3.0',
            originX: 'center',
            originY: 'center',
            left: 500,
            top: 380,
            width: 380,
            height: 80,
            fill: '#ffffff',
            opacity: 0.85,
            text: 'REVERSE SPEC',
            fontSize: 48,
            fontWeight: '700',
            fontFamily: 'Inter',
            textAlign: 'center',
            charSpacing: 150,
          },
        ],
      }),
    },
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  };

  await db.projects.add(sampleTShirt);
}
