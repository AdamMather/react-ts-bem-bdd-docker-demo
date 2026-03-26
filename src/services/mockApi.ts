import { Address, BoardingOwnerRecord, Contact, Vehicle } from '../types';
import { createEmptyBoardingOwnerRecord } from '../utils/boarding';

type QueryParams = Record<string, string>;

interface RequestOptions {
  params?: QueryParams;
  data?: { ids?: number[]; selectedIds?: number[] };
}

const normalizePath = (url: string): string => {
  if (!url) {
    return '';
  }

  try {
    return new URL(url, 'http://local.mock').pathname;
  } catch {
    return url;
  }
};

const toDate = (value: Date | string): Date => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
};

let nextContactId = 4;
let nextAddressId = 4;
let nextVehicleId = 4;
let nextBoardingOwnerId = 4;

let contacts: Contact[] = [
  {
    id: 1,
    first_name: 'Alice',
    last_name: 'Morris',
    telephone: '02079461234',
    mobile: '07700900111',
    email: 'alice.morris@example.com',
    primary_contact: 'email',
  },
  {
    id: 2,
    first_name: 'Ben',
    last_name: 'Hughes',
    telephone: '02079464567',
    mobile: '07700900222',
    email: 'ben.hughes@example.com',
    primary_contact: 'mobile',
  },
  {
    id: 3,
    first_name: 'Chloe',
    last_name: 'Patel',
    telephone: '02079467890',
    mobile: '07700900333',
    email: 'chloe.patel@example.com',
    primary_contact: 'telephone',
  },
];

let addresses: Address[] = [
  {
    id: 1,
    contact_id: 1,
    addressLine1: '10 Fleet Street',
    addressLine2: 'London',
    addressLine3: '',
    addressLine4: '',
    postcode: 'EC4Y 1AA',
    occupyStart: new Date('2021-01-01'),
    occupyEnd: new Date('2023-12-31'),
  },
  {
    id: 2,
    contact_id: 2,
    addressLine1: '12 Deansgate',
    addressLine2: 'Manchester',
    addressLine3: '',
    addressLine4: '',
    postcode: 'M3 2BW',
    occupyStart: new Date('2022-06-01'),
    occupyEnd: new Date('2024-01-31'),
  },
  {
    id: 3,
    contact_id: 3,
    addressLine1: '1 Queen Street',
    addressLine2: 'Bristol',
    addressLine3: '',
    addressLine4: '',
    postcode: 'BS1 4JQ',
    occupyStart: new Date('2020-09-15'),
    occupyEnd: new Date('2025-02-28'),
  },
];

let vehicles: Vehicle[] = [
  {
    id: 1,
    contact_id: 1,
    make: 'Toyota',
    model: 'Corolla',
    registered: new Date('2021-03-10'),
    purchased: new Date('2021-05-01'),
  },
  {
    id: 2,
    contact_id: 2,
    make: 'Ford',
    model: 'Focus',
    registered: new Date('2020-11-15'),
    purchased: new Date('2021-02-20'),
  },
  {
    id: 3,
    contact_id: 3,
    make: 'Tesla',
    model: 'Model 3',
    registered: new Date('2022-08-08'),
    purchased: new Date('2022-09-01'),
  },
];

