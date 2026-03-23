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

  it('supports contact, address, and vehicle list routes and CRUD flows', async () => {
    const mockApi = await loadMockApi();

    const contactsResponse = await mockApi.get('/api/contacts');
    const namesResponse = await mockApi.get('/api/contact/names');
    const allAddresses = await mockApi.get('/api/contact/address');
    const contactAddresses = await mockApi.get('/api/contact/address/1');
    const allVehicles = await mockApi.get('/api/vehicles');
    const contactVehicles = await mockApi.get('/api/vehicles/1');

    expect(contactsResponse.data.length).toBeGreaterThan(0);
    expect(namesResponse.data[0]).toMatchObject({ id: 1, contact: 'Alice Morris' });
    expect(allAddresses.data.length).toBeGreaterThan(0);
    expect(contactAddresses.data.every((address) => address.contact_id === 1)).toBe(true);
    expect(allVehicles.data.length).toBeGreaterThan(0);
    expect(contactVehicles.data.every((vehicle) => vehicle.contact_id === 1)).toBe(true);

    const createdContact = await mockApi.post('/api/contacts', {
      id: 0,
      first_name: 'Nina',
      last_name: 'West',
      telephone: '02070000000',
      mobile: '07123000000',
      email: 'nina@example.com',
      primary_contact: 'email',
    });

    expect(createdContact.data.id).toBeGreaterThan(3);

    const createdAddress = await mockApi.get(`/api/contact/address/${createdContact.data.id}`);
    const createdVehicle = await mockApi.get(`/api/vehicles/${createdContact.data.id}`);

    expect(createdAddress.data[0]).toMatchObject({
      contact_id: createdContact.data.id,
      addressLine1: 'Nina West House',
    });
    expect(createdVehicle.data[0]).toMatchObject({
      contact_id: createdContact.data.id,
      make: 'Toyota',
      model: 'Corolla',
    });

    await mockApi.put(`/api/contacts/${createdContact.data.id}`, {
      ...createdContact.data,
      mobile: '07999999999',
    });
    await mockApi.put(`/api/contact/address/${createdAddress.data[0].id}`, {
      ...createdAddress.data[0],
      postcode: 'ZZ1 1ZZ',
      occupyStart: '2025-01-01',
      occupyEnd: '2025-12-31',
    });
    await mockApi.put(`/api/vehicles/${createdVehicle.data[0].id}`, {
      ...createdVehicle.data[0],
      make: 'Honda',
      registered: '2025-04-02',
      purchased: '2025-04-10',
    });

    const updatedContacts = await mockApi.get('/api/contacts');
    const updatedAddresses = await mockApi.get(`/api/contact/address/${createdContact.data.id}`);
    const updatedVehicles = await mockApi.get(`/api/vehicles/${createdContact.data.id}`);

    expect(updatedContacts.data.find((contact) => contact.id === createdContact.data.id)).toMatchObject({
      mobile: '07999999999',
    });
    expect(updatedAddresses.data[0]).toMatchObject({ postcode: 'ZZ1 1ZZ' });
    expect(updatedVehicles.data[0]).toMatchObject({ make: 'Honda' });

    await mockApi.delete('/api/contact/address', { data: { ids: [createdAddress.data[0].id] } });
    await mockApi.delete('/api/vehicles', { data: { ids: [createdVehicle.data[0].id] } });
    await mockApi.delete('/api/contacts', { data: { ids: [createdContact.data.id] } });

    const contactsAfterDelete = await mockApi.get('/api/contacts');
    const addressesAfterDelete = await mockApi.get(`/api/contact/address/${createdContact.data.id}`);
    const vehiclesAfterDelete = await mockApi.get(`/api/vehicles/${createdContact.data.id}`);

    expect(contactsAfterDelete.data.some((contact) => contact.id === createdContact.data.id)).toBe(false);
    expect(addressesAfterDelete.data).toEqual([]);
    expect(vehiclesAfterDelete.data).toEqual([]);
  });

  it('returns additional lookup suggestions and empty results for unknown routes', async () => {
    const mockApi = await loadMockApi();

    const vehicleMakesResponse = await mockApi.get('/utils/vehiclemake', { params: { query: 'to' } });
    const vehicleModelsResponse = await mockApi.get('/utils/vehiclemodel', { params: { query: 'mo' } });
    const breedsResponse = await mockApi.get('/api/boarding/lookups/breeds', { params: { query: 'br' } });
    const insuranceResponse = await mockApi.get('/api/boarding/lookups/insurance-providers', { params: { query: 'pe' } });
    const unknownResponse = await mockApi.get('/api/unknown');
    const unknownPost = await mockApi.post('/api/unknown', { id: 1 } as never);
    const unknownPut = await mockApi.put('/api/unknown/1', { id: 1 } as never);
    const unknownDelete = await mockApi.delete('/api/unknown', { data: { ids: [1] } });

    expect(vehicleMakesResponse.data.suggestions).toEqual([{ name: 'Toyota' }]);
    expect(vehicleModelsResponse.data.suggestions).toEqual([{ name: 'Model 3' }]);
    expect(breedsResponse.data.suggestions).toEqual([{ name: 'British Shorthair' }]);
    expect(insuranceResponse.data.suggestions).toEqual([{ name: 'Petplan' }]);
    expect(unknownResponse.data).toEqual([]);
    expect(unknownPost.data).toBeNull();
    expect(unknownPut.data).toBeNull();
    expect(unknownDelete.data).toBeNull();
  });
});
