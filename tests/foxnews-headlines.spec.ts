// spec: agent generated
// BASE_URL_FOXNEWS: https://www.foxnews.com/

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Fox News Homepage - Headline Extraction', () => {
  test('should extract and save main headlines', async ({ page }) => {
    await page.goto(process.env.BASE_URL_FOXNEWS || 'https://www.foxnews.com/');
    await expect(page).toHaveTitle(/Fox News/i);

    const headlineLocators = page.locator('article h2, article h3');
    const count = await headlineLocators.count();
    expect(count).toBeGreaterThan(0);

    const headlines = [];
    for (let i = 0; i < count; i++) {
      const el = headlineLocators.nth(i);
      if (await el.isVisible()) {
        const text = (await el.textContent())?.trim();
        if (text) headlines.push(text);
      }
    }
    expect(headlines.length).toBeGreaterThan(0);
    for (const headline of headlines) {
      expect(headline).not.toBe('');
    }
    for (let i = 0; i < headlines.length; i++) {
      await expect(headlineLocators.nth(i)).toBeVisible();
    }

    // Save headlines to data/foxnews-headlines.json
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(
      path.join(dataDir, 'foxnews-headlines.json'),
      JSON.stringify(headlines, null, 2),
      'utf-8'
    );
  });
});