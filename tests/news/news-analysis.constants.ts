import path from 'path';

export const ROMANIA_NEWS_CONFIG_PATH = path.resolve(process.cwd(), 'setup/news/romania.json');
export const NEWS_DATA_DIR = path.resolve(process.cwd(), 'data');
export const NEWS_TAGS_PATH = path.resolve(NEWS_DATA_DIR, 'tags.json');
export const NEWS_TAG_EVALUATION_REPORT_PATH = path.resolve(
  NEWS_DATA_DIR,
  'tag-evaluation.csv'
);
export const HEADLINE_SELECTOR = 'h1, h2, h3';
