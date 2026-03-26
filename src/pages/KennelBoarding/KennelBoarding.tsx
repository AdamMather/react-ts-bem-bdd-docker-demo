import React, { useEffect, useMemo, useState } from 'react';
import ActionBar from '../../components/ActionBar/ActionBar';
import ListView from '../../components/ListView/ListView';
import AutoCompleteTextbox from '../../components/organisms/AutoCompleteTextbox';
import apiClient from '../../services/apiClient';
import config from '../../config';
import { BoardingOwnerRecord } from '../../types';
import {
  boardingAggressionOptions,
  boardingContactPreferenceOptions,
  boardingDeclarationDisplayLabels,
  boardingDeclarationOptions,
  boardingJourneySteps,
  boardingMixOptions,
  boardingSexOptions,
  boardingSteps,
  boardingVaccinationOptions,
  createEmptyBoardingOwnerRecord,
  getBoardingDeclarationValues,
} from '../../utils/boarding';
import { toggleSelectedId, useTimedBanner } from '../../utils/ui';
import './KennelBoarding.css';

const renderReviewSections = (
  record: BoardingOwnerRecord,
  onEditSection: (stepIndex: number) => void
) => {
  const sections = [
    {
      title: 'Owner Details',
      stepIndex: 0,
      rows: [
        ['Owner:', record.full_name || '—'],
        ['Phone:', record.phone || '—'],
        ['Email:', record.email || '—'],
        ['Emergency contact:', record.emergency_contact_name || '—'],
      ],
    },
    {
      title: 'Pet Details',
      stepIndex: 1,
      rows: [
        ['Pet:', record.pet_name || '—'],
        ['Species / breed:', [record.species, record.breed].filter(Boolean).join(' / ') || '—'],
        ['Microchip:', record.microchip_number || '—'],
      ],
    },
    {
      title: 'Veterinary',
      stepIndex: 2,
      rows: [
        ['Practice:', record.vet_practice_name || '—'],
        ['Phone:', record.vet_phone || '—'],
      ],
    },
    {
      title: 'Insurance',
      stepIndex: 3,
      rows: [
        ['Provider:', record.insurance_provider_name || '—'],
        ['Policy number:', record.policy_number || '—'],
      ],
    },
    {
      title: 'Vaccinations',
      stepIndex: 4,
      rows: [
        ['Confirmed:', record.vaccinations.join(', ') || '—'],
        ['Next due:', record.vaccination_next_due_date || '—'],
      ],
    },
    {
      title: 'Health & Medication',
      stepIndex: 5,
      rows: [
        ['Conditions:', record.health_conditions || '—'],
        ['Medication:', record.medication_required ? `${record.medication_name || 'Required'}` : 'No'],
      ],
    },
    {
      title: 'Behaviour',
      stepIndex: 6,
      rows: [
        ['Mix with other dogs:', record.mix_with_other_dogs],
        ['Triggers:', record.triggers || '—'],
      ],
    },
    {
      title: 'Feeding & Routine',
      stepIndex: 7,
      rows: [
        ['Food type:', record.food_type || '—'],
        ['Feeding times:', record.feeding_times || '—'],
      ],
    },
    {
      title: 'Booking & Consent',
      stepIndex: 8,
      rows: [
        ['Stay:', `${record.arrival_date || '—'} to ${record.departure_date || '—'}`],
        ['Times:', `${record.dropoff_time || '—'} / ${record.collection_time || '—'}`],
        ['Signature:', record.signature || '—'],
      ],
    },
  ] as const;

  return sections.map((section) => (
    <ReviewSection key={section.title} title={section.title} onEdit={() => onEditSection(section.stepIndex)}>
      {section.rows.map(([label, value]) => (
        <p key={label}>
          <strong>{label}</strong> {value}
        </p>
      ))}
    </ReviewSection>
  ));
};

type ViewState = 'list' | 'detail';
type BoardingFieldName = keyof BoardingOwnerRecord;
type BoardingChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
type BoardingMultiSelectName = 'vaccinations' | 'aggression_toward';

