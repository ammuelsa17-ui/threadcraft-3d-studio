import { describe, it, expect, beforeEach } from 'vitest';
import { db, ensureInitialTemplates } from '../services/db';
import { ProjectRecord } from '../types/project';
import { PRODUCT_CATALOG } from '../types/product';

describe('IndexedDB Persistence Engine (Dexie)', () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  it('initializes and seeds sample templates if empty', async () => {
    await ensureInitialTemplates();
    const count = await db.projects.count();
    expect(count).toBe(1);

    const first = await db.projects.get('sample-tee-monolith');
    expect(first).toBeDefined();
    expect(first?.name).toContain('Monolith');
    expect(first?.canvases.front).toBeDefined();
  });

  it('saves a complex multi-layer project and restores all properties', async () => {
    const project: ProjectRecord = {
      id: 'test-project-101',
      name: 'Cyberpunk Tokyo Hoodie',
      thumbnail: 'data:image/png;base64,sample',
      productType: 'hoodie',
      garmentColor: '#18181b',
      materialSettings: PRODUCT_CATALOG.hoodie.defaultMaterial,
      canvases: {
        front: JSON.stringify({
          objects: [
            { type: 'i-text', text: 'NEO TOKYO', fontSize: 64, fill: '#ef4444' },
            { type: 'rect', width: 200, height: 100, fill: '#6366f1' },
          ],
        }),
        back: JSON.stringify({
          objects: [
            { type: 'i-text', text: 'CYBERPUNK 2077', fontSize: 80, fill: '#ffffff' },
          ],
        }),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.projects.put(project);

    const retrieved = await db.projects.get('test-project-101');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Cyberpunk Tokyo Hoodie');
    expect(retrieved?.productType).toBe('hoodie');
    expect(retrieved?.garmentColor).toBe('#18181b');
    expect(retrieved?.materialSettings.fabricType).toBe('french_terry');

    // Parse layers
    const frontLayers = JSON.parse(retrieved!.canvases.front);
    expect(frontLayers.objects).toHaveLength(2);
    expect(frontLayers.objects[0].text).toBe('NEO TOKYO');

    const backLayers = JSON.parse(retrieved!.canvases.back);
    expect(backLayers.objects).toHaveLength(1);
    expect(backLayers.objects[0].text).toBe('CYBERPUNK 2077');
  });

  it('handles project deletion and duplication cleanly', async () => {
    const project: ProjectRecord = {
      id: 'proj-del-test',
      name: 'To Be Deleted',
      thumbnail: '',
      productType: 'totebag',
      garmentColor: '#f5f5f4',
      materialSettings: PRODUCT_CATALOG.totebag.defaultMaterial,
      canvases: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.projects.put(project);
    expect(await db.projects.count()).toBe(1);

    // Duplicate
    const duplicate: ProjectRecord = {
      ...project,
      id: 'proj-del-test-copy',
      name: 'To Be Deleted (Copy)',
      updatedAt: Date.now(),
    };
    await db.projects.put(duplicate);
    expect(await db.projects.count()).toBe(2);

    // Delete original
    await db.projects.delete('proj-del-test');
    expect(await db.projects.count()).toBe(1);

    const remaining = await db.projects.get('proj-del-test-copy');
    expect(remaining).toBeDefined();
  });
});