let boardingOwners: BoardingOwnerRecord[] = [
  createEmptyBoardingOwnerRecord({
    id: 1,
    full_name: 'Alice Morris',
    address: '10 Fleet Street, London',
    postcode: 'EC4Y 1AA',
    phone: '02079461234',
    email: 'alice.morris@example.com',
    preferred_contact: 'email',
    emergency_contact_name: 'James Morris',
    emergency_contact_relationship: 'Brother',
    emergency_contact_phone: '07700911122',
    emergency_contact_preferred_contact: 'phone',
    pet_name: 'Poppy',
    species: 'Dog',
    breed: 'Cockapoo',
    date_of_birth: '2021-05-12',
    sex: 'F',
    neutered: true,
    colour: 'Apricot',
    distinguishing_features: 'White patch on chest',
    microchip_number: '985141000111222',
    pet_photo_name: 'poppy-profile.jpg',
    vet_practice_name: 'Riverside Vets',
    vet_phone: '02071234567',
    emergency_vet_consent: true,
    treatment_cost_limit: '650',
    insurance_provider_name: 'Petplan',
    policy_holder_name: 'Alice Morris',
    policy_number: 'PP-001245',
    emergency_claims_phone: '0800123456',
    excess_amount: '95',
    exclusions: 'None noted',
    insurance_consent: true,
    vaccinations: ['Distemper', 'Parvovirus', 'Hepatitis', 'Leptospirosis', 'Kennel Cough'],
    vaccination_next_due_date: '2026-10-01',
    vaccination_card_file_name: 'poppy-vaccinations.pdf',
    health_conditions: 'Mild seasonal allergies',
    medication_required: true,
    medication_name: 'Piriton',
    dose: 'Half tablet',
    administration_time: 'Evening meal',
    special_instructions: 'Administer with food',
    recent_illness: false,
    flea_treatment_date: '2026-02-01',
    worming_treatment_date: '2026-02-15',
    mix_with_other_dogs: 'yes',
    aggression_toward: [],
    separation_anxiety: false,
    escape_risk: false,
    triggers: 'Vacuum cleaner',
    food_provided_by_owner: true,
    food_type: 'Dry kibble',
    feeding_times: '07:30, 17:30',
    portion_size: '120g',
    treats_allowed: true,
    exercise_preferences: 'Two group walks and ball play',
    arrival_date: '2026-04-02',
    departure_date: '2026-04-08',
    dropoff_time: '09:00',
    collection_time: '11:00',
    grooming: true,
    additional_exercise: false,
    training_session: false,
    owner_instructions: 'Prefers a quiet kennel near the garden run.',
    vaccinated_agreement: true,
    free_from_illness_agreement: true,
    vet_treatment_authorized_agreement: true,
    owner_responsible_costs_agreement: true,
    info_accurate_agreement: true,
    agrees_terms: true,
    privacy_consent: true,
    signature: 'Alice Morris',
    signed_date: '2026-03-15',
  }),
  createEmptyBoardingOwnerRecord({
    id: 2,
    full_name: 'Ben Hughes',
    address: '12 Deansgate, Manchester',
    postcode: 'M3 2BW',
    phone: '02079464567',
    email: 'ben.hughes@example.com',
    preferred_contact: 'phone',
    emergency_contact_name: 'Ella Hughes',
    emergency_contact_relationship: 'Partner',
    emergency_contact_phone: '07700922233',
    emergency_contact_preferred_contact: 'text',
    pet_name: 'Rex',
    species: 'Dog',
    breed: 'German Shepherd',
    date_of_birth: '2019-09-03',
    sex: 'M',
    neutered: true,
    colour: 'Black and tan',
    distinguishing_features: 'Scar above left eye',
    microchip_number: '985141000333444',
    pet_photo_name: 'rex.png',
    vet_practice_name: 'Meadow Lane Veterinary Group',
    vet_phone: '01611234567',
    emergency_vet_consent: true,
    treatment_cost_limit: '900',
    insurance_provider_name: 'Agria',
    policy_holder_name: 'Ben Hughes',
    policy_number: 'AG-778899',
    emergency_claims_phone: '0800456789',
    excess_amount: '120',
    exclusions: 'Hip dysplasia review',
    insurance_consent: true,
    vaccinations: ['Distemper', 'Parvovirus', 'Hepatitis', 'Leptospirosis'],
    vaccination_next_due_date: '2026-08-21',
    vaccination_card_file_name: 'rex-card.pdf',
    health_conditions: '',
    medication_required: false,
    recent_illness: false,
    flea_treatment_date: '2026-01-20',
    worming_treatment_date: '2026-02-20',
    mix_with_other_dogs: 'unsure',
    aggression_toward: ['dogs'],
    separation_anxiety: true,
    escape_risk: false,
    triggers: 'Loud bangs and umbrellas',
    food_provided_by_owner: false,
    food_type: 'Kennel working dog mix',
    feeding_times: '08:00, 18:00',
    portion_size: '2 cups',
    treats_allowed: false,
    exercise_preferences: 'Solo walks preferred',
    arrival_date: '2026-04-12',
    departure_date: '2026-04-18',
    dropoff_time: '10:30',
    collection_time: '13:30',
    grooming: false,
    additional_exercise: true,
    training_session: true,
    owner_instructions: 'Please avoid group play areas.',
    vaccinated_agreement: true,
    free_from_illness_agreement: true,
    vet_treatment_authorized_agreement: true,
    owner_responsible_costs_agreement: true,
    info_accurate_agreement: true,
    agrees_terms: true,
    privacy_consent: true,
    signature: 'Ben Hughes',
    signed_date: '2026-03-14',
  }),
  createEmptyBoardingOwnerRecord({
    id: 3,
    full_name: 'Chloe Patel',
    address: '1 Queen Street, Bristol',
    postcode: 'BS1 4JQ',
    phone: '02079467890',
    email: 'chloe.patel@example.com',
    preferred_contact: 'text',
    emergency_contact_name: 'Sanjay Patel',
    emergency_contact_relationship: 'Father',
    emergency_contact_phone: '07700933344',
    emergency_contact_preferred_contact: 'phone',
    pet_name: 'Milo',
    species: 'Cat',
    breed: 'British Shorthair',
    date_of_birth: '2022-02-10',
    sex: 'M',
    neutered: true,
    colour: 'Blue grey',
    distinguishing_features: 'Amber eyes',
    microchip_number: '985141000555666',
    vet_practice_name: 'Harbourside Vets',
    vet_phone: '01171234567',
    emergency_vet_consent: true,
    treatment_cost_limit: '500',
    insurance_provider_name: 'ManyPets',
    policy_holder_name: 'Chloe Patel',
    policy_number: 'MP-455221',
    emergency_claims_phone: '0800789123',
    excess_amount: '80',
    exclusions: '',
    insurance_consent: true,
    vaccinations: [],
    vaccination_next_due_date: '',
    vaccination_card_file_name: '',
    health_conditions: 'Sensitive stomach',
    medication_required: false,
    recent_illness: true,
    flea_treatment_date: '2026-02-28',
    worming_treatment_date: '2026-03-01',
    mix_with_other_dogs: 'no',
    aggression_toward: ['people'],
    separation_anxiety: false,
    escape_risk: true,
    triggers: 'Other cats nearby',
    food_provided_by_owner: true,
    food_type: 'Wet pouches',
    feeding_times: '07:00, 19:00',
    portion_size: '1 pouch',
    treats_allowed: true,
    exercise_preferences: 'Indoor play and climbing tower',
    arrival_date: '2026-05-05',
    departure_date: '2026-05-09',
    dropoff_time: '08:45',
    collection_time: '10:15',
    owner_instructions: 'Needs a covered hiding area.',
    vaccinated_agreement: true,
    free_from_illness_agreement: true,
    vet_treatment_authorized_agreement: true,
    owner_responsible_costs_agreement: true,
    info_accurate_agreement: true,
    agrees_terms: true,
    privacy_consent: true,
    signature: 'Chloe Patel',
    signed_date: '2026-03-16',
  }),
];

