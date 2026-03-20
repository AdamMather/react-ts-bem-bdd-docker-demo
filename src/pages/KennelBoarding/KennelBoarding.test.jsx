import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

const startNewEnrolment = async (user) => {
  await user.click(screen.getByRole('button', { name: /add new owner/i }));
  await screen.findByRole('heading', { name: /create pet owner enrolment/i });
};

const goToBookingStep = async (user) => {
  await user.type(screen.getByLabelText('Full name'), 'Jordan Miles');
  await user.type(screen.getByLabelText('Phone number'), '07123456789');
  await user.click(screen.getByRole('button', { name: /next step/i }));

  await user.type(screen.getByLabelText('Pet name'), 'Biscuit');
  await user.click(screen.getByRole('button', { name: /next step/i }));

  await user.type(screen.getByLabelText('Vet practice name'), 'Riverside Vets');
  await user.click(screen.getByRole('button', { name: /next step/i }));

  for (let index = 0; index < 4; index += 1) {
    await user.click(screen.getByRole('button', { name: /next step/i }));
  }

  await user.type(screen.getByLabelText('Food type'), 'Chicken kibble');
  await user.click(screen.getByRole('button', { name: /next step|review details/i }));

  await screen.findByText('Booking and declaration');
};

describe('KennelBoarding', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('filters and deletes boarding owners from the list view', async () => {
    const { user } = await renderKennelBoarding();

    const search = screen.getByTestId('list-view-search');
    await user.type(search, 'poppy');

    expect(screen.getByTestId('list-row-1')).toBeInTheDocument();
    expect(screen.queryByTestId('list-row-2')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('select-row-1'));
    await user.click(screen.getByTestId('delete-owner-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('list-row-1')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('status')).toHaveTextContent('Boarding enrolment deleted.');
  });

  it('shows step validation and blocks confirmation until declarations are accepted', async () => {
    const { user } = await renderKennelBoarding();

    await startNewEnrolment(user);
    await user.click(screen.getByRole('button', { name: /next step/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Owner Details: full name is required.');

    await goToBookingStep(user);

    await user.type(screen.getByLabelText('Arrival date'), '2026-04-10');
    await user.type(screen.getByLabelText('Departure date'), '2026-04-15');
    await user.type(screen.getByLabelText('Drop-off time'), '09:30');
    await user.type(screen.getByLabelText('Collection time'), '11:00');
    await user.type(screen.getByLabelText('Signature'), 'Jordan Miles');
    await user.click(screen.getByRole('button', { name: /review details/i }));

    await screen.findByText('Confirmation');
    await user.click(screen.getByRole('button', { name: /confirm and finish/i }));

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Booking & Consent: please confirm the declaration and privacy consent.'
    );
    expect(screen.getByText('Booking and declaration')).toBeInTheDocument();
  });
});
