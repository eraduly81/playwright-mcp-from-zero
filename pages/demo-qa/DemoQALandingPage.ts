// pages/DemoQALandingPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class DemoQALandingPage {
  readonly page: Page;
  readonly cardElements: Locator;
  readonly cardForms: Locator;
  readonly cardAlerts: Locator;
  readonly cardWidgets: Locator;
  readonly cardInteractions: Locator;
  readonly cardBookStore: Locator;
  readonly allMenuCards: Locator;

  constructor(page: Page) {
    this.page = page;
    // Each card is a div with class 'card' and a child h5 with the section name
    this.cardElements = page.locator('.card:has-text("Elements")');
    this.cardForms = page.locator('.card:has-text("Forms")');
    this.cardAlerts = page.locator('.card:has-text("Alerts, Frame & Windows")');
    this.cardWidgets = page.locator('.card:has-text("Widgets")');
    this.cardInteractions = page.locator('.card:has-text("Interactions")');
    this.cardBookStore = page.locator('.card:has-text("Book Store Application")');
    this.allMenuCards = page.locator('.card .card-body > h5');
  }

  async goto() {
    await this.page.goto('/');
  }

  // Returns the visible main menu card titles as an array of strings
  async getMenuItems(): Promise<string[]> {
    return this.allMenuCards.allTextContents();
  }

  // Example: click a specific card
  async clickElementsCard() {
    await this.cardElements.click();
  }
  async clickFormsCard() {
    await this.cardForms.click();
  }
  async clickAlertsCard() {
    await this.cardAlerts.click();
  }
  async clickWidgetsCard() {
    await this.cardWidgets.click();
  }
  async clickInteractionsCard() {
    await this.cardInteractions.click();
  }
  async clickBookStoreCard() {
    await this.cardBookStore.click();
  }
}