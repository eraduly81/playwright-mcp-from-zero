import { Page, expect } from '@playwright/test';

export class MicrosoftLandingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://microsoft.com');
  }

  async expectTitle() {
    await expect(this.page).toHaveTitle(/Microsoft/);
  }

  // Add more methods for interacting with the landing page as needed
}
