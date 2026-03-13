# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

For full project lifecycle documentation, see:

- `docs/DEVELOPER_REFERENCE.md`

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Automated Testing

This project now includes:

- Cucumber + Playwright browser tests
- Playwright Test (with `data-testid` selectors)
- Accessibility testing with `@axe-core/playwright`
- Visual regression testing with Playwright snapshots

### Playwright + Axe

Run the Playwright suite against a local dev server:

```bash
npm run test:playwright:exec
```

Accessibility test file:

- `tests/e2e/accessibility.spec.js`

It runs `axe-core` and fails on `critical` and `serious` accessibility violations.

### Visual Regression

Visual test file:

- `tests/e2e/visual.spec.js`

Snapshot baselines are stored in:

- `tests/e2e/visual.spec.js-snapshots/`

Generate or refresh baseline snapshots:

```bash
npm run test:playwright:update-snapshots:exec
```

### Reports And Artifacts

After Playwright runs:

- HTML report: `playwright-report/index.html`
- Failure artifacts: `test-results/`

Open report locally:

```bash
npx playwright show-report
```

## Docker

Build the production image:

```bash
docker build -t vac-test .
```

Run the container (serves on port 8080):

```bash
docker run --rm -p 8080:80 vac-test
```

Or use Docker Compose (starts Postgres, API server, then the web app):

```bash
docker-compose up --build
```
