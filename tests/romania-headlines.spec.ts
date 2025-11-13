import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always resolve from project root
const configPath = path.resolve(process.cwd(), 'setup/news/romania.json');
console.log('Config path:', configPath);

let configRaw = '';
try {
  configRaw = fs.readFileSync(configPath, 'utf-8');
  console.log('Config raw:', configRaw);
} catch (err) {
  console.error('Failed to read config file:', err);
  throw err;
}

const config = JSON.parse(configRaw);

for (const [category, { urls }] of Object.entries(config)) {
  test.describe(`Romania News - ${category} headlines`, () => {
    for (const [siteName, url] of Object.entries(urls)) {
test(`extracts headlines for ${category} - ${siteName} (${url})`, async ({ page }) => {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const headlines = await page.$$eval(
      'h1, h2, h3',
      els => els.map(e => e.textContent?.trim() || '').filter(Boolean)
    );
    expect(headlines.length).toBeGreaterThan(0);

    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(
      path.join(dataDir, `romania-${category}-${siteName}.json`),
      JSON.stringify(headlines, null, 2),
      'utf-8'
    );
  } catch (err) {
    throw new Error(`Failed to extract/save headlines for ${siteName} (${url}): ${err}`);
  }
});
    }
  });
}