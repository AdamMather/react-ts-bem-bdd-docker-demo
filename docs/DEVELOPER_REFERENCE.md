# Developer Reference (Cradle To Grave)

## 1. Project Overview

`react-contact-search` is a React + Vite application for maintaining:

- contacts
- addresses linked to contacts
- vehicles linked to contacts

The default runtime currently uses an in-memory API adapter (`src/services/mockApi.ts`) rather than the Express/PostgreSQL server, which keeps local development and testing deterministic.

## 2. Tech Stack

Frontend:

- React 18
- Vite 7
- React Router 6
- TypeScript-style typing in `.ts/.tsx` modules (mixed with `.jsx`)

Testing:

- Cucumber (`@cucumber/cucumber`) + Playwright (BDD flow)
- Playwright Test (`@playwright/test`) for accessibility and visual regression
- `@axe-core/playwright` for automated accessibility scans

Backend (present but not wired into npm scripts):

- Node.js + Express
- PostgreSQL via `pg`

## 3. Repository Layout

```text
.
├── src/
│   ├── pages/Home/                  # Top-level app workflow/orchestration
│   ├── components/                  # UI building blocks and detail forms
│   ├── config/index.ts              # API URLs + navigation keys + field config
│   ├── services/mockApi.ts          # In-memory API used by UI
│   ├── utils/data.ts                # Fetch/suggestions hook
│   ├── utils/date.ts                # Date formatting helper
│   └── server/                      # Express + Postgres backend (optional path)
├── tests/
│   ├── features/                    # Gherkin feature files
│   ├── step_definitions/            # Cucumber step code + hooks
│   └── e2e/                         # Playwright Test suites + snapshots
├── scripts/                         # Local helper scripts
├── playwright.config.js             # Playwright Test config
└── eslint.config.js                 # Flat ESLint config
```

## 4. Environment And Configuration

Primary `.env` keys:

- `VITE_API_BASE_URL`: frontend API base URL
- `API_HOST`, `API_PORT`: Express server bind settings
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: PostgreSQL connection

Frontend config is composed in `src/config/index.ts`.

Important behavior:

- The UI calls `mockApi` directly, not `axios` to backend endpoints.
- The configured API URLs are still used as route-like keys for `mockApi` path matching.

## 5. Getting Started

## 5.1 Prerequisites

- Node.js 18+ (recommended)
- npm 9+

## 5.2 Install

```bash
npm install
```

## 5.3 Run Frontend

```bash
npm run dev
```

App URL:

- `http://127.0.0.1:5173` (or next available Vite port)

## 5.4 Build

```bash
npm run build
```

## 5.5 Lint

```bash
npm run lint
```

## 6. Runtime Architecture

## 6.1 App Entry

- `src/main.jsx` mounts the app.
- `src/App.jsx` sets a single route (`/`) to `Home`.

## 6.2 Home Page State Machine

`src/pages/Home/Home.tsx` controls view transitions through navigation flags:

- `nav_contact_list`
- `nav_contacts`
- `nav_address`
- `nav_vehicles`

Home orchestrates:

- selected records
- add/edit mode switching
- save/delete handlers for contact/address/vehicle domains

## 6.3 Domain Components

- `ContactDetail`: contact form plus embedded address/vehicle list panels
- `AddressDetail`: address form
- `VehicleDetail`: vehicle form with autocomplete make/model
- `ListView`: searchable table + row select/edit
- `ActionBar`: add/delete actions per domain

## 6.4 Data Flow Pattern

1. UI events call handlers in `Home` or detail components.
2. Handlers call `mockApi` CRUD methods.
3. Parent view state and selection state are updated.
4. Child list/form components rerender with new data.

## 7. Data Model

Source: `src/types/index.ts`

- `Contact`: `id`, names, phone/mobile, email, preferred channel
- `Address`: `id`, `contact_id`, address lines, postcode, occupancy dates
- `Vehicle`: `id`, `contact_id`, make/model, registered/purchased dates

`mockApi` seeds initial records and auto-creates default address + vehicle when creating a new contact.

## 8. Accessibility And Testability Contract

The UI now includes:

- `data-testid` selectors on key controls and containers
- explicit `aria-label` attributes
- landmark/region semantics (`role`, `aria-labelledby`)
- status and error announcements via `aria-live` and `role="alert"`

This contract is used by Playwright tests and should be preserved during refactors.

Guideline:

- prefer adding selectors to stable semantic controls, not styling-only wrappers
- prefer role/name locators first in tests, then `data-testid` where needed for stability

## 9. Automated Testing

## 9.1 BDD Tests (Cucumber + Playwright)

Dry run:

```bash
npm run test:gherkin
```

Execute with managed dev server:

```bash
npm run test:gherkin:exec
```

Core files:

