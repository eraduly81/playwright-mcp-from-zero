---
description: "Use when editing repo support scripts and one-off automation files. Covers direct Playwright/Node usage, file output, and keeping script-style code explicit."
applyTo:
  - "pages/fox-news/updateFoxNewsNav.ts"
  - "tests/global-setup.ts"
  - "ui/**/*.js"
---

# Support Script Guidelines

- Use direct Playwright or Node APIs when the file is a script, setup task, or UI helper.
- Keep script logic explicit and local to the file.
- Avoid forcing a page-object pattern onto one-off data extraction, setup, or server code.
- Keep side effects obvious, especially when writing files or updating JSON.
- Use ESM syntax and typed helpers when the file is TypeScript.
- Keep DOM access simple in `ui/` files and avoid importing test-only abstractions there.
