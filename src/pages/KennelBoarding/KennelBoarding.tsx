import React, { useEffect, useMemo, useState } from 'react';
import ActionBar from '../../components/ActionBar/ActionBar';
import ListView from '../../components/ListView/ListView';
import AutoCompleteTextbox from '../../components/organisms/AutoCompleteTextbox';
import apiClient from '../../services/apiClient';
import config from '../../config';
import { BoardingOwnerRecord } from '../../types';
import { toggleSelectedId, useTimedBanner } from '../../utils/ui';
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
const reviewStep = { id: 'review', label: 'Confirmation' };
const journeySteps = [...steps, reviewStep];

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
  const { bannerMessage, showBanner } = useTimedBanner();

  const handleAdd = () => {
    setSelectedRecord(createEmptyRecord());
    setView('detail');
  };

  const handleEdit = (record: BoardingOwnerRecord | Record<string, unknown>) => {
    setSelectedRecord(record as BoardingOwnerRecord);
    setView('detail');
  };

  const handleSelect = (id: number) => {
    setSelectedIds((current) => toggleSelectedId(current, id));
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
  const [isReviewing, setIsReviewing] = useState(false);
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
    setIsReviewing(false);
    setErrorMessage('');
  }, [initialRecord]);

  const currentJourneyIndex = isReviewing ? journeySteps.length - 1 : currentStep;
  const progressPercent = ((currentJourneyIndex + 1) / journeySteps.length) * 100;
  const progressLabel = useMemo(
    () => `Step ${currentJourneyIndex + 1} of ${journeySteps.length}: ${journeySteps[currentJourneyIndex].label}`,
    [currentJourneyIndex]
  );

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

  const validateStep = (stepId: string) => {
    if (stepId === 'owner') {
      if (!record.full_name.trim()) return 'Owner Details: full name is required.';
      if (!record.phone.trim()) return 'Owner Details: phone number is required.';
    }

    if (stepId === 'pet' && !record.pet_name.trim()) {
      return 'Pet Details: pet name is required.';
    }

    if (stepId === 'vet' && !record.vet_practice_name.trim()) {
      return 'Veterinary: vet practice name is required.';
    }

    if (stepId === 'routine' && !record.food_type.trim()) {
      return 'Feeding & Routine: food type is required.';
    }

    if (stepId === 'booking') {
      if (!record.arrival_date) return 'Booking & Consent: arrival date is required.';
      if (!record.departure_date) return 'Booking & Consent: departure date is required.';
      if (!record.dropoff_time) return 'Booking & Consent: drop-off time is required.';
      if (!record.collection_time) return 'Booking & Consent: collection time is required.';
      if (!record.signature.trim()) return 'Booking & Consent: signature is required.';
    }

    return '';
  };

  const handleNext = () => {
    const message = validateStep(steps[currentStep].id);
    if (message) {
      setErrorMessage(message);
      return;
    }

    setErrorMessage('');
    if (currentStep === steps.length - 1) {
      setIsReviewing(true);
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const handleConfirm = async () => {
    const message = validateStep('booking');
    if (message) {
      setIsReviewing(false);
      setCurrentStep(steps.length - 1);
      setErrorMessage(message);
      return;
    }

    if (!record.agrees_terms || !record.info_accurate_agreement || !record.privacy_consent) {
      setIsReviewing(false);
      setCurrentStep(steps.length - 1);
      setErrorMessage('Booking & Consent: please confirm the declaration and privacy consent.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(record);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReviewing) {
      await handleConfirm();
      return;
    }

    handleNext();
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

      <div className="boarding-form__progressbar" aria-label="Boarding form progress">
        <div className="boarding-form__progressbar-track" aria-hidden="true">
          <div className="boarding-form__progressbar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="boarding-form__progressbar-meta">
          <span>{journeySteps[currentJourneyIndex].label}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
      </div>

      <form className="boarding-form" onSubmit={handleFormSubmit} noValidate>
        {!isReviewing && currentStep === 0 ? (
          <fieldset className="boarding-form__section">
            <legend>Owner and emergency contact</legend>
            <TextField label="Full name" name="full_name" value={record.full_name} onChange={updateField} autoComplete="name" required ariaInvalid={errorMessage.includes('full name')} />
            <TextAreaField label="Address" name="address" value={record.address} onChange={updateField} rows={3} />
            <TextField label="Postcode" name="postcode" value={record.postcode} onChange={updateField} autoComplete="postal-code" />
            <TextField label="Phone number" name="phone" value={record.phone} onChange={updateField} type="tel" autoComplete="tel" required ariaInvalid={errorMessage.includes('phone number')} />
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

        {!isReviewing && currentStep === 1 ? (
          <fieldset className="boarding-form__section">
            <legend>Pet identification</legend>
            <TextField label="Pet name" name="pet_name" value={record.pet_name} onChange={updateField} required ariaInvalid={errorMessage.includes('pet name')} />
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

        {!isReviewing && currentStep === 2 ? (
          <fieldset className="boarding-form__section">
            <legend>Veterinary information</legend>
            <AutoCompleteTextbox id="vet_practice_name" name="vet_practice_name" label="Vet practice name" value={record.vet_practice_name} onChange={updateField} ariaLabel="Vet practice name" placeholder="Start typing vet practice" apiUrl={apiBoardingVets} />
            <TextField label="Vet phone number" name="vet_phone" value={record.vet_phone} onChange={updateField} type="tel" />
            <ToggleField label="Emergency vet consent" name="emergency_vet_consent" checked={record.emergency_vet_consent} onChange={updateField} />
            <TextField label="Treatment cost limit (£)" name="treatment_cost_limit" value={record.treatment_cost_limit} onChange={updateField} type="number" />
          </fieldset>
        ) : null}

        {!isReviewing && currentStep === 3 ? (
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

        {!isReviewing && currentStep === 4 ? (
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

        {!isReviewing && currentStep === 5 ? (
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

        {!isReviewing && currentStep === 6 ? (
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

        {!isReviewing && currentStep === 7 ? (
          <fieldset className="boarding-form__section">
            <legend>Feeding and routine</legend>
            <ToggleField label="Food provided by owner" name="food_provided_by_owner" checked={record.food_provided_by_owner} onChange={updateField} />
            <TextField label="Food type" name="food_type" value={record.food_type} onChange={updateField} ariaInvalid={errorMessage.includes('food type')} />
            <TextField label="Feeding times" name="feeding_times" value={record.feeding_times} onChange={updateField} placeholder="e.g. 07:30, 17:30" />
            <TextField label="Portion size" name="portion_size" value={record.portion_size} onChange={updateField} />
            <ToggleField label="Treats allowed" name="treats_allowed" checked={record.treats_allowed} onChange={updateField} />
            <TextAreaField label="Exercise preferences" name="exercise_preferences" value={record.exercise_preferences} onChange={updateField} rows={3} />
          </fieldset>
        ) : null}

        {!isReviewing && currentStep === 8 ? (
          <fieldset className="boarding-form__section">
            <legend>Booking and declaration</legend>
            <TextField label="Arrival date" name="arrival_date" value={record.arrival_date} onChange={updateField} type="date" ariaInvalid={errorMessage.includes('arrival date')} />
            <TextField label="Departure date" name="departure_date" value={record.departure_date} onChange={updateField} type="date" ariaInvalid={errorMessage.includes('departure date')} />
            <TextField label="Drop-off time" name="dropoff_time" value={record.dropoff_time} onChange={updateField} type="time" ariaInvalid={errorMessage.includes('drop-off time')} />
            <TextField label="Collection time" name="collection_time" value={record.collection_time} onChange={updateField} type="time" ariaInvalid={errorMessage.includes('collection time')} />
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
            <TextField label="Signature" name="signature" value={record.signature} onChange={updateField} required ariaInvalid={errorMessage.includes('signature')} />
            <TextField label="Signed date" name="signed_date" value={record.signed_date} onChange={updateField} type="date" />
          </fieldset>
        ) : null}

        {isReviewing ? (
          <section className="boarding-form__review">
            <ReviewSection title="Owner Details" onEdit={() => { setIsReviewing(false); setCurrentStep(0); }}>
              <p><strong>Owner:</strong> {record.full_name || '—'}</p>
              <p><strong>Phone:</strong> {record.phone || '—'}</p>
              <p><strong>Email:</strong> {record.email || '—'}</p>
              <p><strong>Emergency contact:</strong> {record.emergency_contact_name || '—'}</p>
            </ReviewSection>
            <ReviewSection title="Pet Details" onEdit={() => { setIsReviewing(false); setCurrentStep(1); }}>
              <p><strong>Pet:</strong> {record.pet_name || '—'}</p>
              <p><strong>Species / breed:</strong> {[record.species, record.breed].filter(Boolean).join(' / ') || '—'}</p>
              <p><strong>Microchip:</strong> {record.microchip_number || '—'}</p>
            </ReviewSection>
            <ReviewSection title="Veterinary" onEdit={() => { setIsReviewing(false); setCurrentStep(2); }}>
              <p><strong>Practice:</strong> {record.vet_practice_name || '—'}</p>
              <p><strong>Phone:</strong> {record.vet_phone || '—'}</p>
            </ReviewSection>
            <ReviewSection title="Insurance" onEdit={() => { setIsReviewing(false); setCurrentStep(3); }}>
              <p><strong>Provider:</strong> {record.insurance_provider_name || '—'}</p>
              <p><strong>Policy number:</strong> {record.policy_number || '—'}</p>
            </ReviewSection>
            <ReviewSection title="Vaccinations" onEdit={() => { setIsReviewing(false); setCurrentStep(4); }}>
              <p><strong>Confirmed:</strong> {record.vaccinations.join(', ') || '—'}</p>
              <p><strong>Next due:</strong> {record.vaccination_next_due_date || '—'}</p>
            </ReviewSection>
            <ReviewSection title="Health & Medication" onEdit={() => { setIsReviewing(false); setCurrentStep(5); }}>
              <p><strong>Conditions:</strong> {record.health_conditions || '—'}</p>
              <p><strong>Medication:</strong> {record.medication_required ? `${record.medication_name || 'Required'}` : 'No'}</p>
            </ReviewSection>
            <ReviewSection title="Behaviour" onEdit={() => { setIsReviewing(false); setCurrentStep(6); }}>
              <p><strong>Mix with other dogs:</strong> {record.mix_with_other_dogs}</p>
              <p><strong>Triggers:</strong> {record.triggers || '—'}</p>
            </ReviewSection>
            <ReviewSection title="Feeding & Routine" onEdit={() => { setIsReviewing(false); setCurrentStep(7); }}>
              <p><strong>Food type:</strong> {record.food_type || '—'}</p>
              <p><strong>Feeding times:</strong> {record.feeding_times || '—'}</p>
            </ReviewSection>
            <ReviewSection title="Booking & Consent" onEdit={() => { setIsReviewing(false); setCurrentStep(8); }}>
              <p><strong>Stay:</strong> {record.arrival_date || '—'} to {record.departure_date || '—'}</p>
              <p><strong>Times:</strong> {record.dropoff_time || '—'} / {record.collection_time || '—'}</p>
              <p><strong>Signature:</strong> {record.signature || '—'}</p>
            </ReviewSection>
          </section>
        ) : null}

        {errorMessage ? (
          <div className="boarding-form__error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <div className="boarding-form__footer">
          <button
            type="button"
            className="boarding-form__secondary-button"
            onClick={() => {
              setErrorMessage('');
              if (isReviewing) {
                setIsReviewing(false);
                setCurrentStep(steps.length - 1);
                return;
              }
              setCurrentStep((step) => Math.max(step - 1, 0));
            }}
            disabled={!currentStep && !isReviewing}
          >
            Previous
          </button>
          <div className="boarding-form__footer-actions">
            {isReviewing ? (
              <button type="submit" className="boarding-form__primary-button" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Confirm and finish'}
              </button>
            ) : (
              <button type="submit" className="boarding-form__primary-button">
                {currentStep === steps.length - 1 ? 'Review details' : 'Next step'}
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
  ariaInvalid?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({ label, name, value, onChange, type = 'text', placeholder, autoComplete, required, ariaInvalid }) => (
  <label className="boarding-form__field">
    <span>{label}</span>
    <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} required={required} aria-invalid={ariaInvalid} />
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

interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ title, onEdit, children }) => (
  <section className="boarding-form__review-card">
    <div className="boarding-form__review-header">
      <h3>{title}</h3>
      <button type="button" className="boarding-form__link-button" onClick={onEdit}>
        Edit
      </button>
    </div>
    <div className="boarding-form__review-body">{children}</div>
  </section>
);

export default KennelBoarding;
