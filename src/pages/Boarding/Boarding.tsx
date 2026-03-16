import React, { useState } from 'react';
import SearchInput from '../../components/molecules/SearchInput';
import FilterTextbox from '../../components/organisms/FilterTextbox';
import LabelledInput from '../../components/molecules/LabelledInput';
import './Boarding.css';

const Boarding: React.FC = () => {
  const [ownerSearch, setOwnerSearch] = useState('');
  const [formState, setFormState] = useState<Record<string, string>>({});

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="boarding" role="application" aria-label="Boarding kennel booking">
      <header className="boarding__header">
        <div>
          <h1 className="boarding__title">Boarding Kennel Booking</h1>
          <p className="boarding__subtitle">Capture owner, pet, and booking details in one flow.</p>
        </div>
        <SearchInput
          id="owner-filter"
          name="owner-filter"
          value={ownerSearch}
          onChange={(event) => setOwnerSearch(event.target.value)}
          placeholder="Filter owners..."
          ariaLabel="Filter owners"
          className="boarding__search"
          testId="boarding-owner-search"
        />
      </header>

      <section className="boarding__section" aria-labelledby="owner-details">
        <h2 id="owner-details" className="boarding__section-title">Step 1 — Owner Details</h2>
        <div className="boarding__grid">
          <LabelledInput id="owner-name" name="ownerName" label="Full name" type="text" value={formState.ownerName ?? ''} onChange={handleTextChange} />
          <LabelledInput id="owner-address" name="ownerAddress" label="Address" type="text" value={formState.ownerAddress ?? ''} onChange={handleTextChange} />
          <LabelledInput id="owner-postcode" name="ownerPostcode" label="Postcode" type="text" value={formState.ownerPostcode ?? ''} onChange={handleTextChange} />
          <LabelledInput id="owner-phone" name="ownerPhone" label="Phone number" type="text" value={formState.ownerPhone ?? ''} onChange={handleTextChange} />
          <LabelledInput id="owner-email" name="ownerEmail" label="Email address" type="email" value={formState.ownerEmail ?? ''} onChange={handleTextChange} />
        </div>
      </section>

      <section className="boarding__section" aria-labelledby="pet-details">
        <h2 id="pet-details" className="boarding__section-title">Step 2 — Pet Details</h2>
        <div className="boarding__grid">
          <LabelledInput id="pet-name" name="petName" label="Pet name" type="text" value={formState.petName ?? ''} onChange={handleTextChange} />
          <LabelledInput id="pet-species" name="petSpecies" label="Species" type="text" value={formState.petSpecies ?? ''} onChange={handleTextChange} />
          <FilterTextbox
            id="pet-breed"
            name="petBreed"
            label="Breed (filter)"
            value={formState.petBreed ?? ''}
            onChange={handleTextChange}
            placeholder="Start typing a breed..."
            ariaLabel="Pet breed filter"
            apiUrl=""
          />
          <LabelledInput id="pet-colour" name="petColour" label="Colour" type="text" value={formState.petColour ?? ''} onChange={handleTextChange} />
          <LabelledInput id="pet-microchip" name="petMicrochip" label="Microchip number" type="text" value={formState.petMicrochip ?? ''} onChange={handleTextChange} />
          <LabelledInput id="pet-features" name="petFeatures" label="Distinguishing features" type="text" value={formState.petFeatures ?? ''} onChange={handleTextChange} />
        </div>
      </section>

      <section className="boarding__section" aria-labelledby="vet-details">
        <h2 id="vet-details" className="boarding__section-title">Step 3 — Veterinary Information</h2>
        <div className="boarding__grid">
          <LabelledInput id="vet-practice" name="vetPractice" label="Vet practice name" type="text" value={formState.vetPractice ?? ''} onChange={handleTextChange} />
          <LabelledInput id="vet-phone" name="vetPhone" label="Vet phone number" type="text" value={formState.vetPhone ?? ''} onChange={handleTextChange} />
          <LabelledInput id="vet-limit" name="vetLimit" label="Treatment limit (£)" type="text" value={formState.vetLimit ?? ''} onChange={handleTextChange} />
        </div>
      </section>

      <section className="boarding__section" aria-labelledby="insurance-details">
        <h2 id="insurance-details" className="boarding__section-title">Step 4 — Pet Insurance</h2>
        <div className="boarding__grid">
          <LabelledInput id="insurance-provider" name="insuranceProvider" label="Provider name" type="text" value={formState.insuranceProvider ?? ''} onChange={handleTextChange} />
          <LabelledInput id="policy-holder" name="policyHolder" label="Policy holder name" type="text" value={formState.policyHolder ?? ''} onChange={handleTextChange} />
          <LabelledInput id="policy-number" name="policyNumber" label="Policy number" type="text" value={formState.policyNumber ?? ''} onChange={handleTextChange} />
          <LabelledInput id="claims-phone" name="claimsPhone" label="Emergency claims phone" type="text" value={formState.claimsPhone ?? ''} onChange={handleTextChange} />
        </div>
      </section>

      <section className="boarding__section" aria-labelledby="vaccination-details">
        <h2 id="vaccination-details" className="boarding__section-title">Step 5 — Vaccination Record</h2>
        <div className="boarding__grid">
          <LabelledInput id="vaccination-due" name="vaccinationDue" label="Next vaccination due date" type="date" value={formState.vaccinationDue ?? ''} onChange={handleTextChange} />
          <LabelledInput id="vaccination-upload" name="vaccinationUpload" label="Upload vaccination card" type="text" value={formState.vaccinationUpload ?? ''} onChange={handleTextChange} />
        </div>
      </section>

      <section className="boarding__section" aria-labelledby="health-details">
        <h2 id="health-details" className="boarding__section-title">Step 6 — Health & Medication</h2>
        <div className="boarding__grid">
          <LabelledInput id="health-conditions" name="healthConditions" label="Current health conditions" type="text" value={formState.healthConditions ?? ''} onChange={handleTextChange} />
          <LabelledInput id="medication-name" name="medicationName" label="Medication name" type="text" value={formState.medicationName ?? ''} onChange={handleTextChange} />
          <LabelledInput id="medication-dose" name="medicationDose" label="Dose" type="text" value={formState.medicationDose ?? ''} onChange={handleTextChange} />
          <LabelledInput id="medication-time" name="medicationTime" label="Administration time" type="text" value={formState.medicationTime ?? ''} onChange={handleTextChange} />
        </div>
      </section>

      <section className="boarding__section" aria-labelledby="behavior-details">
        <h2 id="behavior-details" className="boarding__section-title">Step 7 — Behaviour & Temperament</h2>
        <div className="boarding__grid">
          <LabelledInput id="behavior-mix" name="behaviorMix" label="Mix with other dogs?" type="text" value={formState.behaviorMix ?? ''} onChange={handleTextChange} />
          <LabelledInput id="behavior-fears" name="behaviorFears" label="Triggers / fears" type="text" value={formState.behaviorFears ?? ''} onChange={handleTextChange} />
          <LabelledInput id="behavior-anxiety" name="behaviorAnxiety" label="Separation anxiety?" type="text" value={formState.behaviorAnxiety ?? ''} onChange={handleTextChange} />
        </div>
      </section>

      <section className="boarding__section" aria-labelledby="routine-details">
        <h2 id="routine-details" className="boarding__section-title">Step 8 — Feeding & Routine</h2>
        <div className="boarding__grid">
          <LabelledInput id="food-type" name="foodType" label="Food type" type="text" value={formState.foodType ?? ''} onChange={handleTextChange} />
          <LabelledInput id="feeding-times" name="feedingTimes" label="Feeding times" type="text" value={formState.feedingTimes ?? ''} onChange={handleTextChange} />
          <LabelledInput id="exercise-level" name="exerciseLevel" label="Exercise level" type="text" value={formState.exerciseLevel ?? ''} onChange={handleTextChange} />
        </div>
      </section>

      <section className="boarding__section" aria-labelledby="booking-details">
        <h2 id="booking-details" className="boarding__section-title">Step 9 — Boarding Dates</h2>
        <div className="boarding__grid">
          <LabelledInput id="arrival-date" name="arrivalDate" label="Arrival date" type="date" value={formState.arrivalDate ?? ''} onChange={handleTextChange} />
          <LabelledInput id="departure-date" name="departureDate" label="Departure date" type="date" value={formState.departureDate ?? ''} onChange={handleTextChange} />
          <LabelledInput id="dropoff-time" name="dropoffTime" label="Estimated drop-off time" type="time" value={formState.dropoffTime ?? ''} onChange={handleTextChange} />
          <LabelledInput id="collection-time" name="collectionTime" label="Estimated collection time" type="time" value={formState.collectionTime ?? ''} onChange={handleTextChange} />
        </div>
      </section>

      <section className="boarding__section" aria-labelledby="agreement-details">
        <h2 id="agreement-details" className="boarding__section-title">Step 10 — Terms & Agreement</h2>
        <div className="boarding__grid">
          <LabelledInput id="signature" name="signature" label="Digital signature" type="text" value={formState.signature ?? ''} onChange={handleTextChange} />
          <LabelledInput id="signature-date" name="signatureDate" label="Date" type="date" value={formState.signatureDate ?? ''} onChange={handleTextChange} />
        </div>
      </section>
    </div>
  );
};

export default Boarding;
