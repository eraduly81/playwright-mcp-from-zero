import { expect, test } from '@playwright/test';
import { inventoryRomaniaNewsHeadlines } from './news/romania-headline-inventory';

test.describe('Romania headline inventory', () => {
  test('collects configured headlines in memory only', async ({ page }) => {
    const inventory = await inventoryRomaniaNewsHeadlines(page, {
      maxSourcesPerCategory: 1,
    });

    expect(inventory.items.length).toBeGreaterThan(0);
    expect(inventory.items[0].category).not.toBe('');
    expect(inventory.items[0].sourceUrl).not.toBe('');
    expect(inventory.items[0].headlines.length).toBeGreaterThan(0);
  });

  test('can be disabled explicitly', async ({ page }) => {
    const inventory = await inventoryRomaniaNewsHeadlines(page, {
      enabled: false,
    });

    expect(inventory.items).toEqual([]);
  });
});