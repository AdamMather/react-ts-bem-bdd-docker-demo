# Kennel Boarding Testing Coverage

## Goal

Increase automated coverage for the kennel boarding app using the guidance in `docs/testing best practice.pdf`, while keeping the suite aligned with established testing best practices from trusted sources.

## Inputs Used

### Local project inputs

- `docs/testing best practice.pdf`
- `docs/boarding/specification.txt`
- Existing Cucumber tests in `tests/features/kennel-boarding.feature`
- Existing Playwright setup in `tests/e2e/`
- Current kennel boarding implementation in `src/pages/KennelBoarding/KennelBoarding.tsx`

### Trusted external guidance consulted

- Atlassian on software testing levels and the testing pyramid:
  https://www.atlassian.com/br/continuous-delivery/software-testing
- Playwright locator guidance for stable, user-facing selectors:
  https://playwright.dev/docs/locators
- Playwright accessibility guidance, including the recommendation to combine automated a11y checks with manual assessment:
  https://playwright.dev/java/docs/accessibility-testing

## What the PDF Contributed

The PDF was image-based, so it was rendered to images and reviewed visually. Its main guidance shaped the coverage strategy:

- Cover multiple testing layers rather than relying on E2E alone.
- Prefer a testing-pyramid balance: more fast lower-level checks, fewer high-value E2E tests.
- Keep functional and acceptance tests user-focused with Given/When/Then style flows.
- Use exploratory and performance testing as complementary activities, not replacements for automated regression tests.

## Steps Taken

1. Inspected the kennel boarding page, current automation stack, and existing test coverage.
2. Rendered the PDF to images because text extraction returned no usable text.
3. Mapped the current gaps against the boarding journey:
   create, validation, review/confirm, search/filter, delete, accessibility.
4. Added a fast lower-level test layer with Vitest and Testing Library.
5. Added kennel-specific browser coverage with Playwright.
6. Extended accessibility coverage to include the kennel boarding journey.
7. Ran the relevant automated suites and recorded the results.

## Coverage Added

### 1. Lower-level automated coverage

Files:

- `src/pages/KennelBoarding/KennelBoarding.test.jsx`
- `src/services/mockApi.test.ts`
- `tests/setup/vitest.setup.js`

Coverage added:

- List filtering behavior in the kennel boarding list view
- Delete flow from the list view with success feedback
- Step-level required-field validation
- Booking declaration / privacy confirmation guard before final save
- Mock API lookup suggestion behavior
- Mock API create, update, and delete lifecycle for boarding records

Why this layer was added:

- The PDF emphasized a testing pyramid.
- Atlassian’s testing guidance also supports a mix of unit, integration, and higher-level tests.
- These tests are fast, deterministic, and catch regressions without requiring a full browser session.

### 2. Browser-level Playwright coverage

Files:

- `tests/e2e/kennel-boarding.spec.js`
- `tests/e2e/accessibility.spec.js`

Coverage added:

- Search and delete of an existing boarding enrolment
- Autocomplete suggestion interaction for species, breed, and vet practice
- Booking confirmation failure when declarations are missing
- Successful final confirmation after required declarations are accepted
- Accessibility scan for the kennel boarding list and enrolment form

Why this layer was added:

- The PDF called out functional, end-to-end, and acceptance-style coverage.
- Playwright’s locator guidance informed the use of stable role- and test-id-based selectors rather than brittle CSS-only selectors.

### 3. Existing BDD coverage retained and verified

File:

- `tests/features/kennel-boarding.feature`

Verified existing coverage:

- Main list-view rendering
- Required-step validation
- Full review, edit, and confirm journey

## Tooling Changes

Files:

- `package.json`
- `vite.config.js`

Changes:

- Added `test:unit` for Vitest
- Added Vitest configuration for `jsdom`
- Updated `ci-local` to run lower-level tests before the Gherkin suite

## Verification Performed

Passed:

- `npm run test:unit`
- `npm run test:gherkin:kennel-boarding`
- `npx start-server-and-test "vite --host 127.0.0.1 --port 3000 --strictPort" http://127.0.0.1:3000 "playwright test tests/e2e/accessibility.spec.js tests/e2e/kennel-boarding.spec.js --reporter=line"`

Observed during validation:

- `npm run test:playwright` still fails because of pre-existing visual snapshot mismatches in `tests/e2e/visual.spec.js` for the home/contact screens.
- The new kennel boarding Playwright tests passed when run independently from that unrelated visual regression suite.

## Process Followed

The overall process followed the same structure recommended by the PDF and external guidance:

- Start with the business-critical user journey and existing gaps.
- Add faster tests first for validation and data behavior.
- Add a small number of high-value end-to-end checks for critical workflows.
- Keep accessibility in the automated regression path.
- Avoid overloading the suite with brittle UI-only assertions when lower-level tests can cover the same logic more cheaply.

## Remaining Recommended Follow-up

To extend coverage further, the next useful additions would be:

- A manual exploratory test charter for edge cases like long owner names, rapid step navigation, and unusual booking notes
- A lightweight performance check for large list rendering or repeated lookup requests
- Resolution or refresh of the unrelated visual baselines in `tests/e2e/visual.spec.js`
