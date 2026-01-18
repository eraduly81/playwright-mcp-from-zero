This repo is a Playwright + TypeScript (ESM) test suite with a small set of page objects, static data, and helper scripts. Use this doc as the quick map of how the code is structured and which dependencies and conventions are in play.

## Stack and tooling
- Runtime: Node.js (ESM, `"type": "module"` in `package.json`)
- Test runner: `@playwright/test`
- MCP planner: `@playwright/mcp` (used in some tests as a planner for multi-step flows)
- Lint/format: ESLint + Prettier (see `eslint.config.js`)

## Project layout
- `pages/`: Page Object Models (POMs) used by tests
  - `pages/demo-qa/DemoQALandingPage.ts`
  - `pages/fox-news/FoxNewsLandingPage.ts`
  - `pages/microsoft/MicrosoftLandingPage.ts`
  - `pages/fox-news/updateFoxNewsNav.ts` (script to scrape Fox News nav and update JSON)
- `tests/`: Playwright test specs
  - `tests/foxnews-headlines.spec.ts`: uses `FoxNewsLandingPage` to extract headlines and persist JSON to `data/`
  - `tests/romania-headlines.spec.ts`: loads `setup/news/romania.json`, visits multiple sites, saves headlines to `data/`
  - `tests/demoqa-landing-basic.spec.ts`: DemoQA landing page checks using `DemoQALandingPage`
  - `tests/seed.spec.ts`: basic Fox News smoke check
  - `tests/example.spec.ts`: simple Microsoft homepage title check
  - `tests/demoqa-filter.spec.ts`: currently contains a class definition, not a test spec
- `setup/`: Static inputs and seed data
  - `setup/fox-news/constants/foxnewsNav.json`: generated via `pages/fox-news/updateFoxNewsNav.ts`
  - `setup/news/romania.json`: input for the Romania headline tests
- `data/`: Output directory created by tests at runtime
- `playwright.config.ts`: Playwright config, projects, timeouts, reporter

## Playwright configuration
- `globalSetup: ./tests/global-setup`
- `testDir: ./tests`
- `projects`: chromium, firefox, webkit (desktop)
- `use.baseURL`: `process.env.BASE_URL || 'https://example.com'`
- Per-test timeouts: `timeout: 30_000`, `expect: { timeout: 5_000 }`

## Environment variables
- `BASE_URL`: default base URL used by Playwright `page.goto('/')` in page objects like DemoQA
- `BASE_URL_FOXNEWS`: overrides Fox News homepage for tests and nav scraper

## Scripts
- `npm run test`: `npx playwright test`
- `npm run test:headed`: `npx playwright test --headed`
- `npm run eslint` / `npm run lint:fix` / `npm run prettier`

## Data generation
`pages/fox-news/updateFoxNewsNav.ts`:
- launches Chromium via Playwright
- navigates to `BASE_URL_FOXNEWS` (or `https://www.foxnews.com/`)
- scrapes the main navigation and submenu items
- writes JSON to `setup/fox-news/constants/foxnewsNav.json`

## Conventions and notes
- ESM: `__dirname` is polyfilled using `fileURLToPath(import.meta.url)` where needed.
- Tests write output JSON to `data/`; ensure the directory exists or create it at runtime.
- Page objects are simple and intentionally lightweight; tests do the assertions.
