import { expect, test } from '@playwright/test';
import { inventoryFoxNewsNavHeadlines } from './helpers/foxnews-nav-headline-inventory';

test.describe('Fox News nav headline inventory', () => {
  test('collects nav items and headlines without persisting data', async ({ page }) => {
    const inventory = await inventoryFoxNewsNavHeadlines(page, {
      maxTopLevelItems: 1,
      maxSubmenuItemsPerTopLevelItem: 1,
    });

    expect(inventory.items.length).toBeGreaterThan(0);
    expect(inventory.items[0].label).not.toBe('');

    const collectedHeadlineGroups = [
      inventory.items[0].headlines,
      ...inventory.items[0].submenuItems.map(item => item.headlines),
    ];

    expect(collectedHeadlineGroups.some(group => group.length > 0)).toBe(true);
  });

  test('can be disabled by omission or opt-out', async ({ page }) => {
    const inventory = await inventoryFoxNewsNavHeadlines(page, {
      enabled: false,
    });

    expect(inventory.items).toEqual([]);
  });
});