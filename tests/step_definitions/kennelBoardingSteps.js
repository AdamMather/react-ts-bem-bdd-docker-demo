const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');

const baseUrl = 'http://127.0.0.1:3000/kennel-boarding';

const fieldSelectors = {
  'Full name': 'input[name="full_name"]',
  'Phone number': 'input[name="phone"]',
  'Pet name': 'input[name="pet_name"]',
  'Vet practice name': 'input[name="vet_practice_name"]',
  'Food type': 'input[name="food_type"]',
  'Arrival date': 'input[name="arrival_date"]',
  'Departure date': 'input[name="departure_date"]',
  'Drop-off time': 'input[name="dropoff_time"]',
  'Collection time': 'input[name="collection_time"]',
  'Signature': 'input[name="signature"]',
};

const fillField = async (page, label, value) => {
  const selector = fieldSelectors[label];
  assert.ok(selector, `No selector configured for field "${label}"`);
  await page.locator(selector).fill(value);
};

const chooseAutocompleteSuggestion = async (page, inputName) => {
  const option = page.locator(`[data-testid="${inputName}-suggestion-0"]`);
  if (await option.count()) {
    await option.first().click();
  }
};

const clickNext = async (page) => {
  await page.getByRole('button', { name: /next step|review details/i }).click();
};

const completeValidJourney = async (page) => {
  await fillField(page, 'Full name', 'Jordan Miles');
  await fillField(page, 'Phone number', '07123456789');
  await page.locator('input[name="email"]').fill('jordan.miles@example.com');
  await clickNext(page);

  await fillField(page, 'Pet name', 'Biscuit');
  await page.locator('input[name="species"]').fill('Dog');
  await chooseAutocompleteSuggestion(page, 'species');
  await page.locator('input[name="breed"]').fill('Cockapoo');
  await chooseAutocompleteSuggestion(page, 'breed');
  await clickNext(page);

  await page.locator('input[name="vet_practice_name"]').fill('Riverside Vets');
  await chooseAutocompleteSuggestion(page, 'vet_practice_name');
  await clickNext(page);

  await clickNext(page);
  await clickNext(page);
  await clickNext(page);
  await clickNext(page);

  await fillField(page, 'Food type', 'Chicken kibble');
  await clickNext(page);

  await fillField(page, 'Arrival date', '2026-04-10');
  await fillField(page, 'Departure date', '2026-04-15');
  await fillField(page, 'Drop-off time', '09:30');
  await fillField(page, 'Collection time', '11:00');
  await fillField(page, 'Signature', 'Jordan Miles');

  await page.getByLabel('Information supplied is accurate').check();
  await page.getByLabel('Owner agrees to boarding terms').check();
  await page.getByLabel('Owner gives privacy consent').check();

  await page.getByRole('button', { name: /review details/i }).click();
};

Given('I navigate to the kennel boarding page', async function () {
  await this.page.goto(baseUrl);
});

Given('I start a new kennel boarding enrolment', async function () {
  await this.page.goto(baseUrl);
  await this.page.getByRole('button', { name: /add new owner/i }).click();
});

When('I submit the current kennel boarding step', async function () {
  await this.page.getByRole('button', { name: /next step|review details/i }).click();
});

When('I enter {string} into the kennel field {string}', async function (value, label) {
  await fillField(this.page, label, value);
});

When('I complete the kennel boarding journey with valid data', async function () {
  await completeValidJourney(this.page);
});

When('I edit the kennel section {string}', async function (sectionTitle) {
  const section = this.page.locator('.boarding-form__review-card').filter({ hasText: sectionTitle });
  await section.getByRole('button', { name: /edit/i }).click();
});

When('I advance to the kennel confirmation page', async function () {
  if (await this.page.getByRole('button', { name: /next step/i }).isVisible().catch(() => false)) {
    await clickNext(this.page);
  }

  for (let index = 0; index < 3; index += 1) {
    const reviewButton = this.page.getByRole('button', { name: /review details/i });
    if (await reviewButton.isVisible().catch(() => false)) {
      await reviewButton.click();
      return;
    }

    const nextButton = this.page.getByRole('button', { name: /next step/i });
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click();
    }
  }
});

When('I confirm the kennel boarding enrolment', async function () {
  await this.page.getByRole('button', { name: /confirm and finish/i }).click();
});

Then('I should see the kennel boarding page heading', async function () {
  await this.page.getByRole('heading', { name: /pet enrolment administration/i }).waitFor();
});

Then('I should see the owner search field', async function () {
  const visible = await this.page.getByTestId('list-view-search').isVisible();
  assert.equal(visible, true);
});

Then('I should see the add owner button', async function () {
  const visible = await this.page.getByRole('button', { name: /add new owner/i }).isVisible();
  assert.equal(visible, true);
});

Then('I should see the owner results table', async function () {
  const visible = await this.page.getByTestId('list-view-table').isVisible();
  assert.equal(visible, true);
});

Then('I should see the kennel boarding error message {string}', async function (message) {
  const text = await this.page.locator('.boarding-form__error').textContent();
  assert.equal((text || '').trim(), message);
});

Then('I should see the kennel step {string}', async function (stepLabel) {
  const text = await this.page.locator('.boarding-form__progressbar-meta span').first().textContent();
  assert.equal((text || '').trim(), stepLabel);
});

Then('I should see the kennel confirmation page', async function () {
  const visible = await this.page.locator('.boarding-form__review').isVisible();
  assert.equal(visible, true);
});

Then('I should see {string} in the kennel review content', async function (value) {
  const text = await this.page.locator('.boarding-form__review').textContent();
  assert.equal((text || '').includes(value), true);
});

Then('I should return to the kennel boarding list view', async function () {
  await this.page.getByTestId('list-view-table').waitFor();
});

Then('I should see a kennel boarding success banner', async function () {
  const text = await this.page.locator('.boarding-page__banner').textContent();
  assert.equal(Boolean((text || '').trim()), true);
});
