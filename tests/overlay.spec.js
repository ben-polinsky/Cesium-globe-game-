const { test, expect } = require('@playwright/test');

test('info overlay hidden by default', async ({ page }) => {
  await page.goto('/index.html');
  const display = await page.locator('#infoOverlay').evaluate(el => getComputedStyle(el).display);
  expect(display).toBe('none');
});

test('shows result text after spin', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => {
    window.fetchPlaceInfo = async () => ({ place: 'Testville', waterName: null });
    const customSpin = async () => {
      const info = await window.fetchPlaceInfo(0, 0);
      const msg = `You landed near ${info.place} at 0.00°, 0.00°`;
      document.getElementById('result').textContent = msg;
    };
    const btn = document.getElementById('spinButton');
    btn.removeEventListener('click', window.spinGlobe);
    window.spinGlobe = customSpin;
    btn.addEventListener('click', customSpin);
  });
  await page.click('#spinButton');
  await expect(page.locator('#result')).toHaveText('You landed near Testville at 0.00°, 0.00°');
});
