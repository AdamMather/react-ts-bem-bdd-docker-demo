import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const renderKennelBoarding = async () => {
  vi.resetModules();
  vi.stubEnv('VITE_USE_MOCK_API', 'true');
  const module = await import('./KennelBoarding');
  const KennelBoarding = module.default;
  const user = userEvent.setup();

  render(<KennelBoarding />);

  await screen.findByRole('heading', { name: /pet enrolment administration/i });
  return { user };
};

const setFieldValue = (label, value) => {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value, name: screen.getByLabelText(label).getAttribute('name') },
  });
};

const startNewEnrolment = async (user) => {
  await user.click(screen.getByRole('button', { name: /add new owner/i }));
  await screen.findByRole('heading', { name: /create pet owner enrolment/i });
};

const goToBookingStep = async (user) => {
  setFieldValue('Full name', 'Jordan Miles');
  setFieldValue('Phone number', '07123456789');
  await user.click(screen.getByRole('button', { name: /next step/i }));

  setFieldValue('Pet name', 'Biscuit');
  await user.click(screen.getByRole('button', { name: /next step/i }));

  setFieldValue('Vet practice name', 'Riverside Vets');
  await user.click(screen.getByRole('button', { name: /next step/i }));

  for (let index = 0; index < 4; index += 1) {
    await user.click(screen.getByRole('button', { name: /next step/i }));
  }

  setFieldValue('Food type', 'Chicken kibble');
  await user.click(screen.getByRole('button', { name: /next step|review details/i }));

  await screen.findByText('Booking and declaration');
};

describe('KennelBoarding', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('filters and deletes boarding owners from the list view', async () => {
    const { user } = await renderKennelBoarding();

    fireEvent.change(screen.getByTestId('list-view-search'), { target: { value: 'poppy' } });

    expect(screen.getByTestId('list-row-1')).toBeInTheDocument();
    expect(screen.queryByTestId('list-row-2')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('select-row-1'));
    await user.click(screen.getByTestId('delete-owner-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('list-row-1')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('status')).toHaveTextContent('Boarding enrolment deleted.');
  }, 10000);

  it('shows step validation and blocks confirmation until declarations are accepted', async () => {
    const { user } = await renderKennelBoarding();

    await startNewEnrolment(user);
    await user.click(screen.getByRole('button', { name: /next step/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Owner Details: full name is required.');

    await goToBookingStep(user);

    setFieldValue('Arrival date', '2026-04-10');
    setFieldValue('Departure date', '2026-04-15');
    setFieldValue('Drop-off time', '09:30');
    setFieldValue('Collection time', '11:00');
    setFieldValue('Signature', 'Jordan Miles');
    await user.click(screen.getByRole('button', { name: /review details/i }));

    await screen.findByText('Confirmation');
    await user.click(screen.getByRole('button', { name: /confirm and finish/i }));

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Booking & Consent: please confirm the declaration and privacy consent.'
    );
    expect(screen.getByText('Booking and declaration')).toBeInTheDocument();
  }, 20000);

  it('creates a boarding enrolment after completing review and declarations', async () => {
    const { user } = await renderKennelBoarding();

    await startNewEnrolment(user);

    setFieldValue('Full name', 'Morgan Lee');
    setFieldValue('Phone number', '07123456789');
    await user.click(screen.getAllByRole('radio', { name: 'Email' })[0]);
    await user.click(screen.getByRole('button', { name: /next step/i }));

    setFieldValue('Pet name', 'Scout');
    await user.click(screen.getByRole('radio', { name: 'Female' }));
    await user.click(screen.getByRole('checkbox', { name: /neutered \/ spayed/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));

    setFieldValue('Vet practice name', 'Riverside Vets');
    await user.click(screen.getByRole('button', { name: /next step/i }));

    await user.click(screen.getByRole('checkbox', { name: /owner understands kennel does not process claims/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));

    await user.click(screen.getByRole('checkbox', { name: /distemper/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));

    await user.click(screen.getByRole('checkbox', { name: /medication required/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));

    await user.click(screen.getByRole('checkbox', { name: /dogs/i }));
    await user.click(screen.getByRole('checkbox', { name: /separation anxiety/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));

    setFieldValue('Food type', 'Salmon kibble');
    await user.click(screen.getByRole('checkbox', { name: /treats allowed/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));

    setFieldValue('Arrival date', '2026-04-20');
    setFieldValue('Departure date', '2026-04-22');
    setFieldValue('Drop-off time', '09:00');
    setFieldValue('Collection time', '11:00');
    setFieldValue('Signature', 'Morgan Lee');
    await user.click(screen.getByRole('checkbox', { name: /vaccinations are up to date/i }));
    await user.click(screen.getByRole('checkbox', { name: /pet is free from contagious illness/i }));
    await user.click(screen.getByRole('checkbox', { name: /vet treatment is authorized if needed/i }));
    await user.click(screen.getByRole('checkbox', { name: /owner accepts treatment costs/i }));
    await user.click(screen.getByRole('checkbox', { name: /information supplied is accurate/i }));
    await user.click(screen.getByRole('checkbox', { name: /owner agrees to boarding terms/i }));
    await user.click(screen.getByRole('checkbox', { name: /owner gives privacy consent/i }));
    await user.click(screen.getByRole('button', { name: /review details/i }));

    await screen.findByText('Confirmation');
    expect(screen.getAllByText(/morgan lee/i).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[3]);
    expect(screen.getByText('Pet insurance')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /review details/i }));

    await user.click(screen.getByRole('button', { name: /confirm and finish/i }));

    await screen.findByRole('status');
    expect(screen.getByRole('status')).toHaveTextContent('Boarding enrolment created.');
    expect(screen.getByText('Morgan Lee')).toBeInTheDocument();
  }, 20000);

  it('edits an existing boarding enrolment and supports returning from review', async () => {
    const { user } = await renderKennelBoarding();

    await user.click(screen.getByTestId('edit-row-2'));
    await screen.findByRole('heading', { name: /update pet owner enrolment/i });

    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /review details/i }));

    await screen.findByText('Confirmation');
    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(screen.getByText('Booking and declaration')).toBeInTheDocument();

    setFieldValue('Signature', 'Ben Hughes Updated');
    await user.click(screen.getByRole('button', { name: /review details/i }));
    await user.click(screen.getByRole('button', { name: /confirm and finish/i }));

    await screen.findByRole('status');
    expect(screen.getByRole('status')).toHaveTextContent('Boarding enrolment updated.');
  }, 20000);
});
