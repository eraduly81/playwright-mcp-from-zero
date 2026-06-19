import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.resolve(projectRoot, 'data');
const tagsPath = path.resolve(dataDir, 'tags.json');
const reportPath = path.resolve(dataDir, 'tag-evaluation.csv');

function escapeCsvValue(value) {
  const normalized = String(value ?? '');
  return `"${normalized.replace(/"/g, '""')}"`;
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function collectStringValues(value, accumulator) {
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
    for (const nestedValue of Object.values(value)) {
      collectStringValues(nestedValue, accumulator);
    }
  }
}

function countOccurrences(text, tag) {
  if (!text || !tag) {
    return 0;
  }

  const pattern = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function analyzeSourceFile(filePath, tags) {
  const parsed = loadJson(filePath);
  const strings = [];
  collectStringValues(parsed, strings);
  const combinedText = strings.join(' \n ');

  const countsByTag = new Map();
  for (const tag of tags) {
    countsByTag.set(tag, countOccurrences(combinedText, tag));
  }

  return countsByTag;
}

function main() {
  if (!fs.existsSync(tagsPath)) {
    throw new Error(`Missing tags file: ${tagsPath}`);
  }

  const tags = loadJson(tagsPath);
  if (!Array.isArray(tags)) {
    throw new Error('data/tags.json must contain a JSON array of tags');
  }

  const dataFiles = fs
    .readdirSync(dataDir)
    .filter(fileName => fileName.endsWith('.json') && fileName !== 'tags.json')
    .sort();

  const totalsByTag = new Map(tags.map(tag => [tag, 0]));
  const countsByFile = new Map();

  for (const fileName of dataFiles) {
    const filePath = path.resolve(dataDir, fileName);
    const countsByTagForFile = analyzeSourceFile(filePath, tags);
    countsByFile.set(fileName, countsByTagForFile);

    for (const [tag, count] of countsByTagForFile.entries()) {
      totalsByTag.set(tag, (totalsByTag.get(tag) || 0) + count);
    }
  }

  const rows = [
    ['name', 'searched tag', 'source', 'occurrence count in all', 'occurrence count under present source'],
  ];

  for (const fileName of dataFiles) {
    const sourceCounts = countsByFile.get(fileName);
    const sourceName = path.basename(fileName, '.json');

    for (const tag of tags) {
      const presentCount = sourceCounts.get(tag) || 0;
      rows.push([
        sourceName,
        tag,
        fileName,
        String(totalsByTag.get(tag) || 0),
        String(presentCount),
      ]);
    }
  }

  const csv = rows.map(row => row.map(escapeCsvValue).join(',')).join('\n');
  fs.writeFileSync(reportPath, `${csv}\n`, 'utf-8');
  console.log(`Tag report written to ${reportPath}`);
}

main();
