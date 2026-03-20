const { test, expect } = require('@playwright/test');
const KennelBoardingPage = require('../page_objects/KennelBoardingPage');

test.describe('Kennel boarding', () => {
  test('filters and deletes an existing boarding enrolment', async ({ page }) => {
    const kennelBoardingPage = new KennelBoardingPage(page);
    await kennelBoardingPage.goto();

    await kennelBoardingPage.filterOwners('poppy');
    await expect(page.getByTestId('list-row-1')).toBeVisible();
    await kennelBoardingPage.expectFilteredRowCount(1);

    await kennelBoardingPage.selectOwnerRecord(1);
    await kennelBoardingPage.deleteSelectedOwners();

    await kennelBoardingPage.expectSuccessBannerVisible(/Boarding enrolment deleted\./i);
    await kennelBoardingPage.expectFilteredRowCount(0);
  });

  test('requires declarations before final confirmation and then saves successfully', async ({ page }) => {
    const kennelBoardingPage = new KennelBoardingPage(page);
    await kennelBoardingPage.goto();

    await kennelBoardingPage.startNewEnrolment();
    await kennelBoardingPage.completeJourneyToBookingStep();
    await kennelBoardingPage.fillBookingDetails();
    await kennelBoardingPage.reviewDetailsButton.click();

    await kennelBoardingPage.expectConfirmationPageVisible();
    await kennelBoardingPage.confirmEnrolment();

    await kennelBoardingPage.expectErrorMessage(
      'Booking & Consent: please confirm the declaration and privacy consent.'
    );
    await expect(page.getByText('Booking and declaration')).toBeVisible();

    await kennelBoardingPage.acceptRequiredDeclarations();
    await kennelBoardingPage.reviewDetailsButton.click();
    await kennelBoardingPage.confirmEnrolment();

    await kennelBoardingPage.expectSuccessBannerVisible(/Boarding enrolment created\./i);
    await kennelBoardingPage.expectListViewVisible();
  });
});