const KennelBoarding: React.FC = () => {
  const { apiBoardingOwners } = config;
  const [view, setView] = useState<ViewState>('list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BoardingOwnerRecord | null>(null);
  const { bannerMessage, showBanner } = useTimedBanner();

  const handleAdd = () => {
    setSelectedRecord(createEmptyBoardingOwnerRecord());
    setView('detail');
  };

  const handleEdit = (record: BoardingOwnerRecord) => {
    setSelectedRecord(record);
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
        <output className="boarding-page__banner" aria-live="polite">
          {bannerMessage}
        </output>
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
        <BoardingDetailForm initialRecord={selectedRecord ?? createEmptyBoardingOwnerRecord()} onCancel={handleCancel} onSave={handleSave} />
      )}
    </div>
  );
};

type BoardingFieldConfig =
  | {
      kind: 'text';
      label: string;
      name: BoardingFieldName;
      inputType?: string;
      placeholder?: string;
      autoComplete?: string;
      required?: boolean;
      ariaInvalidKey?: string;
    }
  | {
      kind: 'textarea';
      label: string;
      name: BoardingFieldName;
      rows?: number;
    }
  | {
      kind: 'toggle';
      label: string;
      name: BoardingFieldName;
    }
  | {
      kind: 'radio';
      label: string;
      name: BoardingFieldName;
      options: Array<{ label: string; value: string }>;
    }
  | {
      kind: 'autocomplete';
      id: string;
      label: string;
      name: BoardingFieldName;
      ariaLabel: string;
      placeholder: string;
      apiUrl: string;
    }
  | {
      kind: 'multiCheckbox';
      label: string;
      name: 'vaccinations' | 'aggression_toward';
      options: string[];
      displayLabels?: Record<string, string>;
    }
  | {
      kind: 'declarationCheckboxes';
      label: string;
    };

interface BoardingStepSection {
  legend: string;
  fields: BoardingFieldConfig[];
}

const renderBoardingField = (
  field: BoardingFieldConfig,
  record: BoardingOwnerRecord,
  updateField: (e: BoardingChangeEvent) => void,
  updateMultiSelect: (name: BoardingMultiSelectName, value: string) => void,
  errorMessage: string,
  setRecord: React.Dispatch<React.SetStateAction<BoardingOwnerRecord>>
) => {
  switch (field.kind) {
    case 'text':
      return (
        <TextField
          key={field.name}
          label={field.label}
          name={field.name}
          value={record[field.name] as string}
          onChange={updateField}
          type={field.inputType}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          required={field.required}
          ariaInvalid={field.ariaInvalidKey ? errorMessage.includes(field.ariaInvalidKey) : undefined}
        />
      );

    case 'textarea':
      return (
        <TextAreaField
          key={field.name}
          label={field.label}
          name={field.name}
          value={record[field.name] as string}
          onChange={updateField}
          rows={field.rows}
        />
      );

    case 'toggle':
      return (
        <ToggleField
          key={field.name}
          label={field.label}
          name={field.name}
          checked={Boolean(record[field.name])}
          onChange={updateField}
        />
      );

    case 'radio':
      return (
        <RadioGroupField
          key={field.name}
          label={field.label}
          name={field.name}
          value={record[field.name] as string}
          onChange={updateField}
          options={field.options}
        />
      );

    case 'autocomplete':
      return (
        <AutoCompleteTextbox
          key={field.name}
          id={field.id}
          name={field.name}
          label={field.label}
          value={record[field.name] as string}
          onChange={updateField}
          ariaLabel={field.ariaLabel}
          placeholder={field.placeholder}
          apiUrl={field.apiUrl}
        />
      );

    case 'multiCheckbox':
      return (
        <CheckboxListField
          key={field.name}
          label={field.label}
          values={record[field.name]}
          options={field.options}
          displayLabels={field.displayLabels}
          onChange={(value) => updateMultiSelect(field.name, value)}
        />
      );

    case 'declarationCheckboxes':
      return (
        <CheckboxListField
          key={field.label}
          label={field.label}
          values={getBoardingDeclarationValues(record)}
          options={[...boardingDeclarationOptions]}
          displayLabels={boardingDeclarationDisplayLabels}
          onChange={(value) =>
            setRecord((current) => ({
              ...current,
              [value]: !current[value as keyof BoardingOwnerRecord],
            }))
          }
        />
      );

    default:
      return null;
  }
};

