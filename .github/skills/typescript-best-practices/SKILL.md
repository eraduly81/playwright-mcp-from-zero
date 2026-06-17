---
name: typescript-best-practices
description: "Use when writing or reviewing TypeScript in this repository. Covers ESM imports, typing, async methods, naming, and low-noise module design for Playwright test code."
---

# TypeScript Best Practices

Use this skill when the task touches TypeScript files, shared helpers, page objects, or Playwright test code.

## Baseline Rules

- Use ESM syntax only.
- Prefer `const` unless reassignment is required.
- Keep exported APIs typed and explicit.
- Type async methods as `Promise<T>` when they return values.
- Use `readonly` for fields that are assigned once in the constructor.

## Naming and Structure

- Use descriptive names that match the domain, not generic utility names.
- Prefer small functions with one responsibility.
- Keep modules focused on a single abstraction level.
- Avoid one-letter variables except for trivial loop indexes or short callbacks.

## Playwright and ESM Notes

- Import from `@playwright/test` directly when working in tests or page objects.
- Use `fileURLToPath(import.meta.url)` when an ESM-safe `__dirname` is needed.
- Keep locator and page access code close to the page object that owns it.

## Quality Expectations

- Align with the repository ESLint rules in `eslint.config.js`.
- Prefer explicit return types on helpers and exported functions.
- Avoid unused variables and dead code.
- Keep types simple unless a more specific type improves readability or safety.

## Good References

- `package.json`
- `eslint.config.js`
- `tests/global-setup.ts`
- `pages/demo-qa/DemoQALandingPage.ts`
