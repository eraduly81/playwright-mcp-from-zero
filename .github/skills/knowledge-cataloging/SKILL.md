---
name: knowledge-cataloging
description: "Use when building or maintaining structured knowledge catalogs from scraped content or seed data. Covers taxonomy design, JSON catalogs, config-driven mappings, and lightweight normalization rules."
---

# Knowledge Cataloging

Use this skill when the task is about structuring news nav trees, category maps, URL catalogs, or other reusable knowledge artifacts.

## Default Shape

- Prefer plain JSON objects and arrays over custom schema layers.
- Keep catalogs human-readable and easy to diff.
- Use nested maps when the hierarchy is stable and shallow.
- Separate seed/config input from generated output.

## Catalog Design Rules

- Use top-level categories for the main grouping, then arrays or nested maps for the next level.
- Keep keys descriptive and stable, especially when they are used by tests or generation scripts.
- Favor config-driven iteration for multi-site catalogs instead of hardcoding each target in code.
- Keep the catalog shape simple enough that tests can iterate over it without transformation.

## Generation Rules

- Write generated catalogs to `setup/` when they are used as inputs to tests or scripts.
- Write runtime outputs to `data/` when they are artifacts of a scrape or extraction run.
- Keep generation scripts explicit about where source data comes from and where output is saved.
- Avoid mixing catalog generation with assertion logic.

## Repo References

- `setup/fox-news/constants/foxnewsNav.json`
- `setup/news/romania.json`
- `pages/fox-news/updateFoxNewsNav.ts`
- `tests/romania-headlines.spec.ts`
- `tests/foxnews-headlines.spec.ts`
