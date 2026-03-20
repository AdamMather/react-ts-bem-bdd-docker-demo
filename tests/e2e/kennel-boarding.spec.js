const { test, expect } = require('@playwright/test');

const completeBookingJourney = async (page) => {
  await page.getByRole('button', { name: /add new owner/i }).click();

  await page.getByLabel('Full name').fill('Jordan Miles');
  await page.getByLabel('Phone number').fill('07123456789');
  await page.getByRole('button', { name: /next step/i }).click();

  await page.getByLabel('Pet name').fill('Biscuit');
  await page.getByLabel('Pet species').fill('Do');
  await expect(page.getByTestId('species-suggestion-0')).toBeVisible();
  await page.getByTestId('species-suggestion-0').click();
  await expect(page.getByLabel('Pet species')).toHaveValue('Dog');

  await page.getByLabel('Pet breed').fill('Cock');
  await expect(page.getByTestId('breed-suggestion-0')).toBeVisible();
  await page.getByTestId('breed-suggestion-0').click();
  await page.getByRole('button', { name: /next step/i }).click();

  await page.getByLabel('Vet practice name').fill('River');
  await expect(page.getByTestId('vet_practice_name-suggestion-0')).toBeVisible();
  await page.getByTestId('vet_practice_name-suggestion-0').click();
  await page.getByRole('button', { name: /next step/i }).click();

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: /next step/i }).click();
  }

  await page.getByLabel('Food type').fill('Chicken kibble');
  await page.getByRole('button', { name: /next step/i }).click();

  await page.getByLabel('Arrival date').fill('2026-04-10');
  await page.getByLabel('Departure date').fill('2026-04-15');
  await page.getByLabel('Drop-off time').fill('09:30');
  await page.getByLabel('Collection time').fill('11:00');
  await page.getByLabel('Signature').fill('Jordan Miles');
};

test.describe('Kennel boarding', () => {
  test('filters and deletes an existing boarding enrolment', async ({ page }) => {
    await page.goto('/kennel-boarding');

    await page.getByTestId('list-view-search').fill('poppy');
    await expect(page.getByTestId('list-row-1')).toBeVisible();
    await expect(page.locator('[data-testid^="list-row-"]')).toHaveCount(1);

    await page.getByTestId('select-row-1').check();
    await page.getByTestId('delete-owner-button').click();

    await expect(page.getByRole('status')).toHaveText(/Boarding enrolment deleted\./i);
    await expect(page.locator('[data-testid^="list-row-"]')).toHaveCount(0);
  });

  test('requires declarations before final confirmation and then saves successfully', async ({ page }) => {
    await page.goto('/kennel-boarding');

    await completeBookingJourney(page);
    await page.getByRole('button', { name: /review details/i }).click();

    await expect(page.locator('.boarding-form__review')).toBeVisible();
    await page.getByRole('button', { name: /confirm and finish/i }).click();

    await expect(page.getByRole('alert')).toHaveText(
      'Booking & Consent: please confirm the declaration and privacy consent.'
    );
    await expect(page.getByText('Booking and declaration')).toBeVisible();

    await page.getByLabel('Information supplied is accurate').check();
    await page.getByLabel('Owner agrees to boarding terms').check();
    await page.getByLabel('Owner gives privacy consent').check();
    await page.getByRole('button', { name: /review details/i }).click();
    await page.getByRole('button', { name: /confirm and finish/i }).click();

    await expect(page.getByRole('status')).toHaveText(/Boarding enrolment created\./i);
    await expect(page.getByTestId('list-view-table')).toBeVisible();
  });
});
