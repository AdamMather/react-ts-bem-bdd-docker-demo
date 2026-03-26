import { BoardingOwnerRecord } from '../types';

export const boardingVaccinationOptions = ['Distemper', 'Parvovirus', 'Hepatitis', 'Leptospirosis', 'Kennel Cough'];
export const boardingAggressionOptions = ['dogs', 'people'];

export const boardingSteps = [
  { id: 'owner', label: 'Owner Details' },
  { id: 'pet', label: 'Pet Details' },
  { id: 'vet', label: 'Veterinary' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'vaccination', label: 'Vaccinations' },
  { id: 'health', label: 'Health & Medication' },
  { id: 'behaviour', label: 'Behaviour' },
  { id: 'routine', label: 'Feeding & Routine' },
  { id: 'booking', label: 'Booking & Consent' },
] as const;

export const boardingJourneySteps = [...boardingSteps, { id: 'review', label: 'Confirmation' }] as const;

export const boardingContactPreferenceOptions = [
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'Text', value: 'text' },
] as const;

export const boardingSexOptions = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
] as const;

export const boardingMixOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Unsure', value: 'unsure' },
] as const;

export const boardingDeclarationOptions = [
  'vaccinated_agreement',
  'free_from_illness_agreement',
  'vet_treatment_authorized_agreement',
  'owner_responsible_costs_agreement',
  'info_accurate_agreement',
  'agrees_terms',
  'privacy_consent',
] as const;

export const boardingDeclarationDisplayLabels = {
  vaccinated_agreement: 'Vaccinations are up to date',
  free_from_illness_agreement: 'Pet is free from contagious illness',
  vet_treatment_authorized_agreement: 'Vet treatment is authorized if needed',
  owner_responsible_costs_agreement: 'Owner accepts treatment costs',
  info_accurate_agreement: 'Information supplied is accurate',
  agrees_terms: 'Owner agrees to boarding terms',
  privacy_consent: 'Owner gives privacy consent',
} satisfies Record<(typeof boardingDeclarationOptions)[number], string>;

export const createEmptyBoardingOwnerRecord = (
  overrides: Partial<BoardingOwnerRecord> = {}
): BoardingOwnerRecord => ({
  id: 0,
  full_name: '',
  address: '',
  postcode: '',
  phone: '',
  email: '',
  preferred_contact: 'phone',
  emergency_contact_name: '',
  emergency_contact_relationship: '',
  emergency_contact_phone: '',
  emergency_contact_preferred_contact: 'phone',
  pet_name: '',
  species: '',
  breed: '',
  date_of_birth: '',
  sex: 'M',
  neutered: false,
  colour: '',
  distinguishing_features: '',
  microchip_number: '',
  pet_photo_name: '',
  vet_practice_name: '',
  vet_phone: '',
  emergency_vet_consent: false,
  treatment_cost_limit: '',
  insurance_provider_name: '',
  policy_holder_name: '',
  policy_number: '',
  emergency_claims_phone: '',
  excess_amount: '',
  exclusions: '',
  insurance_consent: false,
  vaccinations: [],
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
  food_provided_by_owner: false,
  food_type: '',
  feeding_times: '',
  portion_size: '',
  treats_allowed: false,
  exercise_preferences: '',
  arrival_date: '',
  departure_date: '',
  dropoff_time: '',
  collection_time: '',
  grooming: false,
  additional_exercise: false,
  training_session: false,
  owner_instructions: '',
  vaccinated_agreement: false,
  free_from_illness_agreement: false,
  vet_treatment_authorized_agreement: false,
  owner_responsible_costs_agreement: false,
  info_accurate_agreement: false,
  agrees_terms: false,
  privacy_consent: false,
  signature: '',
  signed_date: '',
  ...overrides,
});

export const getBoardingDeclarationValues = (record: BoardingOwnerRecord) =>
  boardingDeclarationOptions.filter((option) => Boolean(record[option]));
