# Copilot Instructions for playwright-mcp-from-zero

This repository is a Playwright + TypeScript ESM test suite. Keep guidance aligned with the current codebase rather than general web-app advice.

## Core Rules

- Prefer Page Object Models in `pages/` for reusable selectors, navigation, and page-specific actions.
- Keep assertions in test specs and keep selectors or page interactions inside page objects.
- Use direct Playwright calls in specs only when the flow is intentionally script-like, one-off, or not worth an abstraction.
- Write TypeScript for ESM only. Use `import` and `export`, not CommonJS.
- Keep methods async and typed. Prefer `Promise<T>` return types when a method returns data.
- Use `readonly` for locators and other fields that do not change after construction.
- Prefer resilient locators such as `getByRole`, `getByText`, and scoped locators over brittle CSS chains.
- Avoid arbitrary waits and discourage `networkidle` unless there is a strong reason.
- Keep helper code small, focused, and close to the abstraction layer it serves.
- Do not introduce new frameworks, patterns, or architectural layers that are not already justified by the repository.

## Page Object Expectations

- Page objects should own locators and page-specific actions.
- Page objects may return state or extracted data, but they should not contain test assertions unless there is a strong reason.
- If a selector or flow is reused across multiple specs, move it into a page object or helper.
- If logic is only used once and is simple, keep it in the spec.
- Keep constructors lightweight and initialize locators there.

## TypeScript Expectations

- Keep imports explicit and sorted logically.
- Prefer `const` over `let` unless reassignment is required.
- Add types for reusable data shapes, helpers, and exported APIs.
- Keep module boundaries simple and avoid hidden side effects.
- Use `fileURLToPath(import.meta.url)` when an ESM-safe `__dirname` equivalent is needed.

## Test Writing Expectations

- Structure tests as arrange, act, assert.
- Keep test names specific and behavior-focused.
- Use Playwright assertions instead of manual polling or sleeps.
- Avoid repeating the same locator logic in multiple specs.
- Keep file output, scraping, and data shaping isolated from the assertion flow when possible.
