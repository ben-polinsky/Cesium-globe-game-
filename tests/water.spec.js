const { test, expect } = require('@playwright/test');

test('fetchWaterBody identifies Atlantic Ocean', async ({ page }) => {
  await page.goto('/index.html');
  const name = await page.evaluate(async () => {
    return await fetchWaterBody(36, -40);
  });
  expect(name).toContain('Atlantic');
});
