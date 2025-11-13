// spec: agent generated
// BASE_URL_FOXNEWS: https://www.foxnews.com/

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { FoxNewsLandingPage } from '../pages/fox-news/FoxNewsLandingPage';

test.describe('Fox News Homepage - Headline Extraction', () => {

test.beforeAll(() => {
  // Run the nav extraction script to update the JSON file before tests
  execSync('npx ts-node ./pages/fox-news/updateFoxNewsNav.ts', { stdio: 'inherit' });
});

  test('should extract and save main headlines', async ({ page }) => {
    const landing = new FoxNewsLandingPage(page);

    // 1. Navigate to the Fox News homepage
    await landing.goto();
    await expect(page).toHaveTitle(/Fox News/i);

    // 2. Extract all visible main headlines using the POM
    const headlines = await landing.getMainHeadlines();

    // 3. Assert at least one headline is found and all are non-empty
    expect(headlines.length).toBeGreaterThan(0);
    for (const headline of headlines) {
      expect(headline).not.toBe('');
    }

    // 4. Save headlines to data/foxnews-headlines.json
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