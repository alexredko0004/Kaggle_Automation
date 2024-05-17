import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto(`/`);
});

test('get started link', async ({ page }) => {
  
  await page.goto(`/competitions`);
  await page.pause()
});
