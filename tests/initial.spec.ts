import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
dotenv.config();

test.beforeEach(async ({ page }) => {
  await page.goto(`${process.env.SITE_URL}`);
});

test.only('get started link', async ({ page }) => {
  
  await page.goto(`${process.env.SITE_URL}competitions`);
  await page.pause()
});
