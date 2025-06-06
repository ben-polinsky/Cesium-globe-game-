const { test, expect } = require('@playwright/test');

test('info overlay hidden by default', async ({ page }) => {
  await page.goto('/index.html');
  const display = await page.locator('#infoOverlay').evaluate(el => getComputedStyle(el).display);
  expect(display).toBe('none');
});