const vehicleMakes = ['Audi', 'BMW', 'Ford', 'Honda', 'Tesla', 'Toyota', 'Volkswagen'];
const vehicleModels = ['A3', 'Civic', 'Corolla', 'Focus', 'Golf', 'Model 3', 'X5'];
const petSpecies = ['Dog', 'Cat', 'Rabbit', 'Ferret'];
const petBreeds = ['British Shorthair', 'Cockapoo', 'German Shepherd', 'Labrador Retriever', 'Maine Coon', 'Mixed Breed'];
const vetPractices = ['Harbourside Vets', 'Meadow Lane Veterinary Group', 'Riverside Vets', 'Willow Tree Animal Clinic'];
const insuranceProviders = ['Agria', 'Bought By Many', 'ManyPets', 'Petplan'];

const filterSuggestions = (values: string[], query: string) =>
  values
    .filter((value) => value.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 10)
    .map((name) => ({ name }));

const deleteByIds = <T extends { id: number }>(items: T[], ids: number[]) =>
  items.filter((item) => !ids.includes(item.id));

const lookupSources: Record<string, string[]> = {
  '/utils/vehiclemake': vehicleMakes,
  '/utils/vehiclemodel': vehicleModels,
  '/api/boarding/lookups/species': petSpecies,
  '/api/boarding/lookups/breeds': petBreeds,
  '/api/boarding/lookups/vets': vetPractices,
  '/api/boarding/lookups/insurance-providers': insuranceProviders,
};

