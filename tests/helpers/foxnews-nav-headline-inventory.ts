import type { Page } from '@playwright/test';
import { FoxNewsLandingPage } from '../../pages/fox-news/FoxNewsLandingPage';

const FOX_NEWS_BASE_URL = process.env.BASE_URL_FOXNEWS || 'https://www.foxnews.com/';
const FOX_NEWS_NAV_SELECTOR = 'nav[aria-label*="Main navigation"], nav, .main-nav, .navigation';

export type FoxNewsNavHeadlineSet = {
  label: string;
  headlines: string[];
};

export type FoxNewsNavInventoryItem = FoxNewsNavHeadlineSet & {
  submenuItems: FoxNewsNavHeadlineSet[];
};

export type FoxNewsNavHeadlineInventory = {
  sourceUrl: string;
  items: FoxNewsNavInventoryItem[];
};

export type FoxNewsNavHeadlineInventoryOptions = {
  enabled?: boolean;
  maxTopLevelItems?: number;
  maxSubmenuItemsPerTopLevelItem?: number;
};

type ExtractedNavItem = {
  label: string;
  submenuLabels: string[];
};

function normalizeLabels(values: string[]) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)));
}

async function ensureFoxNewsHome(page: Page) {
  await page.goto(FOX_NEWS_BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator(FOX_NEWS_NAV_SELECTOR).first().waitFor({ state: 'visible' });
}

async function extractNavTree(page: Page): Promise<ExtractedNavItem[]> {
  return await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label*="Main navigation"], nav, .main-nav, .navigation');

    if (!nav) {
      return [];
    }

    const normalize = (value: string) => value.replace(/\s*[\u25bc\u22ee]+$/, '').trim();
    const isMeaningful = (value: string) => value.trim().length > 0;
    const navList = nav.querySelector('ul');

    const topLevelLinks = Array.from(nav.querySelectorAll('a, [role="link"]'))
      .filter(element => {
        const parent = element.parentElement;
        const grandParent = parent?.parentElement;

        return grandParent === navList || parent === nav;
      })
      .map(element => normalize(element.textContent || ''))
      .filter(isMeaningful);

    return Array.from(new Set(topLevelLinks)).map(label => {
      const link = Array.from(nav.querySelectorAll('a, [role="link"]')).find(element => normalize(element.textContent || '') === label);
      const submenu = link?.parentElement?.querySelector('ul, .submenu, .dropdown-menu');

      const submenuLabels = submenu
        ? Array.from(submenu.querySelectorAll('a, [role="link"]'))
            .map(element => normalize(element.textContent || ''))
            .filter(isMeaningful)
        : [];

      return {
        label,
        submenuLabels: Array.from(new Set(submenuLabels)),
      };
    });
  });
}

async function clickNavLinkAndReadHeadlines(page: Page, label: string) {
  const landing = new FoxNewsLandingPage(page);
  const nav = page.locator(FOX_NEWS_NAV_SELECTOR).first();
  const link = nav.getByRole('link', { name: label, exact: true }).first();

  await link.scrollIntoViewIfNeeded().catch(() => {});
  await link.click();
  await page.waitForLoadState('domcontentloaded').catch(() => {});

  return await landing.getMainHeadlines();
}

async function hoverNavLink(page: Page, label: string) {
  const nav = page.locator(FOX_NEWS_NAV_SELECTOR).first();
  const link = nav.getByRole('link', { name: label, exact: true }).first();

  await link.scrollIntoViewIfNeeded().catch(() => {});
  await link.hover().catch(() => {});
}

export async function inventoryFoxNewsNavHeadlines(
  page: Page,
  options: FoxNewsNavHeadlineInventoryOptions = {},
): Promise<FoxNewsNavHeadlineInventory> {
  if (options.enabled === false) {
    return {
      sourceUrl: FOX_NEWS_BASE_URL,
      items: [],
    };
  }

  await ensureFoxNewsHome(page);

  const navTree = await extractNavTree(page);
  const selectedTopLevelItems = options.maxTopLevelItems ? navTree.slice(0, options.maxTopLevelItems) : navTree;
  const items: FoxNewsNavInventoryItem[] = [];

  for (const topLevelItem of selectedTopLevelItems) {
    const item: FoxNewsNavInventoryItem = {
      label: topLevelItem.label,
      headlines: [],
      submenuItems: [],
    };

    try {
      item.headlines = normalizeLabels(await clickNavLinkAndReadHeadlines(page, topLevelItem.label));
    } catch {
      item.headlines = [];
    }

    await ensureFoxNewsHome(page);

    const selectedSubmenuItems = options.maxSubmenuItemsPerTopLevelItem
      ? topLevelItem.submenuLabels.slice(0, options.maxSubmenuItemsPerTopLevelItem)
      : topLevelItem.submenuLabels;

    for (const submenuLabel of selectedSubmenuItems) {
      try {
        await hoverNavLink(page, topLevelItem.label);
        const headlines = normalizeLabels(await clickNavLinkAndReadHeadlines(page, submenuLabel));

        item.submenuItems.push({
          label: submenuLabel,
          headlines,
        });
      } catch {
        item.submenuItems.push({
          label: submenuLabel,
          headlines: [],
        });
      }

      await ensureFoxNewsHome(page);
    }

    items.push(item);
  }

  return {
    sourceUrl: FOX_NEWS_BASE_URL,
    items,
  };
}