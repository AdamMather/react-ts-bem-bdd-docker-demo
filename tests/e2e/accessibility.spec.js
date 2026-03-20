const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility', () => {
  test('home and contact form have no critical or serious a11y violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('home-page')).toBeVisible();

    await page.getByRole('button', { name: /add new contact/i }).click();
    await expect(page.getByTestId('contact-detail-form')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    const highImpactViolations = accessibilityScanResults.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact)
    );

    expect(highImpactViolations).toEqual([]);
  });

  test('kennel boarding list and enrolment form have no critical or serious a11y violations', async ({ page }) => {
    await page.goto('/kennel-boarding');
    await expect(page.getByRole('heading', { name: /pet enrolment administration/i })).toBeVisible();

    await page.getByRole('button', { name: /add new owner/i }).click();
    await expect(page.getByRole('heading', { name: /create pet owner enrolment/i })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    const highImpactViolations = accessibilityScanResults.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact)
    );

    expect(highImpactViolations).toEqual([]);
  });
});
