// tests/demoqa-filter.spec.ts
import { test } from '@playwright/test';
import { DemoQALandingPage } from '../pages/demo-qa/DemoQALandingPage';

test.describe('DemoQA Landing Page', () => {
  test('can filter/search for a term', async ({ page }) => {
    const landing = new DemoQALandingPage(page);
    await landing.goto();
    await landing.search('Book');
    await landing.expectResultVisible('Book');
  });
});