const renderBoardingStepSection = (
  section: BoardingStepSection,
  record: BoardingOwnerRecord,
  updateField: (e: BoardingChangeEvent) => void,
  updateMultiSelect: (name: BoardingMultiSelectName, value: string) => void,
  errorMessage: string,
  setRecord: React.Dispatch<React.SetStateAction<BoardingOwnerRecord>>
) => (
  <fieldset className="boarding-form__section">
    <legend>{section.legend}</legend>
    {section.fields.map((field) =>
      renderBoardingField(field, record, updateField, updateMultiSelect, errorMessage, setRecord)
    )}
  </fieldset>
);

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

  const currentJourneyIndex = isReviewing ? boardingJourneySteps.length - 1 : currentStep;
  const progressPercent = ((currentJourneyIndex + 1) / boardingJourneySteps.length) * 100;
  const progressLabel = useMemo(
    () =>
      `Step ${currentJourneyIndex + 1} of ${boardingJourneySteps.length}: ${boardingJourneySteps[currentJourneyIndex].label}`,
    [currentJourneyIndex, isReviewing]
  );

  const updateField = (e: BoardingChangeEvent) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;

    setRecord((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrorMessage('');
  };

  const updateMultiSelect = (name: BoardingMultiSelectName, value: string) => {
    setRecord((current) => {
      const currentValues = current[name];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return { ...current, [name]: nextValues };
    });
  };

  const validateStep = (stepId: string) => {
    const requireText = (value: string, message: string) => (value.trim() ? '' : message);
    const requireValue = (value: string, message: string) => (value ? '' : message);

    const validators: Partial<Record<string, () => string>> = {
      owner: () =>
        requireText(record.full_name, 'Owner Details: full name is required.')
        || requireText(record.phone, 'Owner Details: phone number is required.'),
      pet: () => requireText(record.pet_name, 'Pet Details: pet name is required.'),
      vet: () => requireText(record.vet_practice_name, 'Veterinary: vet practice name is required.'),
      routine: () => requireText(record.food_type, 'Feeding & Routine: food type is required.'),
      booking: () =>
        requireValue(record.arrival_date, 'Booking & Consent: arrival date is required.')
        || requireValue(record.departure_date, 'Booking & Consent: departure date is required.')
        || requireValue(record.dropoff_time, 'Booking & Consent: drop-off time is required.')
        || requireValue(record.collection_time, 'Booking & Consent: collection time is required.')
        || requireText(record.signature, 'Booking & Consent: signature is required.'),
    };

    return validators[stepId]?.() ?? '';
  };

  const handleNext = () => {
    const message = validateStep(boardingSteps[currentStep].id);
    if (message) {
      setErrorMessage(message);
      return;
    }

    setErrorMessage('');
    if (currentStep === boardingSteps.length - 1) {
      setIsReviewing(true);
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, boardingSteps.length - 1));
  };

  const handleConfirm = async () => {
    const message = validateStep('booking');
    if (message) {
      setIsReviewing(false);
      setCurrentStep(boardingSteps.length - 1);
      setErrorMessage(message);
      return;
    }

    if (!record.agrees_terms || !record.info_accurate_agreement || !record.privacy_consent) {
      setIsReviewing(false);
      setCurrentStep(boardingSteps.length - 1);
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

  const moveToStep = (stepIndex: number) => {
    setIsReviewing(false);
    setCurrentStep(stepIndex);
  };

  const stepSections: BoardingStepSection[] = [
    {
      legend: 'Owner and emergency contact',
      fields: [
        { kind: 'text', label: 'Full name', name: 'full_name', autoComplete: 'name', required: true, ariaInvalidKey: 'full name' },
        { kind: 'textarea', label: 'Address', name: 'address', rows: 3 },
        { kind: 'text', label: 'Postcode', name: 'postcode', autoComplete: 'postal-code' },
        { kind: 'text', label: 'Phone number', name: 'phone', inputType: 'tel', autoComplete: 'tel', required: true, ariaInvalidKey: 'phone number' },
        { kind: 'text', label: 'Email address', name: 'email', inputType: 'email', autoComplete: 'email', required: true },
        { kind: 'radio', label: 'Preferred contact method', name: 'preferred_contact', options: [...boardingContactPreferenceOptions] },
        { kind: 'text', label: 'Emergency contact name', name: 'emergency_contact_name', required: true },
        { kind: 'text', label: 'Relationship', name: 'emergency_contact_relationship' },
        { kind: 'text', label: 'Emergency contact phone', name: 'emergency_contact_phone', inputType: 'tel', required: true },
        { kind: 'radio', label: 'Emergency contact preference', name: 'emergency_contact_preferred_contact', options: [...boardingContactPreferenceOptions] },
      ],
    },
    {
      legend: 'Pet identification',
      fields: [
        { kind: 'text', label: 'Pet name', name: 'pet_name', required: true, ariaInvalidKey: 'pet name' },
        { kind: 'autocomplete', id: 'species', label: 'Species', name: 'species', ariaLabel: 'Pet species', placeholder: 'Start typing species', apiUrl: apiBoardingSpecies },
        { kind: 'autocomplete', id: 'breed', label: 'Breed', name: 'breed', ariaLabel: 'Pet breed', placeholder: 'Start typing breed', apiUrl: apiBoardingBreeds },
        { kind: 'text', label: 'Date of birth / age', name: 'date_of_birth', inputType: 'date' },
        { kind: 'radio', label: 'Sex', name: 'sex', options: [...boardingSexOptions] },
        { kind: 'toggle', label: 'Neutered / spayed', name: 'neutered' },
        { kind: 'text', label: 'Colour', name: 'colour' },
        { kind: 'textarea', label: 'Distinguishing features', name: 'distinguishing_features', rows: 3 },
        { kind: 'text', label: 'Microchip number', name: 'microchip_number' },
        { kind: 'text', label: 'Pet photo file name', name: 'pet_photo_name', placeholder: 'e.g. bella.jpg' },
      ],
    },
    {
      legend: 'Veterinary information',
      fields: [
        { kind: 'autocomplete', id: 'vet_practice_name', label: 'Vet practice name', name: 'vet_practice_name', ariaLabel: 'Vet practice name', placeholder: 'Start typing vet practice', apiUrl: apiBoardingVets },
        { kind: 'text', label: 'Vet phone number', name: 'vet_phone', inputType: 'tel' },
        { kind: 'toggle', label: 'Emergency vet consent', name: 'emergency_vet_consent' },
        { kind: 'text', label: 'Treatment cost limit (£)', name: 'treatment_cost_limit', inputType: 'number' },
      ],
    },
    {
      legend: 'Pet insurance',
      fields: [
        { kind: 'autocomplete', id: 'insurance_provider_name', label: 'Insurance provider name', name: 'insurance_provider_name', ariaLabel: 'Insurance provider name', placeholder: 'Start typing insurer', apiUrl: apiBoardingInsuranceProviders },
        { kind: 'text', label: 'Policy holder name', name: 'policy_holder_name' },
        { kind: 'text', label: 'Policy number', name: 'policy_number' },
        { kind: 'text', label: 'Emergency claims phone number', name: 'emergency_claims_phone', inputType: 'tel' },
        { kind: 'text', label: 'Excess amount (£)', name: 'excess_amount', inputType: 'number' },
        { kind: 'textarea', label: 'Known exclusions', name: 'exclusions', rows: 3 },
        { kind: 'toggle', label: 'Owner understands kennel does not process claims', name: 'insurance_consent' },
      ],
    },
    {
      legend: 'Vaccination record',
      fields: [
        { kind: 'multiCheckbox', label: 'Vaccination confirmations', name: 'vaccinations', options: [...boardingVaccinationOptions] },
        { kind: 'text', label: 'Next vaccination due date', name: 'vaccination_next_due_date', inputType: 'date' },
        { kind: 'text', label: 'Vaccination card file name', name: 'vaccination_card_file_name', placeholder: 'e.g. vaccine-card.pdf' },
      ],
    },
    {
      legend: 'Health and medication',
      fields: [
        { kind: 'textarea', label: 'Current health conditions', name: 'health_conditions', rows: 3 },
        { kind: 'toggle', label: 'Medication required', name: 'medication_required' },
        { kind: 'text', label: 'Medication name', name: 'medication_name' },
        { kind: 'text', label: 'Dose', name: 'dose' },
        { kind: 'text', label: 'Administration time', name: 'administration_time' },
        { kind: 'textarea', label: 'Special instructions', name: 'special_instructions', rows: 3 },
        { kind: 'toggle', label: 'Recent illness in last 30 days', name: 'recent_illness' },
        { kind: 'text', label: 'Last flea treatment date', name: 'flea_treatment_date', inputType: 'date' },
        { kind: 'text', label: 'Last worming treatment date', name: 'worming_treatment_date', inputType: 'date' },
      ],
    },
    {
      legend: 'Behaviour and temperament',
      fields: [
        { kind: 'radio', label: 'Can the pet mix with other dogs?', name: 'mix_with_other_dogs', options: [...boardingMixOptions] },
        { kind: 'multiCheckbox', label: 'Aggression shown toward', name: 'aggression_toward', options: [...boardingAggressionOptions] },
        { kind: 'toggle', label: 'Separation anxiety', name: 'separation_anxiety' },
        { kind: 'toggle', label: 'Escape risk', name: 'escape_risk' },
        { kind: 'textarea', label: 'Fears or triggers', name: 'triggers', rows: 3 },
      ],
    },
    {
      legend: 'Feeding and routine',
      fields: [
        { kind: 'toggle', label: 'Food provided by owner', name: 'food_provided_by_owner' },
        { kind: 'text', label: 'Food type', name: 'food_type', ariaInvalidKey: 'food type' },
        { kind: 'text', label: 'Feeding times', name: 'feeding_times', placeholder: 'e.g. 07:30, 17:30' },
        { kind: 'text', label: 'Portion size', name: 'portion_size' },
        { kind: 'toggle', label: 'Treats allowed', name: 'treats_allowed' },
        { kind: 'textarea', label: 'Exercise preferences', name: 'exercise_preferences', rows: 3 },
      ],
    },
    {
      legend: 'Booking and declaration',
      fields: [
        { kind: 'text', label: 'Arrival date', name: 'arrival_date', inputType: 'date', ariaInvalidKey: 'arrival date' },
        { kind: 'text', label: 'Departure date', name: 'departure_date', inputType: 'date', ariaInvalidKey: 'departure date' },
        { kind: 'text', label: 'Drop-off time', name: 'dropoff_time', inputType: 'time', ariaInvalidKey: 'drop-off time' },
        { kind: 'text', label: 'Collection time', name: 'collection_time', inputType: 'time', ariaInvalidKey: 'collection time' },
        { kind: 'toggle', label: 'Include grooming', name: 'grooming' },
        { kind: 'toggle', label: 'Additional exercise', name: 'additional_exercise' },
        { kind: 'toggle', label: 'Training session', name: 'training_session' },
        { kind: 'textarea', label: 'Owner instructions', name: 'owner_instructions', rows: 4 },
        { kind: 'declarationCheckboxes', label: 'Booking declaration' },
        { kind: 'text', label: 'Signature', name: 'signature', required: true, ariaInvalidKey: 'signature' },
        { kind: 'text', label: 'Signed date', name: 'signed_date', inputType: 'date' },
      ],
    },
  ];

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
          <span>{boardingJourneySteps[currentJourneyIndex].label}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
      </div>

      <form className="boarding-form" onSubmit={handleFormSubmit} noValidate>
        {isReviewing ? null : renderBoardingStepSection(stepSections[currentStep], record, updateField, updateMultiSelect, errorMessage, setRecord)}

        {isReviewing ? (
          <section className="boarding-form__review">{renderReviewSections(record, moveToStep)}</section>
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
                setCurrentStep(boardingSteps.length - 1);
                return;
              }
              setCurrentStep((step) => Math.max(step - 1, 0));
            }}
            disabled={currentStep === 0 && !isReviewing}
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
                {currentStep === boardingSteps.length - 1 ? 'Review details' : 'Next step'}
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
  onChange: (e: BoardingChangeEvent) => void;
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
  onChange: (e: BoardingChangeEvent) => void;
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
  onChange: (e: BoardingChangeEvent) => void;
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
  onChange: (e: BoardingChangeEvent) => void;
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
