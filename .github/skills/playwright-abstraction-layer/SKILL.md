---
name: playwright-abstraction-layer
description: "Use when designing or refactoring Playwright page objects, helpers, or abstraction boundaries. Covers when to create a Page Object Model, how to split selectors and actions, and when direct page access is acceptable."
---

# Playwright Abstraction Layer

Use this skill when the task involves page objects, helper classes, shared selectors, or moving logic out of specs.

## Default Shape

- Put reusable selectors and page-specific actions in `pages/`.
- Keep test assertions in specs.
- Keep constructors responsible for wiring locators only.
- Expose methods that describe behavior or read state, not implementation details.

## When to Introduce a Page Object

- A flow appears in more than one spec.
- A selector is complex, brittle, or expensive to repeat.
- A page has a stable set of actions or queries that belong together.
- The spec is getting noisy because it mixes navigation, querying, and assertions.

## When to Stay Direct in the Spec

- The logic is used only once.
- The interaction is a short script-like scrape or setup task.
- A helper would add more ceremony than clarity.

## Implementation Rules

- Use `readonly` locators and typed page object fields.
- Prefer small, focused methods with typed returns.
- Group selectors by page region or user intent.
- Avoid storing assertion logic inside the page object.
- Prefer stable locators first, then scoped CSS only when needed.

## Anti-Patterns

- A page object that becomes a test case wrapper.
- Specs that repeat the same selector chain over and over.
- Helper classes that mix data loading, scraping, and assertions without a clear boundary.

## Good References

- `pages/demo-qa/DemoQALandingPage.ts`
- `pages/fox-news/FoxNewsLandingPage.ts`
- `tests/demoqa-landing-basic.spec.ts`
