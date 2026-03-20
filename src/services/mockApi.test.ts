import { describe, expect, it, vi, beforeEach } from 'vitest';

const loadMockApi = async () => {
  vi.resetModules();
  const module = await import('./mockApi');
  return module.default;
};

describe('mockApi kennel boarding coverage', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns filtered kennel boarding lookup suggestions', async () => {
    const mockApi = await loadMockApi();

    const speciesResponse = await mockApi.get('/api/boarding/lookups/species', { params: { query: 'do' } });
    const vetResponse = await mockApi.get('/api/boarding/lookups/vets', { params: { query: 'river' } });

    expect(speciesResponse.data.suggestions).toEqual([{ name: 'Dog' }]);
    expect(vetResponse.data.suggestions).toEqual(
      expect.arrayContaining([{ name: 'Riverside Vets' }])
    );
  });

  it('creates, updates, and deletes a boarding owner record', async () => {
    const mockApi = await loadMockApi();

    const created = await mockApi.post('/api/boarding/owners', {
      id: 0,
      full_name: 'Taylor Green',
      address: '',
      postcode: '',
      phone: '07000000000',
      email: 'taylor.green@example.com',
      preferred_contact: 'phone',
      emergency_contact_name: 'Riley Green',
      emergency_contact_relationship: 'Sibling',
      emergency_contact_phone: '07111111111',
      emergency_contact_preferred_contact: 'phone',
      pet_name: 'Maple',
      species: 'Dog',
      breed: 'Beagle',
      date_of_birth: '',
      sex: 'F',
      neutered: true,
      colour: '',
      distinguishing_features: '',
      microchip_number: '',
      pet_photo_name: '',
      vet_practice_name: 'Riverside Vets',
      vet_phone: '',
      emergency_vet_consent: true,
      treatment_cost_limit: '',
      insurance_provider_name: '',
      policy_holder_name: '',
      policy_number: '',
      emergency_claims_phone: '',
      excess_amount: '',
      exclusions: '',
      insurance_consent: false,
      vaccinations: ['Distemper'],
      vaccination_next_due_date: '',
      vaccination_card_file_name: '',
      health_conditions: '',
      medication_required: false,
      medication_name: '',
      dose: '',
      administration_time: '',
      special_instructions: '',
      recent_illness: false,
      flea_treatment_date: '',
      worming_treatment_date: '',
      mix_with_other_dogs: 'yes',
      aggression_toward: [],
      separation_anxiety: false,
      escape_risk: false,
      triggers: '',
      food_provided_by_owner: true,
      food_type: 'Turkey kibble',
      feeding_times: '',
      portion_size: '',
      treats_allowed: true,
      exercise_preferences: '',
      arrival_date: '2026-04-20',
      departure_date: '2026-04-22',
      dropoff_time: '09:00',
      collection_time: '10:00',
      grooming: false,
      additional_exercise: false,
      training_session: false,
      owner_instructions: '',
      vaccinated_agreement: true,
      free_from_illness_agreement: true,
      vet_treatment_authorized_agreement: true,
      owner_responsible_costs_agreement: true,
      info_accurate_agreement: true,
      agrees_terms: true,
      privacy_consent: true,
      signature: 'Taylor Green',
      signed_date: '2026-03-20',
    });

    expect(created.data.id).toBeGreaterThan(3);

    await mockApi.put(`/api/boarding/owners/${created.data.id}`, {
      ...created.data,
      food_type: 'Salmon kibble',
      treats_allowed: false,
    });

    const afterUpdate = await mockApi.get('/api/boarding/owners');
    expect(afterUpdate.data.find((record) => record.id === created.data.id)).toMatchObject({
      food_type: 'Salmon kibble',
      treats_allowed: false,
    });

    await mockApi.delete('/api/boarding/owners', { data: { ids: [created.data.id] } });

    const afterDelete = await mockApi.get('/api/boarding/owners');
    expect(afterDelete.data.some((record) => record.id === created.data.id)).toBe(false);
  });
});

