import type { Page } from '@playwright/test';
import { HEADLINE_SELECTOR, ROMANIA_NEWS_CONFIG_PATH } from './news-analysis.constants';
import fs from 'fs';

type RomaniaNewsConfig = Record<string, { urls: Record<string, string> }>;

export type RomaniaHeadlineInventoryItem = {
  category: string;
  sourceName: string;
  sourceUrl: string;
  headlines: string[];
};

export type RomaniaHeadlineInventory = {
  items: RomaniaHeadlineInventoryItem[];
};

export type RomaniaHeadlineInventoryOptions = {
  enabled?: boolean;
  categories?: string[];
  maxSourcesPerCategory?: number;
};

function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function normalizeHeadlineValues(values: string[]) {
  return values.map(value => value.trim()).filter(Boolean);
}

async function extractHeadlines(page: Page, sourceUrl: string) {
  await page.goto(sourceUrl, { waitUntil: 'domcontentloaded' });
  const rawHeadlines = await page.locator(HEADLINE_SELECTOR).allTextContents();
  return normalizeHeadlineValues(rawHeadlines);
}

export async function inventoryRomaniaNewsHeadlines(
  page: Page,
  options: RomaniaHeadlineInventoryOptions = {},
): Promise<RomaniaHeadlineInventory> {
  if (options.enabled === false) {
    return { items: [] };
  }

  const config = loadJson<RomaniaNewsConfig>(ROMANIA_NEWS_CONFIG_PATH);
  const items: RomaniaHeadlineInventoryItem[] = [];
  const selectedCategories = options.categories?.length ? options.categories : Object.keys(config);

  for (const category of selectedCategories) {
    const categoryConfig = config[category];
    if (!categoryConfig) {
      continue;
    }

    const entries = Object.entries(categoryConfig.urls);
    const selectedEntries = options.maxSourcesPerCategory ? entries.slice(0, options.maxSourcesPerCategory) : entries;

    for (const [sourceName, sourceUrl] of selectedEntries) {
      const headlines = await extractHeadlines(page, sourceUrl);

      items.push({
        category,
        sourceName,
        sourceUrl,
        headlines,
      });
    }
  }

  return { items };
}