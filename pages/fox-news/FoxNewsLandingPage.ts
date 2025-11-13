// pages/FoxNewsLandingPage.ts
import { Page, Locator } from '@playwright/test';

export class FoxNewsLandingPage {
  readonly page: Page;
  readonly mainHeadlines: Locator;
  readonly navMenu: Locator;
  readonly trendingSection: Locator;
  readonly searchButton: Locator;
  readonly topStories: Locator;

  constructor(page: Page) {
    this.page = page;
    // Main headlines in articles (h2 or h3)
    this.mainHeadlines = page.locator('article h2, article h3');
    // Top navigation menu
    this.navMenu = page.locator('nav[aria-label="Main navigation"], nav, .main-nav, .navigation');
    // Trending section (sidebar or top bar)
    this.trendingSection = page.locator('text=TRENDING');
    // Search button/icon
    this.searchButton = page.locator('button[aria-label*="search"], [data-qa="search-button"], [title*="Search"], [aria-label*="Expand / Collapse search"]');
    // Top stories (could be a specific section or repeated articles)
    this.topStories = page.locator('section:has-text("Top Stories") article, .collection.collection-spotlight article');
  }

  async goto() {
    await this.page.goto(process.env.BASE_URL_FOXNEWS || 'https://www.foxnews.com/');
  }

  // Returns all visible main headlines as an array of strings
  async getMainHeadlines(): Promise<string[]> {
    return (await this.mainHeadlines.allTextContents()).map(h => h.trim()).filter(Boolean);
  }

  // Returns the visible navigation menu items as an array of strings
  async getNavMenuItems(): Promise<string[]> {
    // Try to get all visible links in the nav menu
    const navLinks = this.navMenu.locator('a, [role="link"]');
    return (await navLinks.allTextContents()).map(t => t.trim()).filter(Boolean);
  }

  // Returns trending topics as an array of strings
  async getTrendingTopics(): Promise<string[]> {
    // Find the trending section and get all links/items under it
    const trending = this.page.locator('nav:has-text("TRENDING") a, [aria-label*="Trending"] a');
    return (await trending.allTextContents()).map(t => t.trim()).filter(Boolean);
  }

  // Clicks the search button/icon
  async openSearch() {
    await this.searchButton.first().click();
  }

  // Returns the top stories headlines as an array of strings
  async getTopStories(): Promise<string[]> {
    return (await this.topStories.locator('h2, h3').allTextContents()).map(t => t.trim()).filter(Boolean);
  }
}