import { expect, test } from '@playwright/test';
import fs from 'fs';
import { runRomaniaNewsAnalysis } from './news/news-analysis';

test.describe('Romania News Analysis', () => {
  test('collects configured headlines and writes the evaluation CSV', async ({ page }) => {
    const analysisResult = await runRomaniaNewsAnalysis(page);

    expect(analysisResult.collectedResults.length).toBeGreaterThan(0);
    for (const result of analysisResult.collectedResults) {
      expect(result.headlines.length).toBeGreaterThan(0);
      expect(fs.existsSync(result.outputFilePath)).toBe(true);
    }

    expect(analysisResult.evaluationResults.length).toBeGreaterThan(0);
    expect(fs.existsSync(analysisResult.reportPath)).toBe(true);
  });
});
