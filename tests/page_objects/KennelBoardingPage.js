const assert = require('node:assert/strict');

class KennelBoardingPage {
  constructor(page) {
    this.page = page;
    this.baseUrl = 'http://127.0.0.1:3000/kennel-boarding';
    this.fieldSelectors = {
      'Full name': 'input[name="full_name"]',
      'Phone number': 'input[name="phone"]',
      'Pet name': 'input[name="pet_name"]',
      'Vet practice name': 'input[name="vet_practice_name"]',
      'Food type': 'input[name="food_type"]',
      'Arrival date': 'input[name="arrival_date"]',
      'Departure date': 'input[name="departure_date"]',
      'Drop-off time': 'input[name="dropoff_time"]',
      'Collection time': 'input[name="collection_time"]',
      Signature: 'input[name="signature"]',
    };
  }

  async goto() {
    await this.page.goto(this.baseUrl);
  }

  async startNewEnrolment() {
    await this.goto();
    await this.page.getByRole('button', { name: /add new owner/i }).click();
  }

  async submitCurrentStep() {
    await this.page.getByRole('button', { name: /next step|review details/i }).click();
  }

  async enterField(label, value) {
    const selector = this.fieldSelectors[label];
    assert.ok(selector, `No selector configured for field "${label}"`);
    await this.page.locator(selector).fill(value);
  }

  async chooseAutocompleteSuggestion(inputName) {
    const option = this.page.locator(`[data-testid="${inputName}-suggestion-0"]`);
    if (await option.count()) {
      await option.first().click();
    }
  }

  async completeValidJourney() {
    await this.enterField('Full name', 'Jordan Miles');
    await this.enterField('Phone number', '07123456789');
    await this.page.locator('input[name="email"]').fill('jordan.miles@example.com');
    await this.submitCurrentStep();

    await this.enterField('Pet name', 'Biscuit');
    await this.page.locator('input[name="species"]').fill('Dog');
    await this.chooseAutocompleteSuggestion('species');
    await this.page.locator('input[name="breed"]').fill('Cockapoo');
    await this.chooseAutocompleteSuggestion('breed');
    await this.submitCurrentStep();

    await this.page.locator('input[name="vet_practice_name"]').fill('Riverside Vets');
    await this.chooseAutocompleteSuggestion('vet_practice_name');
    await this.submitCurrentStep();

    await this.submitCurrentStep();
    await this.submitCurrentStep();
    await this.submitCurrentStep();
    await this.submitCurrentStep();

    await this.enterField('Food type', 'Chicken kibble');
    await this.submitCurrentStep();

    await this.enterField('Arrival date', '2026-04-10');
    await this.enterField('Departure date', '2026-04-15');
    await this.enterField('Drop-off time', '09:30');
    await this.enterField('Collection time', '11:00');
    await this.enterField('Signature', 'Jordan Miles');

    await this.page.getByLabel('Information supplied is accurate').check();
    await this.page.getByLabel('Owner agrees to boarding terms').check();
    await this.page.getByLabel('Owner gives privacy consent').check();

    await this.page.getByRole('button', { name: /review details/i }).click();
  }

  async editSection(sectionTitle) {
    const section = this.page.locator('.boarding-form__review-card').filter({ hasText: sectionTitle });
    await section.getByRole('button', { name: /edit/i }).click();
  }

  async advanceToConfirmationPage() {
    if (await this.page.getByRole('button', { name: /next step/i }).isVisible().catch(() => false)) {
      await this.submitCurrentStep();
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
  }

  async confirmEnrolment() {
    await this.page.getByRole('button', { name: /confirm and finish/i }).click();
  }

  async expectHeadingVisible() {
    await this.page.getByRole('heading', { name: /pet enrolment administration/i }).waitFor();
  }

  async expectOwnerSearchVisible() {
    assert.equal(await this.page.getByTestId('list-view-search').isVisible(), true);
  }

  async expectAddOwnerVisible() {
    assert.equal(await this.page.getByRole('button', { name: /add new owner/i }).isVisible(), true);
  }

  async expectResultsTableVisible() {
    assert.equal(await this.page.getByTestId('list-view-table').isVisible(), true);
  }

  async expectErrorMessage(message) {
    const text = await this.page.locator('.boarding-form__error').textContent();
    assert.equal((text || '').trim(), message);
  }

  async expectCurrentStep(stepLabel) {
    const text = await this.page.locator('.boarding-form__progressbar-meta span').first().textContent();
    assert.equal((text || '').trim(), stepLabel);
  }

  async expectConfirmationPageVisible() {
    assert.equal(await this.page.locator('.boarding-form__review').isVisible(), true);
  }

  async expectReviewContains(value) {
    const text = await this.page.locator('.boarding-form__review').textContent();
    assert.equal((text || '').includes(value), true);
  }

  async expectListViewVisible() {
    await this.page.getByTestId('list-view-table').waitFor();
  }

  async expectSuccessBannerVisible() {
    const text = await this.page.locator('.boarding-page__banner').textContent();
    assert.equal(Boolean((text || '').trim()), true);
  }
}

module.exports = KennelBoardingPage;
