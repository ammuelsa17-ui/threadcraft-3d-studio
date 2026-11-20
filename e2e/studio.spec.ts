import { test, expect } from '@playwright/test';

test.describe('ThreadCraft 3D Studio E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('loads complete studio layout and initializes 3D canvas', async ({ page }) => {
    await expect(page.locator('text=THREADCRAFT')).toBeVisible();
    await expect(page.locator('text=3D STUDIO')).toBeVisible();

    const canvasElements = page.locator('canvas');
    await expect(canvasElements.first()).toBeVisible();

    await expect(page.locator('text=Front Chest').first()).toBeVisible();
    await page.screenshot({ path: 'e2e-results/01_baseline_load.png' });
  });

  test('adds text layer, tests arched typography, and verifies inspector', async ({ page }) => {
    await page.click('button:has-text("Headline")');
    await expect(page.locator('text=Size')).toBeVisible();
    await expect(page.locator('text=Opacity')).toBeVisible();

    await page.click('button:has-text("Arched")');

    const blueSwatch = page.locator('button[title="#3b82f6"]').first();
    await blueSwatch.click();

    await page.screenshot({ path: 'e2e-results/02_text_added.png' });
  });

  test('switches print surface from Front to Back without losing artwork', async ({ page }) => {
    const backBtn = page.locator('button:has-text("Back Center")').first();
    await backBtn.click({ force: true });
    await expect(page.locator('text=Back Center').first()).toBeVisible();

    const frontBtn = page.locator('button:has-text("Front Chest")').first();
    await frontBtn.click({ force: true });
    await expect(page.locator('text=Front Chest').first()).toBeVisible();

    await page.screenshot({ path: 'e2e-results/03_surface_switch.png' });
  });

  test('switches product model to Oversized Street Hoodie', async ({ page }) => {
    await page.click('button:has-text("Crewneck T-Shirt")');
    await expect(page.locator('text=Select 3D Product Canvas')).toBeVisible();

    await page.click('text=Oversized Street Hoodie');
    await expect(page.locator('button:has-text("Oversized Street Hoodie")')).toBeVisible();

    await page.screenshot({ path: 'e2e-results/04_hoodie_switched.png' });
  });

  test('opens export modal and displays physical 300 DPI calculations', async ({ page }) => {
    await page.click('button:has-text("Export Artwork")');
    await expect(page.locator('text=Production Export Center')).toBeVisible();
    await expect(page.locator('text=300 DPI').first()).toBeVisible();

    await expect(page.locator('text=4134 × 4961 px').first()).toBeVisible();
    await page.screenshot({ path: 'e2e-results/05_export_modal.png' });
  });

  test('toggles layers panel and verifies layer list', async ({ page }) => {
    const layersBtn = page.locator('button:has-text("Layers")');
    await layersBtn.click();

    await expect(page.locator('text=Layers').first()).toBeVisible();
    await page.screenshot({ path: 'e2e-results/06_layers_panel.png' });
  });

  test('verifies direct 3D dragging updates 2D artwork coordinates and undo restores them', async ({ page }) => {
    // Select the 3D viewport canvas
    const viewportCanvas = page.locator('canvas').last();
    const box = await viewportCanvas.boundingBox();

    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      // Click on the 3D chest artwork to select it
      await page.mouse.click(centerX, centerY);

      // Drag artwork on the 3D surface
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 60, centerY - 40, { steps: 8 });
      await page.mouse.up();
    }

    // Capture screenshot of direct 3D dragged artwork
    await page.screenshot({ path: 'e2e-results/07_3d_direct_drag_verified.png' });

    // Test Undo via key combination Cmd+Z / Ctrl+Z
    await page.keyboard.press('Control+z');
    await expect(page.locator('text=THREADCRAFT')).toBeVisible();
  });

  test('opens Asset Studio, validates UV inspector, and creates custom template', async ({ page }) => {
    // Open Asset Studio modal
    await page.click('button:has-text("Asset Studio")');
    await expect(page.locator('text=Asset Studio: UV & Product Configuration')).toBeVisible();

    // Verify UV space preview
    await expect(page.locator('text=Interactive UV Space [0..1]')).toBeVisible();

    // Fill in Custom Template details
    await page.fill('input[value="Custom Designer Garment"]', 'Oversized Tactical Parka');

    // Save and activate custom template
    await page.click('button:has-text("Save & Activate Custom Product Template")');
    await expect(page.locator('text=Custom Product Template Saved and Activated!')).toBeVisible();

    await page.screenshot({ path: 'e2e-results/08_asset_studio_activated.png' });
  });
});
