// In pages/demo-qa/DemoQALandingPage.ts
import { Page, expect } from '@playwright/test';

export class DemoQALandingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://demoqa.com/');
  }

  async search(term: string) {
    // Update the selector to match the search/filter input on the DemoQA page
    await this.page.fill('input[type="search"], input[placeholder*="search"]', term);
    await this.page.keyboard.press('Enter');
  }

  async expectResultVisible(text: string) {
    await expect(this.page.locator(`text=${text}`)).toBeVisible();
  }
}