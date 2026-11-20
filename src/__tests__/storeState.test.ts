import { describe, it, expect, beforeEach } from 'vitest';
import { useStudioStore } from '../store/useStudioStore';
import { PRODUCT_CATALOG } from '../types/product';

describe('Zustand Studio State & History Machine', () => {
  beforeEach(() => {
    // Reset to initial clean state
    useStudioStore.getState().createNewProject('tshirt');
  });

  it('initializes with default T-Shirt product and front zone', () => {
    const state = useStudioStore.getState();
    expect(state.activeProduct.id).toBe('tshirt');
    expect(state.activeZoneId).toBe('front');
    expect(state.garmentColor).toBe(PRODUCT_CATALOG.tshirt.defaultColor);
    expect(state.viewMode).toBe('split');
    expect(state.historyPast).toHaveLength(0);
    expect(state.historyFuture).toHaveLength(0);
  });

  it('switches products and updates zones and camera targets', () => {
    const store = useStudioStore.getState();
    store.setProduct('hoodie');

    const updated = useStudioStore.getState();
    expect(updated.activeProduct.id).toBe('hoodie');
    expect(updated.activeZoneId).toBe('front');
    expect(updated.garmentColor).toBe(PRODUCT_CATALOG.hoodie.defaultColor);
    expect(updated.materialSettings.fabricType).toBe('french_terry');
  });

  it('switches to Ceramic Mug and preserves ceramic PBR glaze parameters', () => {
    const store = useStudioStore.getState();
    store.setProduct('mug');

    const updated = useStudioStore.getState();
    expect(updated.activeProduct.id).toBe('mug');
    expect(updated.materialSettings.fabricType).toBe('ceramic');
    expect(updated.materialSettings.clearcoat).toBe(0.85);
    expect(updated.materialSettings.roughness).toBe(0.18);
  });

  it('changes garment color without affecting active zones or canvas artwork', () => {
    const store = useStudioStore.getState();
    store.updateZoneCanvas('front', '{"objects":[{"type":"text","text":"TEST"}]}', true);

    store.setGarmentColor('#3b82f6');
    const updated = useStudioStore.getState();
    expect(updated.garmentColor).toBe('#3b82f6');
    expect(updated.canvases.front).toContain('TEST');
  });

  it('correctly tracks undo and redo history across canvas modifications', () => {
    const store = useStudioStore.getState();

    // Step 1: Add first artwork state
    store.updateZoneCanvas('front', '{"objects":[{"text":"STATE_1"}]}', true);
    expect(useStudioStore.getState().canvases.front).toBe('{"objects":[{"text":"STATE_1"}]}');

    // Step 2: Add second artwork state
    store.updateZoneCanvas('front', '{"objects":[{"text":"STATE_2"}]}', true);
    expect(useStudioStore.getState().canvases.front).toBe('{"objects":[{"text":"STATE_2"}]}');
    expect(useStudioStore.getState().historyPast.length).toBeGreaterThan(0);

    // Step 3: Undo
    useStudioStore.getState().undo();
    expect(useStudioStore.getState().canvases.front).toBe('{"objects":[{"text":"STATE_1"}]}');
    expect(useStudioStore.getState().historyFuture.length).toBe(1);

    // Step 4: Redo
    useStudioStore.getState().redo();
    expect(useStudioStore.getState().canvases.front).toBe('{"objects":[{"text":"STATE_2"}]}');
  });

  it('switches view mode between split, 3d, and 2d', () => {
    const store = useStudioStore.getState();
    store.setViewMode('3d');
    expect(useStudioStore.getState().viewMode).toBe('3d');

    store.setViewMode('2d');
    expect(useStudioStore.getState().viewMode).toBe('2d');

    store.setViewMode('split');
    expect(useStudioStore.getState().viewMode).toBe('split');
  });
});
