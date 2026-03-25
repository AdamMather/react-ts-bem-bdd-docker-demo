import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';
import kennelBoardingShared from '../../../tests/page_objects/kennelBoardingShared';

const stepButtonPattern = /next step|review details/i;
const {
  CREATION_DECLARATION_LABELS,
  DEFAULT_JOURNEY_VALUES,
  FIELD_LABELS,
  REVIEW_SECTION_TITLES,
} = kennelBoardingShared;

class KennelBoardingTestPage {
  static async render() {
    const user = userEvent.setup();
    const module = await import('./KennelBoarding');
    const KennelBoarding = module.default;

    render(<KennelBoarding />);
    await screen.findByRole('heading', { name: /pet enrolment administration/i });

    return new KennelBoardingTestPage(user);
  }

  constructor(user) {
    this.user = user;
  }

  field(label) {
    return screen.getByLabelText(FIELD_LABELS[label] ?? label);
  }

  setFieldValue(label, value) {
    const field = this.field(label);
    fireEvent.change(field, {
      target: {
        value,
        name: field.getAttribute('name'),
      },
    });
  }

  async clickButton(name) {
    await this.user.click(screen.getByRole('button', { name }));
  }

  async clickNext() {
    await this.clickButton(/next step/i);
  }

  async clickStepAdvance() {
    await this.user.click(screen.getByRole('button', { name: stepButtonPattern }));
  }

  async startNewEnrolment() {
    await this.clickButton(/add new owner/i);
    await screen.findByRole('heading', { name: /create pet owner enrolment/i });
  }

  async filterOwners(query) {
    fireEvent.change(screen.getByTestId('list-view-search'), { target: { value: query } });
  }

  async selectOwnerRecord(id) {
    await this.user.click(screen.getByTestId(`select-row-${id}`));
  }

  async deleteSelectedOwners() {
    await this.user.click(screen.getByTestId('delete-owner-button'));
  }

  async expectOwnerRecordVisible(id) {
    expect(screen.getByTestId(`list-row-${id}`)).toBeInTheDocument();
  }

  async expectOwnerRecordNotVisible(id) {
    expect(screen.queryByTestId(`list-row-${id}`)).not.toBeInTheDocument();
  }

  async expectBanner(message) {
    await screen.findByRole('status');
    expect(screen.getByRole('status')).toHaveTextContent(message);
  }

  async expectError(message) {
    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(message);
  }

  async fillOwnerDetails({ fullName, phone }) {
    this.setFieldValue('Full name', fullName);
    this.setFieldValue('Phone number', phone);
  }

  async fillPetDetails({ petName }) {
    this.setFieldValue('Pet name', petName);
  }

  async fillVetDetails({ vetPracticeName }) {
    this.setFieldValue('Vet practice name', vetPracticeName);
  }

  async fillRoutineDetails({ foodType }) {
    this.setFieldValue('Food type', foodType);
  }

  async fillBookingDetails({ arrivalDate, departureDate, dropoffTime, collectionTime, signature }) {
    this.setFieldValue('Arrival date', arrivalDate);
    this.setFieldValue('Departure date', departureDate);
    this.setFieldValue('Drop-off time', dropoffTime);
    this.setFieldValue('Collection time', collectionTime);
    this.setFieldValue('Signature', signature);
  }

  async skipSteps(count) {
    for (let index = 0; index < count; index += 1) {
      await this.clickNext();
    }
  }

  async goToBookingStep({
    fullName = DEFAULT_JOURNEY_VALUES.owner.fullName,
    phone = DEFAULT_JOURNEY_VALUES.owner.phone,
    petName = DEFAULT_JOURNEY_VALUES.pet.petName,
    vetPracticeName = 'Riverside Vets',
    foodType = DEFAULT_JOURNEY_VALUES.routine.foodType,
  } = {}) {
    await this.fillOwnerDetails({ fullName, phone });
    await this.clickNext();

    await this.fillPetDetails({ petName });
    await this.clickNext();

    await this.fillVetDetails({ vetPracticeName });
    await this.clickNext();

    await this.skipSteps(4);

    await this.fillRoutineDetails({ foodType });
    await this.clickStepAdvance();
    await screen.findByText('Booking and declaration');
  }

  async completeCreationJourney() {
    const creation = DEFAULT_JOURNEY_VALUES.creation;

    await this.startNewEnrolment();
    await this.fillOwnerDetails({ fullName: creation.fullName, phone: creation.phone });
    await this.user.click(screen.getAllByRole('radio', { name: 'Email' })[0]);
    await this.clickNext();

    await this.fillPetDetails({ petName: creation.petName });
    await this.user.click(screen.getByRole('radio', { name: 'Female' }));
    await this.user.click(screen.getByRole('checkbox', { name: /neutered \/ spayed/i }));
    await this.clickNext();

    await this.fillVetDetails({ vetPracticeName: creation.vetPracticeName });
    await this.clickNext();

    await this.user.click(screen.getByRole('checkbox', { name: /owner understands kennel does not process claims/i }));
    await this.clickNext();

    await this.user.click(screen.getByRole('checkbox', { name: /distemper/i }));
    await this.clickNext();

    await this.user.click(screen.getByRole('checkbox', { name: /medication required/i }));
    await this.clickNext();

    await this.user.click(screen.getByRole('checkbox', { name: /^dogs$/i }));
    await this.user.click(screen.getByRole('checkbox', { name: /separation anxiety/i }));
    await this.clickNext();

    await this.fillRoutineDetails({ foodType: creation.foodType });
    await this.user.click(screen.getByRole('checkbox', { name: /treats allowed/i }));
    await this.clickNext();

    await this.fillBookingDetails({
      arrivalDate: creation.arrivalDate,
      departureDate: creation.departureDate,
      dropoffTime: creation.dropoffTime,
      collectionTime: creation.collectionTime,
      signature: creation.signature,
    });
    for (const label of CREATION_DECLARATION_LABELS) {
      await this.user.click(screen.getByRole('checkbox', { name: new RegExp(label, 'i') }));
    }
    await this.clickStepAdvance();
    await screen.findByText('Confirmation');
  }

  async reviewAndConfirm() {
    await this.clickButton(/confirm and finish/i);
  }

  async editReviewSection(index) {
    await this.user.click(screen.getAllByRole('button', { name: 'Edit' })[index]);
  }

  async editInsuranceReviewSection() {
    const reviewCard = screen.getByText(REVIEW_SECTION_TITLES.insurance).closest('.boarding-form__review-card');
    await this.user.click(reviewCard.querySelector('button'));
  }

  async openExistingRecord(id) {
    await this.user.click(screen.getByTestId(`edit-row-${id}`));
  }

  async advanceToReviewFromExistingRecord() {
    await this.skipSteps(8);
    await this.clickStepAdvance();
    await screen.findByText('Confirmation');
  }

  async goBackFromReview() {
    await this.clickButton(/previous/i);
  }

  async waitForRecordRemoval(id) {
    await waitFor(() => {
      expect(screen.queryByTestId(`list-row-${id}`)).not.toBeInTheDocument();
    });
  }

  async applyEditBookingValues() {
    const edit = DEFAULT_JOURNEY_VALUES.edit;

    await this.fillBookingDetails({
      arrivalDate: edit.arrivalDate,
      departureDate: edit.departureDate,
      dropoffTime: edit.dropoffTime,
      collectionTime: edit.collectionTime,
      signature: edit.signature,
    });
  }
}

export default KennelBoardingTestPage;
