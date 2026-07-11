---
name: knowledge-cataloging
description: "Use when building or maintaining reusable knowledge catalogs from scraped content, seed data, or navigation trees. Covers taxonomy design, hierarchy semantics, catalog shapes, and extraction logic for headlines and subheadlines."
---

# Knowledge Cataloging

Use this skill when the task is about structuring reusable knowledge artifacts such as category maps, topic trees, source inventories, URL catalogs, or headline collections.

## What This Skill Covers

- Designing catalog shapes that are easy to read, diff, and reuse.
- Modeling common-place hierarchies without hardcoding site-specific structure into the skill itself.
- Defining how headlines, subheadlines, and grouped children should be collected and normalized.
- Separating catalog generation from scraping, evaluation, and assertions.

## Canonical Vocabulary

- Category: a primary grouping such as a topic, section, or domain.
- Source: a concrete input location, feed, page, or dataset that contributes items to a catalog.
- Section: a visible grouping within a source, often used to organize related headlines.
- Headline: the primary text item that should be captured as the main record.
- Subheadline: supporting text that belongs to or qualifies a headline and should usually be stored as a child field or nested value.
- Nav item: a structural label used to organize categories or sections before extraction.
- Inventory entry: the normalized output record produced from one source or grouped source set.

## Canonical Catalog Shapes

- Use a flat map when each key points to a small, stable list of values.
- Use a nested map when the hierarchy is shallow and the parent-child relationship is part of the meaning.
- Use arrays of objects when the output needs metadata such as source name, URL, children, or normalized text.
- Use richer objects when a single item needs multiple captured fields, such as headline text, subheadline text, section labels, and provenance.
- Keep the shape simple enough that downstream consumers can iterate it without extra transformation.
- Prefer plain JSON objects and arrays over custom schema layers unless the structure is truly complex.

## Headline And Subheadline Logic

- Treat the headline as the primary record and the subheadline as supporting data attached to that record.
- If the subheadline is structurally tied to one headline, keep it nested under that headline instead of flattening it into a separate top-level item.
- If multiple supporting strings exist for one item, preserve their order unless normalization requires a deterministic sort.
- When the source only exposes generic text nodes, collect candidate headline text first, then classify supporting text as subheadline or secondary content.
- Normalize both headline and subheadline values with the same basic rules: trim whitespace, remove empty values, and dedupe equivalent strings.
- When collecting text from a hierarchy, walk the tree recursively and preserve parent-child relationships in the output.
- Avoid forcing every supporting string into the same bucket; keep a distinction between true subheadlines, section labels, and navigation labels.

## Shared Primitives

- Keep normalization small and reusable: trim, filter empty values, dedupe, and canonicalize text when needed.
- Use recursive string collection for nested knowledge trees instead of hardcoding depth-specific logic.
- Separate source discovery from catalog shaping so extraction can evolve without changing the catalog contract.
- Favor config-driven iteration for multi-source catalogs instead of hardcoding each target in code.
- Keep generation and evaluation logic separate from assertion logic.

## Generation Rules

- Write generated catalogs to a static input location when they are used by tests or other scripts.
- Write runtime outputs to an artifact location when they come from a scrape or extraction run.
- Keep generation scripts explicit about where source data comes from and where output is saved.
- Avoid mixing catalog generation with assertions, reporting, or test-specific control flow.

## Guidance For Authors

- Use descriptive, stable keys wherever the output will be reused.
- Prefer the smallest catalog shape that still preserves meaning.
- Do not hardcode repository-specific paths, filenames, or site lists into the skill text.
- Add site-specific examples only as optional patterns, not as required structure.
- Keep the guidance generic enough to apply to different domains with the same hierarchy rules.
