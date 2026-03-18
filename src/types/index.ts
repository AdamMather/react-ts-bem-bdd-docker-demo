// src/types/index.ts
export interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    telephone: string;
    mobile: string;
    email: string;
    primary_contact: string;
}

export interface ContactNames {
  id: number;
  contact: string;
}

export interface Address {
  id: number;
  contact_id: number;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  postcode: string;
  occupyStart?: Date;
  occupyEnd?: Date;
}

export interface Vehicle {
  id: number;
  contact_id: number;
  make: string;
  model: string;
  registered: Date;
  purchased: Date;
}

export interface BoardingOwnerRecord {
  id: number;
  full_name: string;
  address: string;
  postcode: string;
  phone: string;
  email: string;
  preferred_contact: 'phone' | 'email' | 'text';
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  emergency_contact_preferred_contact: 'phone' | 'email' | 'text';
  pet_name: string;
  species: string;
  breed: string;
  date_of_birth: string;
  sex: 'M' | 'F';
  neutered: boolean;
  colour: string;
  distinguishing_features: string;
  microchip_number: string;
  pet_photo_name: string;
  vet_practice_name: string;
  vet_phone: string;
  emergency_vet_consent: boolean;
  treatment_cost_limit: string;
  insurance_provider_name: string;
  policy_holder_name: string;
  policy_number: string;
  emergency_claims_phone: string;
  excess_amount: string;
  exclusions: string;
  insurance_consent: boolean;
  vaccinations: string[];
  vaccination_next_due_date: string;
  vaccination_card_file_name: string;
  health_conditions: string;
  medication_required: boolean;
  medication_name: string;
  dose: string;
  administration_time: string;
  special_instructions: string;
  recent_illness: boolean;
  flea_treatment_date: string;
  worming_treatment_date: string;
  mix_with_other_dogs: 'yes' | 'no' | 'unsure';
  aggression_toward: string[];
  separation_anxiety: boolean;
  escape_risk: boolean;
  triggers: string;
  food_provided_by_owner: boolean;
  food_type: string;
  feeding_times: string;
  portion_size: string;
  treats_allowed: boolean;
  exercise_preferences: string;
  arrival_date: string;
  departure_date: string;
  dropoff_time: string;
  collection_time: string;
  grooming: boolean;
  additional_exercise: boolean;
  training_session: boolean;
  owner_instructions: string;
  vaccinated_agreement: boolean;
  free_from_illness_agreement: boolean;
  vet_treatment_authorized_agreement: boolean;
  owner_responsible_costs_agreement: boolean;
  info_accurate_agreement: boolean;
  agrees_terms: boolean;
  privacy_consent: boolean;
  signature: string;
  signed_date: string;
}
