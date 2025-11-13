// scripts/updateFoxNewsNavFromSite.ts
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const navPath = path.resolve(__dirname, '../../setup/fox-news/constants/foxnewsNav.json');
const baseUrl = process.env.BASE_URL_FOXNEWS || 'https://www.foxnews.com/';

async function extractNav() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(baseUrl);

  // Select all main nav items
  const navData: Record<string, string[]> = await page.evaluate(() => {
    const nav: Record<string, string[]> = {};
    // Find the main nav bar (adjust selector if needed)
    const navBar = document.querySelector('nav[aria-label*="Main navigation"], nav, .main-nav, .navigation');
    if (!navBar) return nav;

    const mainLinks = Array.from(navBar.querySelectorAll('a, [role="link"]'))
      .filter(el => el.parentElement?.parentElement === navBar.querySelector('ul') || el.parentElement === navBar)
      .filter(el => el.textContent && el.textContent.trim().length > 0);

    for (const link of mainLinks) {
      const section = link.textContent!.replace(/\s*[\u25bc\u22ee]+$/, '').trim();
      // Find submenus (if any)
      const subMenu = link.parentElement?.querySelector('ul, .submenu, .dropdown-menu');
      let subcategories: string[] = [];
      if (subMenu) {
        subcategories = Array.from(subMenu.querySelectorAll('a, [role="link"]'))
          .map(sub => sub.textContent?.trim() || '')
          .filter(Boolean);
      }
      nav[section] = subcategories;
    }
    return nav;
  });

  await browser.close();

  // Ensure directory exists
  fs.mkdirSync(path.dirname(navPath), { recursive: true });
  fs.writeFileSync(navPath, JSON.stringify(navData, null, 2), 'utf-8');
  console.log('Nav JSON updated:', navPath);
}

extractNav().catch(console.error);