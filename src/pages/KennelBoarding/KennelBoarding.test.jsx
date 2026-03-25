import { beforeEach, describe, expect, it, vi } from 'vitest';
import KennelBoardingTestPage from './KennelBoardingTestPage.jsx';

describe('KennelBoarding', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.stubEnv('VITE_USE_MOCK_API', 'true');
  });

  it('filters and deletes boarding owners from the list view', async () => {
    const page = await KennelBoardingTestPage.render();

    await page.filterOwners('poppy');
    await page.expectOwnerRecordVisible(1);
    await page.expectOwnerRecordNotVisible(2);

    await page.selectOwnerRecord(1);
    await page.deleteSelectedOwners();
    await page.waitForRecordRemoval(1);
    await page.expectBanner('Boarding enrolment deleted.');
  }, 10000);

  it('shows step validation and blocks confirmation until declarations are accepted', async () => {
    const page = await KennelBoardingTestPage.render();

    await page.startNewEnrolment();
    await page.clickNext();
    await page.expectError('Owner Details: full name is required.');

    await page.goToBookingStep();
    await page.fillBookingDetails({
      arrivalDate: '2026-04-10',
      departureDate: '2026-04-15',
      dropoffTime: '09:30',
      collectionTime: '11:00',
      signature: 'Jordan Miles',
    });
    await page.clickStepAdvance();
    await page.reviewAndConfirm();

    await page.expectError('Booking & Consent: please confirm the declaration and privacy consent.');
  }, 20000);

  it('creates a boarding enrolment after completing review and declarations', async () => {
    const page = await KennelBoardingTestPage.render();

    await page.completeCreationJourney();
    expect(document.body.textContent).toMatch(/Morgan Lee/i);

    await page.editInsuranceReviewSection();
    expect(document.body.textContent).toMatch(/Pet insurance/i);
    await page.skipSteps(5);
    await page.clickStepAdvance();
    await page.reviewAndConfirm();

    await page.expectBanner('Boarding enrolment created.');
    expect(document.body.textContent).toMatch(/Morgan Lee/i);
  }, 20000);

  it('edits an existing boarding enrolment and supports returning from review', async () => {
    const page = await KennelBoardingTestPage.render();

    await page.openExistingRecord(2);
    await page.advanceToReviewFromExistingRecord();
    await page.goBackFromReview();
    expect(document.body.textContent).toMatch(/Booking and declaration/i);

    await page.applyEditBookingValues();
    await page.clickStepAdvance();
    await page.reviewAndConfirm();

    await page.expectBanner('Boarding enrolment updated.');
  }, 20000);
});