const getLookupResponse = (path: string, query = '') => {
  const values = lookupSources[path];
  if (!values) {
    return null;
  }

  return { data: { suggestions: filterSuggestions(values, query) } };
};

const normalizeAddressPayload = (data: Address): Address => ({
  ...data,
  occupyStart: toDate(data.occupyStart as Date | string),
  occupyEnd: toDate(data.occupyEnd as Date | string),
});

const normalizeVehiclePayload = (data: Vehicle): Vehicle => ({
  ...data,
  registered: toDate(data.registered),
  purchased: toDate(data.purchased),
});

const matchIdFromPath = (path: string, expression: RegExp) => {
  const match = path.match(expression);
  return match ? Number(match[1]) : null;
};

const createDefaultAddress = (contactId: number, firstName: string, lastName: string): Address => ({
  id: nextAddressId++,
  contact_id: contactId,
  addressLine1: `${firstName || 'New'} ${lastName || 'Contact'} House`,
  addressLine2: '1 Example Street',
  addressLine3: 'London',
  addressLine4: '',
  postcode: 'EC1A 1AA',
  occupyStart: new Date('2024-01-01'),
  occupyEnd: new Date('2026-12-31'),
});

const createDefaultVehicle = (contactId: number): Vehicle => ({
  id: nextVehicleId++,
  contact_id: contactId,
  make: 'Toyota',
  model: 'Corolla',
  registered: new Date('2023-04-01'),
  purchased: new Date('2023-05-15'),
});

