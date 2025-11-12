// spec: agent generated
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { DemoQALandingPage } from '../pages/DemoQALandingPage';

test.describe('DemoQA Landing Page Basic Scenarios', () => {
  test('Should display all main menu cards', async ({ page }) => {
    // 1. Navigate to the landing page
    const landing = new DemoQALandingPage(page);
    await landing.goto();
    // 2. Verify all main menu cards are visible: Elements, Forms, Alerts, Widgets, Interactions, Book Store Application
    const menuItems = await landing.getMenuItems();
    expect(menuItems).toEqual([
      'Elements',
      'Forms',
      'Alerts, Frame & Windows',
      'Widgets',
      'Interactions',
      'Book Store Application',
    ]);
  });

  test('Should navigate to Elements section', async ({ page }) => {
    // 1. Click the Elements card
    const landing = new DemoQALandingPage(page);
    await landing.goto();
    await landing.clickElementsCard();
    // 2. Verify navigation to the Elements section (URL contains 'elements' and page contains 'Elements')
    await expect(page).toHaveURL(/.*elements.*/i);
    await expect(page.getByText('Elements', { exact: true })).toBeVisible();
  });

  test('Should navigate to Forms section', async ({ page }) => {
    // 1. Click the Forms card
    const landing = new DemoQALandingPage(page);
    await landing.goto();
    await landing.clickFormsCard();
    // 2. Verify navigation to the Forms section (URL contains 'forms' and page contains 'Forms')
    await expect(page).toHaveURL(/.*forms.*/i);
    await expect(page.getByText('Practice Form', { exact: true })).toBeVisible();
  });

  test('Should navigate to Book Store Application section', async ({ page }) => {
    // 1. Click the Book Store Application card
    const landing = new DemoQALandingPage(page);
    await landing.goto();
    await landing.clickBookStoreCard();
    // 2. Verify navigation to the Book Store Application section (URL contains 'books' and page contains 'Book Store Application')
    await expect(page).toHaveURL(/.*books.*/i);
                await expect(page.locator('.rt-table')).toBeVisible(); // The book table;
  });
});
