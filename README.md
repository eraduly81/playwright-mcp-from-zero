# Playwright MCP From Zero

A small Playwright test suite demonstrating Playwright + the MCP planner for generating and planning complex flows. It includes page objects, test examples, and seed/setup data so contributors can run and extend scenarios quickly.

## Prerequisites
- Node.js: 16.x — 20.x
- npm (bundled with Node)
- Install Playwright browsers:
```powershell
npm install
npx playwright install
```

## Install & Run
```powershell
# install dependencies and browsers
npm install
npx playwright install

# run all tests (headless)
npm run test

# run tests in headed mode
npm run test:headed
```

## Project structure
- `pages/` — Page objects (e.g. `pages/demo-qa/DemoQALandingPage.ts`, `pages/fox-news/FoxNewsLandingPage.ts`)
- `tests/` — Playwright test specs (e.g. `tests/seed.spec.ts`, `tests/demoqa-landing-basic.spec.ts`, `tests/foxnews-headlines.spec.ts`)
- `setup/` — static test data and seeds (e.g. `setup/fox-news/constants/foxnewsNav.json`, `setup/news/romania.json`)
- `playwright.config.ts` — Playwright configuration (projects, timeouts, reporter)
- `global-setup.ts` — global setup logic executed before the test run

## How MCP is used
This repo uses `@playwright/mcp` as a planner: tests call the MCP planner to generate or plan multi-step flows for more complex scenarios instead of hard-coding every step. Look at `tests/seed.spec.ts` and the `tests/demoqa-*.spec.ts` files for concrete examples of planner-driven test flows.

## Quick examples
```powershell
# run a single file
npx playwright test tests/seed.spec.ts

# run files matching a pattern
npx playwright test tests/demoqa-*.spec.ts

# start headed run (interactive)
npm run test:headed
```

## Troubleshooting
- Missing browsers error: run `npx playwright install`.
- TypeScript compile errors: ensure `npm install` ran; run `npx tsc --noEmit` to see errors.
- ESLint issues: run `npx eslint . --ext .ts` (install dev deps if needed).

If something fails, run the two install commands again and re-run the failing test with `npm run test:headed` to observe behavior.