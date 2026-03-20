const { expect } = require('@playwright/test');

class KennelBoardingPage {
  constructor(page, baseUrl = 'http://127.0.0.1:3000') {
    this.page = page;
    this.baseUrl = baseUrl;
    this.path = '/kennel-boarding';
  }

  get heading() {
    return this.page.getByRole('heading', { name: /pet enrolment administration/i });
  }

  get addOwnerButton() {
    return this.page.getByRole('button', { name: /add new owner/i });
  }

  get searchField() {
    return this.page.getByTestId('list-view-search');
  }

  get resultsTable() {
    return this.page.getByTestId('list-view-table');
  }

  get listRows() {
    return this.page.locator('[data-testid^="list-row-"]');
  }

  get errorAlert() {
    return this.page.getByRole('alert');
  }

  get successBanner() {
    return this.page.getByRole('status');
  }

  get reviewSection() {
    return this.page.locator('.boarding-form__review');
  }

  get nextStepButton() {
    return this.page.getByRole('button', { name: /next step/i });
  }

  get reviewDetailsButton() {
    return this.page.getByRole('button', { name: /review details/i });
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: /confirm and finish/i });
  }

  async goto() {
    await this.page.goto(`${this.baseUrl}${this.path}`);
  }

  async startNewEnrolment() {
    await this.goto();
    await this.addOwnerButton.click();
    await expect(this.page.getByRole('heading', { name: /create pet owner enrolment/i })).toBeVisible();
  }

  field(label) {
    const accessibleLabels = {
      Species: 'Pet species',
      Breed: 'Pet breed',
      'Full name': 'Full name',
      'Phone number': 'Phone number',
      'Email address': 'Email address',
      'Pet name': 'Pet name',
      'Vet practice name': 'Vet practice name',
      'Food type': 'Food type',
      'Arrival date': 'Arrival date',
      'Departure date': 'Departure date',
      'Drop-off time': 'Drop-off time',
      'Collection time': 'Collection time',
      Signature: 'Signature',
    };

    const accessibleLabel = accessibleLabels[label];
    if (!accessibleLabel) {
      throw new Error(`No field mapping configured for "${label}"`);
    }

    return this.page.getByLabel(accessibleLabel, { exact: true });
  }

  async fillField(label, value) {
    await this.field(label).fill(value);
  }

  async enterField(label, value) {
    await this.fillField(label, value);
  }

  async fillAutocompleteField(label, query, suggestionTestId) {
    const input = this.field(label);
    await input.fill(query);
    const firstSuggestion = this.page.getByTestId(`${suggestionTestId}-suggestion-0`);
    await expect(firstSuggestion).toBeVisible();
    await firstSuggestion.click();
  }

  async chooseAutocompleteSuggestion(inputName) {
    const firstSuggestion = this.page.getByTestId(`${inputName}-suggestion-0`);
    await expect(firstSuggestion).toBeVisible();
    await firstSuggestion.click();
  }

  async submitCurrentStep() {
    const button = (await this.reviewDetailsButton.isVisible().catch(() => false))
      ? this.reviewDetailsButton
      : this.nextStepButton;

    await button.click();
  }

  async skipCurrentStep(times = 1) {
    for (let index = 0; index < times; index += 1) {
      await this.nextStepButton.click();
    }
  }

  async fillOwnerDetails({
    fullName = 'Jordan Miles',
    phone = '07123456789',
    email = 'jordan.miles@example.com',
  } = {}) {
    await this.fillField('Full name', fullName);
    await this.fillField('Phone number', phone);
    await this.fillField('Email address', email);
  }

  async fillPetDetails({
    petName = 'Biscuit',
    speciesQuery = 'Do',
    breedQuery = 'Cock',
  } = {}) {
    await this.fillField('Pet name', petName);
    await this.fillAutocompleteField('Species', speciesQuery, 'species');
    await expect(this.field('Species')).toHaveValue(/dog/i);
    await this.fillAutocompleteField('Breed', breedQuery, 'breed');
  }

  async fillVetDetails({ vetPracticeName = 'River' } = {}) {
    await this.fillAutocompleteField('Vet practice name', vetPracticeName, 'vet_practice_name');
  }

  async fillRoutineDetails({ foodType = 'Chicken kibble' } = {}) {
    await this.fillField('Food type', foodType);
  }

  async fillBookingDetails({
    arrivalDate = '2026-04-10',
    departureDate = '2026-04-15',
    dropoffTime = '09:30',
    collectionTime = '11:00',
    signature = 'Jordan Miles',
  } = {}) {
    await this.fillField('Arrival date', arrivalDate);
    await this.fillField('Departure date', departureDate);
    await this.fillField('Drop-off time', dropoffTime);
    await this.fillField('Collection time', collectionTime);
    await this.fillField('Signature', signature);
  }

  async acceptRequiredDeclarations() {
    await this.page.getByLabel('Information supplied is accurate').check();
    await this.page.getByLabel('Owner agrees to boarding terms').check();
    await this.page.getByLabel('Owner gives privacy consent').check();
  }

  async completeJourneyToBookingStep() {
    await this.fillOwnerDetails();
    await this.nextStepButton.click();

    await this.fillPetDetails();
    await this.nextStepButton.click();

    await this.fillVetDetails();
    await this.nextStepButton.click();

    await this.skipCurrentStep(4);

    await this.fillRoutineDetails();
    await this.nextStepButton.click();
  }

  async completeValidJourney() {
    await this.completeJourneyToBookingStep();
    await this.fillBookingDetails();
    await this.acceptRequiredDeclarations();
    await this.reviewDetailsButton.click();
    await expect(this.reviewSection).toBeVisible();
  }

  async filterOwners(query) {
    await this.searchField.fill(query);
  }

  async selectOwnerRecord(id) {
    await this.page.getByTestId(`select-row-${id}`).check();
  }

  async deleteSelectedOwners() {
    await this.page.getByTestId('delete-owner-button').click();
  }

  async editSection(sectionTitle) {
    const section = this.page.locator('.boarding-form__review-card').filter({ hasText: sectionTitle });
    await section.getByRole('button', { name: /edit/i }).click();
  }

  async advanceToConfirmationPage() {
    if (await this.reviewDetailsButton.isVisible().catch(() => false)) {
      await this.reviewDetailsButton.click();
      return;
    }

    for (let index = 0; index < 6; index += 1) {
      if (await this.reviewDetailsButton.isVisible().catch(() => false)) {
        await this.reviewDetailsButton.click();
        return;
      }

      if (await this.nextStepButton.isVisible().catch(() => false)) {
        await this.nextStepButton.click();
      }
    }

    throw new Error('Unable to reach the confirmation page.');
  }

  async confirmEnrolment() {
    await this.confirmButton.click();
  }

  async expectHeadingVisible() {
    await expect(this.heading).toBeVisible();
  }

  async expectOwnerSearchVisible() {
    await expect(this.searchField).toBeVisible();
  }

  async expectAddOwnerVisible() {
    await expect(this.addOwnerButton).toBeVisible();
  }

  async expectResultsTableVisible() {
    await expect(this.resultsTable).toBeVisible();
  }

  async expectErrorMessage(message) {
    await expect(this.errorAlert).toHaveText(message);
  }

  async expectCurrentStep(stepLabel) {
    await expect(this.page.locator('.boarding-form__progressbar-meta span').first()).toHaveText(stepLabel);
  }

  async expectConfirmationPageVisible() {
    await expect(this.reviewSection).toBeVisible();
  }

  async expectReviewContains(value) {
    await expect(this.reviewSection).toContainText(value);
  }

  async expectListViewVisible() {
    await expect(this.resultsTable).toBeVisible();
  }

  async expectSuccessBannerVisible(message) {
    await expect(this.successBanner).toBeVisible();
    if (message) {
      await expect(this.successBanner).toHaveText(message);
    }
  }

  async expectFilteredRowCount(count) {
    await expect(this.listRows).toHaveCount(count);
  }
}

module.exports = KennelBoardingPage;
