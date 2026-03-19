const { Given, When, Then } = require('@cucumber/cucumber');

Given('I navigate to the kennel boarding page', async function () {
  await this.kennelBoardingPage.goto();
});

Given('I start a new kennel boarding enrolment', async function () {
  await this.kennelBoardingPage.startNewEnrolment();
});

When('I submit the current kennel boarding step', async function () {
  await this.kennelBoardingPage.submitCurrentStep();
});

When('I enter {string} into the kennel field {string}', async function (value, label) {
  await this.kennelBoardingPage.enterField(label, value);
});

When('I complete the kennel boarding journey with valid data', async function () {
  await this.kennelBoardingPage.completeValidJourney();
});

When('I edit the kennel section {string}', async function (sectionTitle) {
  await this.kennelBoardingPage.editSection(sectionTitle);
});

When('I advance to the kennel confirmation page', async function () {
  await this.kennelBoardingPage.advanceToConfirmationPage();
});

When('I confirm the kennel boarding enrolment', async function () {
  await this.kennelBoardingPage.confirmEnrolment();
});

Then('I should see the kennel boarding page heading', async function () {
  await this.kennelBoardingPage.expectHeadingVisible();
});

Then('I should see the owner search field', async function () {
  await this.kennelBoardingPage.expectOwnerSearchVisible();
});

Then('I should see the add owner button', async function () {
  await this.kennelBoardingPage.expectAddOwnerVisible();
});

Then('I should see the owner results table', async function () {
  await this.kennelBoardingPage.expectResultsTableVisible();
});

Then('I should see the kennel boarding error message {string}', async function (message) {
  await this.kennelBoardingPage.expectErrorMessage(message);
});

Then('I should see the kennel step {string}', async function (stepLabel) {
  await this.kennelBoardingPage.expectCurrentStep(stepLabel);
});

Then('I should see the kennel confirmation page', async function () {
  await this.kennelBoardingPage.expectConfirmationPageVisible();
});

Then('I should see {string} in the kennel review content', async function (value) {
  await this.kennelBoardingPage.expectReviewContains(value);
});

Then('I should return to the kennel boarding list view', async function () {
  await this.kennelBoardingPage.expectListViewVisible();
});

Then('I should see a kennel boarding success banner', async function () {
  await this.kennelBoardingPage.expectSuccessBannerVisible();
});
