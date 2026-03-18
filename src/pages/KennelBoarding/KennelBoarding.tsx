import React, { useEffect, useMemo, useRef, useState } from 'react';
import ActionBar from '../../components/ActionBar/ActionBar';
import ListView from '../../components/ListView/ListView';
import AutoCompleteTextbox from '../../components/organisms/AutoCompleteTextbox';
import apiClient from '../../services/apiClient';
import config from '../../config';
import { BoardingOwnerRecord } from '../../types';
import './KennelBoarding.css';

const vaccinationOptions = ['Distemper', 'Parvovirus', 'Hepatitis', 'Leptospirosis', 'Kennel Cough'];
const aggressionOptions = ['dogs', 'people'];

const steps = [
  { id: 'owner', label: 'Owner Details' },
  { id: 'pet', label: 'Pet Details' },
  { id: 'vet', label: 'Veterinary' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'vaccination', label: 'Vaccinations' },
  { id: 'health', label: 'Health & Medication' },
  { id: 'behaviour', label: 'Behaviour' },
  { id: 'routine', label: 'Feeding & Routine' },
  { id: 'booking', label: 'Booking & Consent' },
];

const createEmptyRecord = (): BoardingOwnerRecord => ({
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
});

type ViewState = 'list' | 'detail';

const KennelBoarding: React.FC = () => {
  const { apiBoardingOwners } = config;
  const [view, setView] = useState<ViewState>('list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BoardingOwnerRecord | null>(null);
  const [bannerMessage, setBannerMessage] = useState('');
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
  }, []);

  const showBanner = (message: string) => {
    setBannerMessage(message);
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    bannerTimeoutRef.current = setTimeout(() => setBannerMessage(''), 2500);
  };

  const handleAdd = () => {
    setSelectedRecord(createEmptyRecord());
    setView('detail');
  };

  const handleEdit = (record: BoardingOwnerRecord | Record<string, unknown>) => {
    setSelectedRecord(record as BoardingOwnerRecord);
    setView('detail');
  };

  const handleSelect = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleDelete = async (apiUrl: string, ids: number[]) => {
    if (!ids.length) {
      return;
    }

    await apiClient.delete(apiUrl, { data: { ids } });
    setSelectedIds([]);
    showBanner(ids.length === 1 ? 'Boarding enrolment deleted.' : 'Boarding enrolments deleted.');
  };

  const handleSave = async (record: BoardingOwnerRecord) => {
    if (record.id) {
      await apiClient.put(`${apiBoardingOwners}/${record.id}`, record);
      showBanner('Boarding enrolment updated.');
    } else {
      await apiClient.post(apiBoardingOwners, record);
      showBanner('Boarding enrolment created.');
    }

    setSelectedRecord(null);
    setView('list');
  };

  const handleCancel = () => {
    setSelectedRecord(null);
    setView('list');
  };

  return (
    <div className="boarding-page" role="application" aria-label="Kennel boarding administration">
      <header className="boarding-page__header">
        <div>
          <p className="boarding-page__eyebrow">Kennel Boarding</p>
          <h1 className="boarding-page__title">Pet enrolment administration</h1>
          <p className="boarding-page__intro">
            Capture owner, pet, medical, behaviour and booking consent details in a single mobile-first workflow.
          </p>
        </div>
      </header>

      {bannerMessage ? (
        <div className="boarding-page__banner" role="status" aria-live="polite">
          {bannerMessage}
        </div>
      ) : null}

      {view === 'list' ? (
        <section className="boarding-page__panel">
          <ActionBar
            onAdd={handleAdd}
            onDelete={handleDelete}
            apiUrl={apiBoardingOwners}
            selectedIds={selectedIds}
            domain="Owner"
            isDeleteDisabled={!selectedIds.length}
          />
          <ListView
            onSelected={handleSelect}
            onEdit={handleEdit}
            fields={['full_name', 'pet_name', 'email']}
            selectedIds={selectedIds}
            apiUrl={apiBoardingOwners}
          />
        </section>
      ) : (
        <BoardingDetailForm initialRecord={selectedRecord ?? createEmptyRecord()} onCancel={handleCancel} onSave={handleSave} />
      )}
    </div>
  );
};

interface BoardingDetailFormProps {
  initialRecord: BoardingOwnerRecord;
  onSave: (record: BoardingOwnerRecord) => Promise<void>;
  onCancel: () => void;
}

