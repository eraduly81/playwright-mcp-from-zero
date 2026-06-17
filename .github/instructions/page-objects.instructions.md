---
description: "Use when editing Playwright page objects. Covers locators, page-specific actions, and when to keep logic inside a page object versus a spec."
applyTo: "pages/**/*Page.ts"
---

# Page Object Guidelines

- Keep page objects focused on reusable locators and page-specific actions.
- Use `readonly` locators and typed fields.
- Keep constructors lightweight and initialize locators there.
- Return state or extracted data when useful, but keep assertions in specs.
- Prefer stable locators and scoped queries over brittle selector chains.
- If a flow is reused across specs, move it into a page object or helper.
- If logic is used only once, keep it in the spec instead of adding abstraction.
