---
name: news-parsing-extraction
description: "Use when extracting, normalizing, or persisting news content from websites. Covers headline scraping, article parsing, text cleanup, JSON output, and config-driven multi-site collection."
---

# News Parsing and Extraction

Use this skill when the task involves scraping news pages, extracting headlines or article text, or turning live site content into reusable output.

## Default Shape

- Prefer small extraction methods that return plain arrays or simple objects.
- Keep normalization local to the extraction step: trim text, drop empty strings, and preserve order when it matters.
- Use direct Playwright access for one-off scraping flows, and page objects when the same site is reused across specs.
- Keep file output in `data/` or another explicit runtime output folder, not in the source config folders.

## Extraction Rules

- Prefer stable heading, article, and section selectors first.
- Use `page.locator()` or `page.$$eval()` only when the target shape is actually easier to extract that way.
- When scraping multiple sites, drive the loop from a config file and keep the extraction logic site-agnostic.
- Wrap extraction in clear error handling so the failing site or category is easy to identify.

## Normalization Rules

- Strip whitespace from headline text before saving it.
- Filter empty values before writing output.
- Keep output lightweight and predictable, typically `string[]` or `Record<string, string[]>`.
- Avoid over-modeling news text unless the task needs metadata like links, section names, or categories.

## Repo References

- `pages/fox-news/FoxNewsLandingPage.ts`
- `pages/fox-news/updateFoxNewsNav.ts`
- `tests/foxnews-headlines.spec.ts`
- `tests/romania-headlines.spec.ts`
- `data/foxnews-headlines.json`
- `data/romania-general-digi.json`
