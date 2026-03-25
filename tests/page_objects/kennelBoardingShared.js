const FIELD_LABELS = {
  Species: 'Pet species',
  Breed: 'Pet breed',
  'Full name': 'Full name',
  'Phone number': 'Phone number',
  'Email address': 'Email address',
  'Pet name': 'Pet name',
  'Vet practice name': 'Vet practice name',
  'Food type': 'Food type',
  'Arrival date': 'Arrival date',
  'Departure date': 'Departure date',
  'Drop-off time': 'Drop-off time',
  'Collection time': 'Collection time',
  Signature: 'Signature',
};

const DEFAULT_JOURNEY_VALUES = {
  owner: {
    fullName: 'Jordan Miles',
    phone: '07123456789',
    email: 'jordan.miles@example.com',
  },
  pet: {
    petName: 'Biscuit',
    speciesQuery: 'Do',
    breedQuery: 'Cock',
  },
  vet: {
    vetPracticeName: 'River',
  },
  routine: {
    foodType: 'Chicken kibble',
  },
  booking: {
    arrivalDate: '2026-04-10',
    departureDate: '2026-04-15',
    dropoffTime: '09:30',
    collectionTime: '11:00',
    signature: 'Jordan Miles',
  },
  creation: {
    fullName: 'Morgan Lee',
    phone: '07123456789',
    petName: 'Scout',
    vetPracticeName: 'Riverside Vets',
    foodType: 'Salmon kibble',
    arrivalDate: '2026-04-20',
    departureDate: '2026-04-22',
    dropoffTime: '09:00',
    collectionTime: '11:00',
    signature: 'Morgan Lee',
  },
  edit: {
    arrivalDate: '2026-04-12',
    departureDate: '2026-04-18',
    dropoffTime: '10:30',
    collectionTime: '13:30',
    signature: 'Ben Hughes Updated',
  },
};

const REQUIRED_DECLARATION_LABELS = [
  'Information supplied is accurate',
  'Owner agrees to boarding terms',
  'Owner gives privacy consent',
];

const CREATION_DECLARATION_LABELS = [
  'Vaccinations are up to date',
  'Pet is free from contagious illness',
  'Vet treatment is authorized if needed',
  'Owner accepts treatment costs',
  ...REQUIRED_DECLARATION_LABELS,
];

const REVIEW_SECTION_TITLES = {
  insurance: 'Insurance',
};

module.exports = {
  CREATION_DECLARATION_LABELS,
  DEFAULT_JOURNEY_VALUES,
  FIELD_LABELS,
  REQUIRED_DECLARATION_LABELS,
  REVIEW_SECTION_TITLES,
};
