import { test, expect } from '@playwright/test';

test('Fox News homepage loads', async ({ page }) => {
  await page.goto(process.env.BASE_URL_FOXNEWS || 'https://www.foxnews.com/');
  await expect(page).toHaveTitle(/Fox News/i);
});