- `tests/features/detail-form.feature`
- `tests/step_definitions/detailFormSteps.js`
- `tests/step_definitions/hooks.js`

Coverage focus:

- contact form validation error paths

## 9.2 Playwright Test (Accessibility + Visual)

Run full suite:

```bash
npm run test:playwright:exec
```

Run directly (assumes app already running on `127.0.0.1:3000`):

```bash
npm run test:playwright
```

Open UI mode:

```bash
npm run test:playwright:ui
```

Config:

- `playwright.config.js`

Key defaults:

- test dir: `tests/e2e`
- browser: Chromium
- `testIdAttribute`: `data-testid`
- trace/video/screenshot on failure/retry
- screenshot diff tolerance via `maxDiffPixelRatio: 0.01`

## 9.3 Accessibility Scan (axe-core)

File:

- `tests/e2e/accessibility.spec.js`

Current assertion:

- fails if any `critical` or `serious` violations are found after entering contact detail view

## 9.4 Visual Regression

File:

- `tests/e2e/visual.spec.js`

Baselines:

- `tests/e2e/visual.spec.js-snapshots/home-page-chromium-linux.png`
- `tests/e2e/visual.spec.js-snapshots/contact-detail-form-chromium-linux.png`

Update baselines:

```bash
npm run test:playwright:update-snapshots:exec
```

## 9.5 Reports And Artifacts

- HTML report: `playwright-report/index.html`
- failure artifacts: `test-results/`

Open report:

```bash
npx playwright show-report
```

## 10. Scripts Reference

From `package.json`:

- `dev`, `start`: run Vite
- `build`: production build
- `lint`: ESLint check
- `test:gherkin`, `test:gherkin:exec`: BDD flow
- `test:playwright`, `test:playwright:exec`, `test:playwright:ui`
- `test:playwright:update-snapshots`, `test:playwright:update-snapshots:exec`

Helper shell scripts:

- `scripts/dev-up.sh`: starts Vite dev server
- `scripts/gherkin-exec.sh`: manual server wait + cucumber runner

## 11. Optional Real Backend Path (Express/PostgreSQL)

Backend code exists under `src/server/`:

- `index.js`: route definitions
- `config.js`: PostgreSQL pool creation from `.env`
- `contacts.js`: helper query module

To run backend manually:

```bash
node src/server/index.js
```

Important:

- frontend currently uses `mockApi` and does not use backend HTTP requests
- if switching to backend mode, replace `mockApi` calls with `axios` (or fetch) and align request/response contracts

Backend endpoints currently include:

- `/api/contacts`
- `/api/contact/names`
- `/api/vehicles`
- `/api/vehicles/:contactId`
- `/utils/vehiclemake`
- `/utils/vehiclemodel`

## 12. Known Risks / Technical Debt

1. Mixed JS/TS style:
- Codebase uses `.jsx` and `.tsx/.ts` together.
- Gradual migration plan recommended to reduce typing inconsistencies.

2. Unused/legacy state:
- `ListView` keeps `attributes` state that is currently not consumed.

3. Server-side bug risk:
- `src/server/index.js` vehicle delete route references `ids` but request body uses `selectedIds`.
- This path is not exercised by current UI runtime because of `mockApi`.

4. SQL interpolation risk:
- `/api/vehicles/:contactId` query uses template interpolation instead of parameterized placeholders.

5. Logging noise:
- multiple `console.log` calls in production code; consider centralized logging strategy.

## 13. Developer Workflow Recommendations

For feature work:

1. Start from `Home.tsx` flow impact.
2. Add/adjust `data-testid` and accessible labels for new controls.
3. Add or update:
- Gherkin scenario(s) for behavior
- Playwright tests for accessibility/visual coverage as needed
4. Run:
- `npm run lint`
- `npm run build`
- `npm run test:gherkin:exec`
- `npm run test:playwright:exec`

For intentional UI changes:

1. Validate locally with `test:playwright:exec`.
2. Regenerate baselines with `test:playwright:update-snapshots:exec`.
3. Review snapshot diffs before committing.

## 14. CI/CD Guidance (Recommended Baseline)

Suggested pipeline stages:

1. install: `npm ci`
2. lint: `npm run lint`
3. build: `npm run build`
4. bdd: `npm run test:gherkin:exec`
5. e2e/a11y/visual: `npm run test:playwright:exec`
6. upload artifacts:
- `playwright-report/`
- `test-results/`

Optional:

- fail PRs on accessibility violations
- protect snapshot updates behind explicit approval

## 15. Ownership Notes

If you onboard a new developer, this is the recommended reading order:

1. `docs/DEVELOPER_REFERENCE.md` (this file)
2. `src/pages/Home/Home.tsx`
3. `src/services/mockApi.ts`
4. `tests/features/detail-form.feature`
5. `tests/e2e/*.spec.js`

This sequence gives full context from runtime behavior to test expectations.
