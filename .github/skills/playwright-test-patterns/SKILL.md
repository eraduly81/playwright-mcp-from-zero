---
name: playwright-test-patterns
description: "Use when writing or refactoring Playwright specs. Covers test structure, assertions, locator strategy, and how to keep specs readable and reliable."
---

# Playwright Test Patterns

Use this skill when the task is about test structure, spec readability, or Playwright assertion style.

## Preferred Test Shape

- Keep tests behavior-focused.
- Use `test.describe` to group related scenarios.
- Follow arrange, act, assert.
- Keep assertions near the behavior they verify.
- Let page objects own the selectors and interactions.

## Assertion Rules

- Prefer `expect` assertions over manual checks.
- Use strict text or role-based assertions when the target is stable.
- Avoid over-asserting implementation details that do not matter to the user flow.

## Locator Strategy

- Prefer `getByRole`, `getByText`, and scoped locators.
- Use CSS selectors only when stable semantic locators are not available.
- Keep locator logic centralized so specs do not drift.

## Reliability Rules

- Avoid sleeps and arbitrary waits.
- Avoid `networkidle` unless there is a documented need.
- Keep tests isolated from unrelated data setup when possible.
- Use small helpers for repeatable setup, but do not hide meaningful test steps.

## Good References

- `tests/demoqa-landing-basic.spec.ts`
- `tests/foxnews-headlines.spec.ts`
- `pages/demo-qa/DemoQALandingPage.ts`
