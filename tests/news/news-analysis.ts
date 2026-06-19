import fs from 'fs';
import path from 'path';
import type { Page } from '@playwright/test';
import {
  HEADLINE_SELECTOR,
  NEWS_DATA_DIR,
  NEWS_TAGS_PATH,
  NEWS_TAG_EVALUATION_REPORT_PATH,
  ROMANIA_NEWS_CONFIG_PATH,
} from './news-analysis.constants';

type RomaniaNewsConfig = Record<string, { urls: Record<string, string> }>;

type NewsCollectionResult = {
  category: string;
  sourceName: string;
  sourceUrl: string;
  headlines: string[];
  outputFilePath: string;
};

type NewsEvaluationResult = {
  sourceFileName: string;
  name: string;
  searchedTag: string;
  occurrenceCountInAll: number;
  occurrenceCountUnderPresentSource: number;
};

type NewsAnalysisResult = {
  collectedResults: NewsCollectionResult[];
  evaluationResults: NewsEvaluationResult[];
  reportPath: string;
};

function ensureDirectoryExists(directoryPath: string) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function normalizeHeadlineValues(values: string[]) {
  return values.map(value => value.trim()).filter(Boolean);
}

function collectStringValues(value: unknown, accumulator: string[]) {
  if (typeof value === 'string') {
    accumulator.push(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectStringValues(item, accumulator);
    }
    return;
  }

  if (value && typeof value === 'object') {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      collectStringValues(nestedValue, accumulator);
    }
  }
}

function escapeCsvValue(value: string | number) {
  const normalized = String(value ?? '');
  return `"${normalized.replace(/"/g, '""')}"`;
}

function countOccurrences(text: string, tag: string) {
  if (!text || !tag) {
    return 0;
  }

  const pattern = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

async function extractHeadlines(page: Page, sourceUrl: string) {
  await page.goto(sourceUrl, { waitUntil: 'domcontentloaded' });
  const rawHeadlines = await page.locator(HEADLINE_SELECTOR).allTextContents();
  return normalizeHeadlineValues(rawHeadlines);
}

function writeJsonResult(filePath: string, value: unknown) {
  ensureDirectoryExists(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

function evaluateTagsInDataDirectory(): NewsEvaluationResult[] {
  const tags = loadJson<string[]>(NEWS_TAGS_PATH);
  if (!Array.isArray(tags)) {
    throw new Error('data/tags.json must contain a JSON array of tags');
  }

  const dataFiles = fs
    .readdirSync(NEWS_DATA_DIR)
    .filter(fileName => fileName.endsWith('.json') && fileName !== 'tags.json')
    .sort();

  const countsByFile = new Map<string, Map<string, number>>();
  const totalsByTag = new Map(tags.map(tag => [tag, 0] as const));

  for (const fileName of dataFiles) {
    const filePath = path.resolve(NEWS_DATA_DIR, fileName);
    const parsed = loadJson<unknown>(filePath);
    const strings: string[] = [];
    collectStringValues(parsed, strings);
    const combinedText = strings.join(' \n ');

    const countsByTag = new Map<string, number>();
    for (const tag of tags) {
      const count = countOccurrences(combinedText, tag);
      countsByTag.set(tag, count);
      totalsByTag.set(tag, (totalsByTag.get(tag) || 0) + count);
    }

    countsByFile.set(fileName, countsByTag);
  }

  const rows = [
    ['name', 'searched tag', 'source', 'occurrence count in all', 'occurrence count under present source'],
  ];

  const evaluationResults: NewsEvaluationResult[] = [];
  for (const fileName of dataFiles) {
    const sourceCounts = countsByFile.get(fileName);
    const sourceName = path.basename(fileName, '.json');

    for (const tag of tags) {
      const occurrenceCountUnderPresentSource = sourceCounts?.get(tag) || 0;
      const result: NewsEvaluationResult = {
        sourceFileName: fileName,
        name: sourceName,
        searchedTag: tag,
        occurrenceCountInAll: totalsByTag.get(tag) || 0,
        occurrenceCountUnderPresentSource,
      };

      evaluationResults.push(result);
      rows.push([
        result.name,
        result.searchedTag,
        result.sourceFileName,
        String(result.occurrenceCountInAll),
        String(result.occurrenceCountUnderPresentSource),
      ]);
    }
  }

  const csv = rows.map(row => row.map(escapeCsvValue).join(',')).join('\n');
  ensureDirectoryExists(path.dirname(NEWS_TAG_EVALUATION_REPORT_PATH));
  fs.writeFileSync(NEWS_TAG_EVALUATION_REPORT_PATH, `${csv}\n`, 'utf-8');

  return evaluationResults;
}

export async function runRomaniaNewsAnalysis(page: Page): Promise<NewsAnalysisResult> {
  const config = loadJson<RomaniaNewsConfig>(ROMANIA_NEWS_CONFIG_PATH);
  const collectedResults: NewsCollectionResult[] = [];

  for (const [category, { urls }] of Object.entries(config)) {
    for (const [sourceName, sourceUrl] of Object.entries(urls)) {
      const headlines = await extractHeadlines(page, sourceUrl);
      const outputFilePath = path.resolve(NEWS_DATA_DIR, `romania-${category}-${sourceName}.json`);

      writeJsonResult(outputFilePath, headlines);

      collectedResults.push({
        category,
        sourceName,
        sourceUrl,
        headlines,
        outputFilePath,
      });
    }
  }

  const evaluationResults = evaluateTagsInDataDirectory();

  return {
    collectedResults,
    evaluationResults,
    reportPath: NEWS_TAG_EVALUATION_REPORT_PATH,
  };
}
