const { test, expect } = require('@playwright/test');

test('info overlay hidden by default', async ({ page }) => {
  await page.goto('/index.html');
  const display = await page.locator('#infoOverlay').evaluate(el => getComputedStyle(el).display);
  expect(display).toBe('none');
});

test('shows result text after real spin', async ({ page }) => {
  await page.route('**/Cesium.js', route => {
    route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.Cesium = {
          Ion: { defaultAccessToken: '' },
          Viewer: function() {
            const obj = { scene: { camera: { rotate: () => {} } }, camera: { pickEllipsoid: () => ({}) } };
            window.viewer = obj;
            return obj;
          },
          Cartesian3: { UNIT_Z: {} },
          Cartesian2: function(x, y) { this.x = x; this.y = y; },
          Ellipsoid: { WGS84: { cartesianToCartographic: () => ({ latitude: 0, longitude: 0 }) } },
          Math: { toDegrees: v => v }
        };
      `
    });
  });
  await page.goto('/index.html');
  await page.evaluate(() => {
    window.fetchPlaceInfo = async () => ({ place: 'Testville', waterName: null });
  });
  await page.click('#spinButton');
  await page.waitForFunction(() => document.getElementById('result').textContent.includes('Testville'));
  const text = await page.locator('#result').textContent();
  expect(text).toContain('You landed near Testville');
});
