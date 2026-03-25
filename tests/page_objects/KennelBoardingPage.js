const { expect } = require('@playwright/test');
const {
  DEFAULT_JOURNEY_VALUES,
  FIELD_LABELS,
  REQUIRED_DECLARATION_LABELS,
} = require('./kennelBoardingShared');

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
    const accessibleLabel = FIELD_LABELS[label];
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
    fullName = DEFAULT_JOURNEY_VALUES.owner.fullName,
    phone = DEFAULT_JOURNEY_VALUES.owner.phone,
    email = DEFAULT_JOURNEY_VALUES.owner.email,
  } = {}) {
    await this.fillField('Full name', fullName);
    await this.fillField('Phone number', phone);
    await this.fillField('Email address', email);
  }

  async fillPetDetails({
    petName = DEFAULT_JOURNEY_VALUES.pet.petName,
    speciesQuery = DEFAULT_JOURNEY_VALUES.pet.speciesQuery,
    breedQuery = DEFAULT_JOURNEY_VALUES.pet.breedQuery,
  } = {}) {
    await this.fillField('Pet name', petName);
    await this.fillAutocompleteField('Species', speciesQuery, 'species');
    await expect(this.field('Species')).toHaveValue(/dog/i);
    await this.fillAutocompleteField('Breed', breedQuery, 'breed');
  }

  async fillVetDetails({ vetPracticeName = DEFAULT_JOURNEY_VALUES.vet.vetPracticeName } = {}) {
    await this.fillAutocompleteField('Vet practice name', vetPracticeName, 'vet_practice_name');
  }

  async fillRoutineDetails({ foodType = DEFAULT_JOURNEY_VALUES.routine.foodType } = {}) {
    await this.fillField('Food type', foodType);
  }

  async fillBookingDetails({
    arrivalDate = DEFAULT_JOURNEY_VALUES.booking.arrivalDate,
    departureDate = DEFAULT_JOURNEY_VALUES.booking.departureDate,
    dropoffTime = DEFAULT_JOURNEY_VALUES.booking.dropoffTime,
    collectionTime = DEFAULT_JOURNEY_VALUES.booking.collectionTime,
    signature = DEFAULT_JOURNEY_VALUES.booking.signature,
  } = {}) {
    await this.fillField('Arrival date', arrivalDate);
    await this.fillField('Departure date', departureDate);
    await this.fillField('Drop-off time', dropoffTime);
    await this.fillField('Collection time', collectionTime);
    await this.fillField('Signature', signature);
  }

  async acceptRequiredDeclarations() {
    for (const label of REQUIRED_DECLARATION_LABELS) {
      await this.page.getByLabel(label).check();
    }
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