const BoardingDetailForm: React.FC<BoardingDetailFormProps> = ({ initialRecord, onSave, onCancel }) => {
  const [record, setRecord] = useState<BoardingOwnerRecord>(initialRecord);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const {
    apiBoardingSpecies,
    apiBoardingBreeds,
    apiBoardingVets,
    apiBoardingInsuranceProviders,
  } = config;

  useEffect(() => {
    setRecord(initialRecord);
    setCurrentStep(0);
    setErrorMessage('');
  }, [initialRecord]);

  const progressLabel = useMemo(() => `Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].label}`, [currentStep]);

  const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;

    setRecord((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrorMessage('');
  };

  const updateMultiSelect = (name: 'vaccinations' | 'aggression_toward', value: string) => {
    setRecord((current) => {
      const currentValues = current[name];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return { ...current, [name]: nextValues };
    });
  };

  const validate = () => {
    if (!record.full_name.trim()) return 'Owner full name is required.';
    if (!record.phone.trim()) return 'Owner phone number is required.';
    if (!record.email.trim()) return 'Owner email address is required.';
    if (!record.emergency_contact_name.trim()) return 'Emergency contact name is required.';
    if (!record.emergency_contact_phone.trim()) return 'Emergency contact phone is required.';
    if (!record.pet_name.trim()) return 'Pet name is required.';
    if (!record.species.trim()) return 'Species is required.';
    if (!record.breed.trim()) return 'Breed is required.';
    if (!record.vet_practice_name.trim()) return 'Vet practice name is required.';
    if (!record.vet_phone.trim()) return 'Vet phone number is required.';
    if (!record.arrival_date || !record.departure_date) return 'Arrival and departure dates are required.';
    if (!record.signature.trim()) return 'Signature is required before saving.';
    if (!record.agrees_terms || !record.info_accurate_agreement || !record.privacy_consent) {
      return 'Please confirm the declaration and privacy consent.';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setErrorMessage(message);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(record);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="boarding-page__panel">
      <div className="boarding-form__header">
        <div>
          <h2 className="boarding-form__title">{record.id ? 'Update pet owner enrolment' : 'Create pet owner enrolment'}</h2>
          <p className="boarding-form__progress" aria-live="polite">
            {progressLabel}
          </p>
        </div>
        <div className="boarding-form__header-actions">
          <button type="button" className="boarding-form__secondary-button" onClick={onCancel}>
            Back to list
          </button>
        </div>
      </div>

      <div className="boarding-form__steps" role="tablist" aria-label="Boarding form steps">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            role="tab"
            aria-selected={index === currentStep}
            className={`boarding-form__step ${index === currentStep ? 'boarding-form__step--active' : ''}`}
            onClick={() => setCurrentStep(index)}
          >
            <span>{index + 1}</span>
            {step.label}
          </button>
        ))}
      </div>

      <form className="boarding-form" onSubmit={handleSubmit} noValidate>
        {currentStep === 0 ? (
          <fieldset className="boarding-form__section">
            <legend>Owner and emergency contact</legend>
            <TextField label="Full name" name="full_name" value={record.full_name} onChange={updateField} autoComplete="name" required />
            <TextAreaField label="Address" name="address" value={record.address} onChange={updateField} rows={3} />
            <TextField label="Postcode" name="postcode" value={record.postcode} onChange={updateField} autoComplete="postal-code" />
            <TextField label="Phone number" name="phone" value={record.phone} onChange={updateField} type="tel" autoComplete="tel" required />
            <TextField label="Email address" name="email" value={record.email} onChange={updateField} type="email" autoComplete="email" required />
            <RadioGroupField
              label="Preferred contact method"
              name="preferred_contact"
              value={record.preferred_contact}
              onChange={updateField}
              options={[
                { label: 'Phone', value: 'phone' },
                { label: 'Email', value: 'email' },
                { label: 'Text', value: 'text' },
              ]}
            />
            <TextField label="Emergency contact name" name="emergency_contact_name" value={record.emergency_contact_name} onChange={updateField} required />
            <TextField label="Relationship" name="emergency_contact_relationship" value={record.emergency_contact_relationship} onChange={updateField} />
            <TextField label="Emergency contact phone" name="emergency_contact_phone" value={record.emergency_contact_phone} onChange={updateField} type="tel" required />
            <RadioGroupField
              label="Emergency contact preference"
              name="emergency_contact_preferred_contact"
              value={record.emergency_contact_preferred_contact}
              onChange={updateField}
              options={[
                { label: 'Phone', value: 'phone' },
                { label: 'Email', value: 'email' },
                { label: 'Text', value: 'text' },
              ]}
            />
          </fieldset>
        ) : null}

        {currentStep === 1 ? (
          <fieldset className="boarding-form__section">
            <legend>Pet identification</legend>
            <TextField label="Pet name" name="pet_name" value={record.pet_name} onChange={updateField} required />
            <AutoCompleteTextbox id="species" name="species" label="Species" value={record.species} onChange={updateField} ariaLabel="Pet species" placeholder="Start typing species" apiUrl={apiBoardingSpecies} />
            <AutoCompleteTextbox id="breed" name="breed" label="Breed" value={record.breed} onChange={updateField} ariaLabel="Pet breed" placeholder="Start typing breed" apiUrl={apiBoardingBreeds} />
            <TextField label="Date of birth / age" name="date_of_birth" value={record.date_of_birth} onChange={updateField} type="date" />
            <RadioGroupField
              label="Sex"
              name="sex"
              value={record.sex}
              onChange={updateField}
              options={[
                { label: 'Male', value: 'M' },
                { label: 'Female', value: 'F' },
              ]}
            />
            <ToggleField label="Neutered / spayed" name="neutered" checked={record.neutered} onChange={updateField} />
            <TextField label="Colour" name="colour" value={record.colour} onChange={updateField} />
            <TextAreaField label="Distinguishing features" name="distinguishing_features" value={record.distinguishing_features} onChange={updateField} rows={3} />
            <TextField label="Microchip number" name="microchip_number" value={record.microchip_number} onChange={updateField} />
            <TextField label="Pet photo file name" name="pet_photo_name" value={record.pet_photo_name} onChange={updateField} placeholder="e.g. bella.jpg" />
          </fieldset>
        ) : null}

        {currentStep === 2 ? (
          <fieldset className="boarding-form__section">
            <legend>Veterinary information</legend>
            <AutoCompleteTextbox id="vet_practice_name" name="vet_practice_name" label="Vet practice name" value={record.vet_practice_name} onChange={updateField} ariaLabel="Vet practice name" placeholder="Start typing vet practice" apiUrl={apiBoardingVets} />
            <TextField label="Vet phone number" name="vet_phone" value={record.vet_phone} onChange={updateField} type="tel" />
            <ToggleField label="Emergency vet consent" name="emergency_vet_consent" checked={record.emergency_vet_consent} onChange={updateField} />
            <TextField label="Treatment cost limit (£)" name="treatment_cost_limit" value={record.treatment_cost_limit} onChange={updateField} type="number" />
          </fieldset>
        ) : null}

        {currentStep === 3 ? (
          <fieldset className="boarding-form__section">
            <legend>Pet insurance</legend>
            <AutoCompleteTextbox id="insurance_provider_name" name="insurance_provider_name" label="Insurance provider name" value={record.insurance_provider_name} onChange={updateField} ariaLabel="Insurance provider name" placeholder="Start typing insurer" apiUrl={apiBoardingInsuranceProviders} />
            <TextField label="Policy holder name" name="policy_holder_name" value={record.policy_holder_name} onChange={updateField} />
            <TextField label="Policy number" name="policy_number" value={record.policy_number} onChange={updateField} />
            <TextField label="Emergency claims phone number" name="emergency_claims_phone" value={record.emergency_claims_phone} onChange={updateField} type="tel" />
            <TextField label="Excess amount (£)" name="excess_amount" value={record.excess_amount} onChange={updateField} type="number" />
            <TextAreaField label="Known exclusions" name="exclusions" value={record.exclusions} onChange={updateField} rows={3} />
            <ToggleField label="Owner understands kennel does not process claims" name="insurance_consent" checked={record.insurance_consent} onChange={updateField} />
          </fieldset>
        ) : null}

        {currentStep === 4 ? (
          <fieldset className="boarding-form__section">
            <legend>Vaccination record</legend>
            <CheckboxListField
              label="Vaccination confirmations"
              values={record.vaccinations}
              options={vaccinationOptions}
              onChange={(value) => updateMultiSelect('vaccinations', value)}
            />
            <TextField label="Next vaccination due date" name="vaccination_next_due_date" value={record.vaccination_next_due_date} onChange={updateField} type="date" />
            <TextField label="Vaccination card file name" name="vaccination_card_file_name" value={record.vaccination_card_file_name} onChange={updateField} placeholder="e.g. vaccine-card.pdf" />
          </fieldset>
        ) : null}

        {currentStep === 5 ? (
          <fieldset className="boarding-form__section">
            <legend>Health and medication</legend>
            <TextAreaField label="Current health conditions" name="health_conditions" value={record.health_conditions} onChange={updateField} rows={3} />
            <ToggleField label="Medication required" name="medication_required" checked={record.medication_required} onChange={updateField} />
            <TextField label="Medication name" name="medication_name" value={record.medication_name} onChange={updateField} />
            <TextField label="Dose" name="dose" value={record.dose} onChange={updateField} />
            <TextField label="Administration time" name="administration_time" value={record.administration_time} onChange={updateField} />
            <TextAreaField label="Special instructions" name="special_instructions" value={record.special_instructions} onChange={updateField} rows={3} />
            <ToggleField label="Recent illness in last 30 days" name="recent_illness" checked={record.recent_illness} onChange={updateField} />
            <TextField label="Last flea treatment date" name="flea_treatment_date" value={record.flea_treatment_date} onChange={updateField} type="date" />
            <TextField label="Last worming treatment date" name="worming_treatment_date" value={record.worming_treatment_date} onChange={updateField} type="date" />
          </fieldset>
        ) : null}

        {currentStep === 6 ? (
          <fieldset className="boarding-form__section">
            <legend>Behaviour and temperament</legend>
            <RadioGroupField
              label="Can the pet mix with other dogs?"
              name="mix_with_other_dogs"
              value={record.mix_with_other_dogs}
              onChange={updateField}
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
                { label: 'Unsure', value: 'unsure' },
              ]}
            />
            <CheckboxListField
              label="Aggression shown toward"
              values={record.aggression_toward}
              options={aggressionOptions}
              onChange={(value) => updateMultiSelect('aggression_toward', value)}
            />
            <ToggleField label="Separation anxiety" name="separation_anxiety" checked={record.separation_anxiety} onChange={updateField} />
            <ToggleField label="Escape risk" name="escape_risk" checked={record.escape_risk} onChange={updateField} />
            <TextAreaField label="Fears or triggers" name="triggers" value={record.triggers} onChange={updateField} rows={3} />
          </fieldset>
        ) : null}

        {currentStep === 7 ? (
          <fieldset className="boarding-form__section">
            <legend>Feeding and routine</legend>
            <ToggleField label="Food provided by owner" name="food_provided_by_owner" checked={record.food_provided_by_owner} onChange={updateField} />
            <TextField label="Food type" name="food_type" value={record.food_type} onChange={updateField} />
            <TextField label="Feeding times" name="feeding_times" value={record.feeding_times} onChange={updateField} placeholder="e.g. 07:30, 17:30" />
            <TextField label="Portion size" name="portion_size" value={record.portion_size} onChange={updateField} />
            <ToggleField label="Treats allowed" name="treats_allowed" checked={record.treats_allowed} onChange={updateField} />
            <TextAreaField label="Exercise preferences" name="exercise_preferences" value={record.exercise_preferences} onChange={updateField} rows={3} />
          </fieldset>
        ) : null}

        {currentStep === 8 ? (
          <fieldset className="boarding-form__section">
            <legend>Booking and declaration</legend>
            <TextField label="Arrival date" name="arrival_date" value={record.arrival_date} onChange={updateField} type="date" />
            <TextField label="Departure date" name="departure_date" value={record.departure_date} onChange={updateField} type="date" />
            <TextField label="Drop-off time" name="dropoff_time" value={record.dropoff_time} onChange={updateField} type="time" />
            <TextField label="Collection time" name="collection_time" value={record.collection_time} onChange={updateField} type="time" />
            <ToggleField label="Include grooming" name="grooming" checked={record.grooming} onChange={updateField} />
            <ToggleField label="Additional exercise" name="additional_exercise" checked={record.additional_exercise} onChange={updateField} />
            <ToggleField label="Training session" name="training_session" checked={record.training_session} onChange={updateField} />
            <TextAreaField label="Owner instructions" name="owner_instructions" value={record.owner_instructions} onChange={updateField} rows={4} />
            <CheckboxListField
              label="Booking declaration"
              values={[
                ...(record.vaccinated_agreement ? ['vaccinated_agreement'] : []),
                ...(record.free_from_illness_agreement ? ['free_from_illness_agreement'] : []),
                ...(record.vet_treatment_authorized_agreement ? ['vet_treatment_authorized_agreement'] : []),
                ...(record.owner_responsible_costs_agreement ? ['owner_responsible_costs_agreement'] : []),
                ...(record.info_accurate_agreement ? ['info_accurate_agreement'] : []),
                ...(record.agrees_terms ? ['agrees_terms'] : []),
                ...(record.privacy_consent ? ['privacy_consent'] : []),
              ]}
              options={[
                'vaccinated_agreement',
                'free_from_illness_agreement',
                'vet_treatment_authorized_agreement',
                'owner_responsible_costs_agreement',
                'info_accurate_agreement',
                'agrees_terms',
                'privacy_consent',
              ]}
              displayLabels={{
                vaccinated_agreement: 'Vaccinations are up to date',
                free_from_illness_agreement: 'Pet is free from contagious illness',
                vet_treatment_authorized_agreement: 'Vet treatment is authorized if needed',
                owner_responsible_costs_agreement: 'Owner accepts treatment costs',
                info_accurate_agreement: 'Information supplied is accurate',
                agrees_terms: 'Owner agrees to boarding terms',
                privacy_consent: 'Owner gives privacy consent',
              }}
              onChange={(value) =>
                setRecord((current) => ({
                  ...current,
                  [value]: !current[value as keyof BoardingOwnerRecord],
                }))
              }
            />
            <TextField label="Signature" name="signature" value={record.signature} onChange={updateField} required />
            <TextField label="Signed date" name="signed_date" value={record.signed_date} onChange={updateField} type="date" />
          </fieldset>
        ) : null}

        {errorMessage ? (
          <div className="boarding-form__error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <div className="boarding-form__footer">
          <button type="button" className="boarding-form__secondary-button" onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))} disabled={!currentStep}>
            Previous
          </button>
          <div className="boarding-form__footer-actions">
            {currentStep < steps.length - 1 ? (
              <button type="button" className="boarding-form__primary-button" onClick={() => setCurrentStep((step) => Math.min(step + 1, steps.length - 1))}>
                Next step
              </button>
            ) : (
              <button type="submit" className="boarding-form__primary-button" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save enrolment'}
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
};

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({ label, name, value, onChange, type = 'text', placeholder, autoComplete, required }) => (
  <label className="boarding-form__field">
    <span>{label}</span>
    <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} required={required} />
  </label>
);

interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  rows?: number;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, name, value, onChange, rows = 4 }) => (
  <label className="boarding-form__field boarding-form__field--full">
    <span>{label}</span>
    <textarea name={name} value={value} onChange={onChange} rows={rows} />
  </label>
);

interface ToggleFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ label, name, checked, onChange }) => (
  <label className="boarding-form__toggle">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} />
    <span>{label}</span>
  </label>
);

interface RadioGroupFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  options: Array<{ label: string; value: string }>;
}

const RadioGroupField: React.FC<RadioGroupFieldProps> = ({ label, name, value, onChange, options }) => (
  <fieldset className="boarding-form__choice-group">
    <legend>{label}</legend>
    <div className="boarding-form__choice-list">
      {options.map((option) => (
        <label key={option.value} className="boarding-form__choice">
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={onChange} />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  </fieldset>
);

interface CheckboxListFieldProps {
  label: string;
  values: string[];
  options: string[];
  onChange: (value: string) => void;
  displayLabels?: Record<string, string>;
}

const CheckboxListField: React.FC<CheckboxListFieldProps> = ({ label, values, options, onChange, displayLabels }) => (
  <fieldset className="boarding-form__choice-group boarding-form__field--full">
    <legend>{label}</legend>
    <div className="boarding-form__checkbox-list">
      {options.map((option) => (
        <label key={option} className="boarding-form__choice">
          <input type="checkbox" checked={values.includes(option)} onChange={() => onChange(option)} />
          <span>{displayLabels?.[option] ?? option}</span>
        </label>
      ))}
    </div>
  </fieldset>
);

export default KennelBoarding;