const mockApi = {
  async get(url: string, options: RequestOptions = {}) {
    const path = normalizePath(url);
    const query = options.params?.query || '';

    const collectionResponses = {
      '/api/contacts': () => ({ data: contacts }),
      '/api/contact/names': () => ({
        data: contacts.map((contact) => ({
          id: contact.id,
          contact: `${contact.first_name} ${contact.last_name}`.trim(),
        })),
      }),
      '/api/contact/address': () => ({ data: addresses }),
      '/api/vehicles': () => ({ data: vehicles }),
      '/api/boarding/owners': () => ({ data: boardingOwners }),
    } satisfies Record<string, () => { data: unknown }>;

    const collectionResponse = collectionResponses[path]?.();
    if (collectionResponse) {
      return collectionResponse;
    }

    const addressContactId = matchIdFromPath(path, /^\/api\/contact\/address\/(\d+)$/);
    if (addressContactId !== null) {
      return { data: addresses.filter((address) => address.contact_id === addressContactId) };
    }

    const vehicleContactId = matchIdFromPath(path, /^\/api\/vehicles\/(\d+)$/);
    if (vehicleContactId !== null) {
      return { data: vehicles.filter((vehicle) => vehicle.contact_id === vehicleContactId) };
    }

    const lookupResponse = getLookupResponse(path, query);
    if (lookupResponse) {
      return lookupResponse;
    }

    return { data: [] };
  },

  async post(url: string, data: Contact | Address | Vehicle | BoardingOwnerRecord) {
    const path = normalizePath(url);

    if (path === '/api/contacts') {
      const contact = { ...(data as Contact), id: nextContactId++ };
      contacts = [...contacts, contact];
      addresses = [...addresses, createDefaultAddress(contact.id, contact.first_name, contact.last_name)];
      vehicles = [...vehicles, createDefaultVehicle(contact.id)];
      return { data: contact };
    }

    if (path === '/api/contact/address') {
      const address = { ...normalizeAddressPayload(data as Address), id: nextAddressId++ };
      addresses = [...addresses, address];
      return { data: address };
    }

    if (path === '/api/vehicles') {
      const vehicle = { ...normalizeVehiclePayload(data as Vehicle), id: nextVehicleId++ };
      vehicles = [...vehicles, vehicle];
      return { data: vehicle };
    }

    if (path === '/api/boarding/owners') {
      const owner = { ...(data as BoardingOwnerRecord), id: nextBoardingOwnerId++ };
      boardingOwners = [...boardingOwners, owner];
      return { data: owner };
    }

    return { data: null };
  },

  async put(url: string, data: Contact | Address | Vehicle | BoardingOwnerRecord) {
    const path = normalizePath(url);

    const contactId = matchIdFromPath(path, /^\/api\/contacts\/(\d+)$/);
    if (contactId !== null) {
      const id = contactId;
      contacts = contacts.map((contact) => (contact.id === id ? { ...(data as Contact), id } : contact));
      return { data: null };
    }

    const addressId = matchIdFromPath(path, /^\/api\/contact\/address\/(\d+)$/);
    if (addressId !== null) {
      const id = addressId;
      const nextAddress = normalizeAddressPayload(data as Address);
      addresses = addresses.map((address) =>
        address.id === id
          ? {
              ...nextAddress,
              id,
            }
          : address
      );
      return { data: null };
    }

    const vehicleId = matchIdFromPath(path, /^\/api\/vehicles\/(\d+)$/);
    if (vehicleId !== null) {
      const id = vehicleId;
      const nextVehicle = normalizeVehiclePayload(data as Vehicle);
      vehicles = vehicles.map((vehicle) =>
        vehicle.id === id
          ? {
              ...nextVehicle,
              id,
            }
          : vehicle
      );
      return { data: null };
    }

    const boardingOwnerId = matchIdFromPath(path, /^\/api\/boarding\/owners\/(\d+)$/);
    if (boardingOwnerId !== null) {
      const id = boardingOwnerId;
      boardingOwners = boardingOwners.map((owner) =>
        owner.id === id ? { ...(data as BoardingOwnerRecord), id } : owner
      );
      return { data: null };
    }

    return { data: null };
  },

  async delete(url: string, options: RequestOptions = {}) {
    const path = normalizePath(url);
    const ids = options.data?.ids || options.data?.selectedIds || [];

    if (path === '/api/contacts') {
      contacts = deleteByIds(contacts, ids);
      addresses = addresses.filter((address) => !ids.includes(address.contact_id));
      vehicles = vehicles.filter((vehicle) => !ids.includes(vehicle.contact_id));
      return { data: null };
    }

    if (path === '/api/contact/address') {
      addresses = deleteByIds(addresses, ids);
      return { data: null };
    }

    if (path === '/api/vehicles') {
      vehicles = deleteByIds(vehicles, ids);
      return { data: null };
    }

    if (path === '/api/boarding/owners') {
      boardingOwners = deleteByIds(boardingOwners, ids);
      return { data: null };
    }

    return { data: null };
  },
};

export default mockApi;
