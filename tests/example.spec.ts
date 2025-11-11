import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('https://microsoft.com');
  await expect(page).toHaveTitle(/Microsoft/);
});
