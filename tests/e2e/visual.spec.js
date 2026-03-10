const { test, expect } = require('@playwright/test');

test.describe('Visual Regression', () => {
  test('home page matches baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page).toHaveScreenshot('home-page.png', { fullPage: true });
  });

  test('contact detail form matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add new contact/i }).click();
    await expect(page.getByTestId('contact-detail-form')).toBeVisible();
    await expect(page).toHaveScreenshot('contact-detail-form.png', { fullPage: true });
  });
});
