const { test, expect } = require('@playwright/test');

test('info overlay hidden by default', async ({ page }) => {
  await page.goto('/index.html');
  const display = await page.locator('#infoOverlay').evaluate(el => getComputedStyle(el).display);
  expect(display).toBe('none');
});

test('shows result text after real spin', async ({ page }) => {
  // use the real app without stubbing Cesium
  await page.goto('/index.html');
  // move the mouse to roughly the center of the canvas so picking works
  const box = await page.locator('#cesiumContainer').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.click('#spinButton');
  // wait for the result text to change from "Spinning..." to the final message
  await page.waitForFunction(() => {
    const text = document.getElementById('result').textContent;
    return text && !text.includes('Spinning...');
  }, { timeout: 30000 });
  const text = await page.locator('#result').textContent();
  expect(text).toContain('You landed');
});
