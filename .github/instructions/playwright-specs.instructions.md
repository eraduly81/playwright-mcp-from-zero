---
description: "Use when editing Playwright test specs. Covers test structure, assertions, locator strategy, and keeping specs readable and reliable."
applyTo: "tests/**/*.spec.ts"
---

# Playwright Spec Guidelines

- Keep assertions in specs and selectors in page objects.
- Structure tests as arrange, act, assert.
- Use `test.describe` for related scenarios and keep test titles behavior-focused.
- Prefer Playwright assertions over manual polling or sleeps.
- Prefer `getByRole`, `getByText`, and scoped locators when you need direct page access.
- Avoid repeating the same locator logic in multiple specs.
- Use direct Playwright calls only when the flow is intentionally script-like, one-off, or not worth an abstraction.
