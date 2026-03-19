# Kennel Boarding App Developer Reference

## Purpose

This document is the end-to-end developer reference for the kennel boarding single-page application (SPA). It explains the feature from initial route entry through form completion, persistence, testing, and extension points.

The kennel boarding app exists to let an administrator:

- search existing pet owner boarding enrolments
- create a new enrolment
- edit an existing enrolment
- delete enrolments from the list view
- work through a guided multi-step intake form
- review captured details on a final confirmation screen
- confirm and return to the list view

The implementation is intentionally aligned to the business and UI source documents in:

- `docs/boarding/specification.txt`
- `docs/boarding/ui-guidelines.txt`
- `docs/boarding/schema.sql`

---

## Feature Entry Point

### Route

The kennel boarding SPA is mounted at:

- `/kennel-boarding`

Routing is registered in:

- `src/App.jsx`

This route is independent from the existing contact-management route at `/`.

---

## High-Level Architecture

The kennel boarding feature spans five layers:

1. **Route and page shell**
   - `src/pages/KennelBoarding/KennelBoarding.tsx`
   - `src/pages/KennelBoarding/KennelBoarding.css`

2. **Shared UI components**
   - `src/components/ListView/ListView.tsx`
   - `src/components/ActionBar/ActionBar.tsx`
   - `src/components/organisms/ListViewSearch.tsx`
   - `src/components/organisms/AutoCompleteTextbox.tsx`

3. **Client data contract**
   - `src/types/index.ts`
   - `src/config/index.ts`
   - `src/services/apiClient.ts`
   - `src/services/mockApi.ts`

4. **Server endpoints**
   - `src/server/index.js`

5. **Database schema and stored procedure layer**
   - `docs/boarding/schema.sql`

Supporting automated tests live in:

- `tests/features/kennel-boarding.feature`
- `tests/page_objects/KennelBoardingPage.js`
- `tests/step_definitions/kennelBoardingSteps.js`

---

## User Journey Overview

The kennel boarding workflow has two major screens:

### 1. Owner list screen

This is the landing screen for `/kennel-boarding`.

It provides:

- a searchable owner list via the shared `ListView` + `ListViewSearch`
- a toolbar with add and delete actions via `ActionBar`
- edit actions per row
- a success banner after create, update, or delete

Each row represents a single boarding enrolment record keyed by owner id.

Displayed list columns:

- `full_name`
- `pet_name`
- `email`

### 2. Multi-step enrolment form

Selecting **Add New Owner** or **Edit** opens the detail journey.

The form is structured into these sections:

1. Owner Details
2. Pet Details
3. Veterinary
4. Insurance
5. Vaccinations
6. Health & Medication
7. Behaviour
8. Feeding & Routine
9. Booking & Consent
10. Confirmation

The final step is a review screen, not a data-entry step.

---

## Component Responsibilities

## `KennelBoarding`

File:

- `src/pages/KennelBoarding/KennelBoarding.tsx`

Responsibilities:

- owns route-level state
- toggles between list and detail views
- handles add/edit/delete/save actions
- shows success banners
- sends records to the API layer

Primary route-level state:

- `view`: `'list' | 'detail'`
- `selectedIds`: selected list rows for deletion
- `selectedRecord`: record being edited
- `bannerMessage`: transient user feedback banner

### `BoardingDetailForm`

Nested inside the same file.

Responsibilities:

- holds in-progress form state for a single enrolment
- manages current step
- validates required fields before progression
- shows progress
- renders final confirmation/review page
- hands the final record back to the parent for persistence

Primary detail-level state:

- `record`: current `BoardingOwnerRecord`
- `currentStep`: numeric index of active form section
- `isReviewing`: whether the final confirmation page is active
- `errorMessage`: step-level validation feedback
- `isSaving`: confirm-button loading state

---

## Data Model

The front-end feature is centered around the `BoardingOwnerRecord` type in:

- `src/types/index.ts`

This record is intentionally flattened for UI convenience, even though the relational schema is normalized into multiple tables.

### Major field groups

#### Owner

- `full_name`
- `address`
- `postcode`
- `phone`
- `email`
- `preferred_contact`

#### Emergency contact

- `emergency_contact_name`
- `emergency_contact_relationship`
- `emergency_contact_phone`
- `emergency_contact_preferred_contact`

#### Pet identification

- `pet_name`
- `species`
- `breed`
- `date_of_birth`
- `sex`
- `neutered`
- `colour`
- `distinguishing_features`
- `microchip_number`
- `pet_photo_name`

#### Veterinary

- `vet_practice_name`
- `vet_phone`
- `emergency_vet_consent`
- `treatment_cost_limit`

#### Insurance

- `insurance_provider_name`
- `policy_holder_name`
- `policy_number`
- `emergency_claims_phone`
- `excess_amount`
- `exclusions`
- `insurance_consent`

#### Vaccinations

- `vaccinations`
- `vaccination_next_due_date`
- `vaccination_card_file_name`

#### Health

- `health_conditions`
- `medication_required`
- `medication_name`
- `dose`
- `administration_time`
- `special_instructions`
- `recent_illness`
- `flea_treatment_date`
- `worming_treatment_date`

#### Behaviour

- `mix_with_other_dogs`
- `aggression_toward`
- `separation_anxiety`
- `escape_risk`
- `triggers`

#### Routine

- `food_provided_by_owner`
- `food_type`
- `feeding_times`
- `portion_size`
- `treats_allowed`
- `exercise_preferences`

#### Booking and declaration

- `arrival_date`
- `departure_date`
- `dropoff_time`
- `collection_time`
- `grooming`
- `additional_exercise`
- `training_session`
- `owner_instructions`
- `vaccinated_agreement`
- `free_from_illness_agreement`
- `vet_treatment_authorized_agreement`
- `owner_responsible_costs_agreement`
- `info_accurate_agreement`
- `agrees_terms`
- `privacy_consent`
- `signature`
- `signed_date`

---

## Form Flow and Validation

The form is intentionally progressive.

### Progress behaviour

The current step is indicated by:

- a text label such as `Step 3 of 10`
- a visual progress bar

The earlier clickable step button strip was replaced with a progress bar to reduce distractions and keep progression linear.

### Sticky action area

The form footer is sticky so the primary action stays in a consistent on-screen position while moving between steps. This reduces re-targeting effort for users repeatedly advancing through the form.

### Validation behaviour

Validation is step-specific and enforced when the user presses the primary submit/progression button.

Required fields by step:

- **Owner Details**
  - `full_name`
  - `phone`
- **Pet Details**
  - `pet_name`
- **Veterinary**
  - `vet_practice_name`
- **Feeding & Routine**
  - `food_type`
- **Booking & Consent**
  - `arrival_date`
  - `departure_date`
  - `dropoff_time`
  - `collection_time`
  - `signature`

Additional confirmation gating before final save:

- `info_accurate_agreement`
- `agrees_terms`
- `privacy_consent`

If a required field is missing:

- the user stays on the same step
- an error message is shown
- validated text inputs are marked with `aria-invalid`

### Confirmation step

After the Booking & Consent step passes validation, the user is taken to the review page.

This page:

- summarizes all subform sections
- provides an `Edit` action for each section
- allows changes to be made without losing previously entered values
- requires explicit confirmation via **Confirm and finish**

After confirmation:

- the record is persisted
- the app returns to the list view
- a success banner is shown

---

## Shared Component Usage

## `ListView`

File:

- `src/components/ListView/ListView.tsx`

Usage in kennel boarding:

- renders list rows from `/api/boarding/owners`
- supports searching across configured fields
- supports selection for deletion
- supports row edit actions

The component was generalized to support a variable number of fields, which was necessary for kennel boarding list reuse.

## `ActionBar`

File:

- `src/components/ActionBar/ActionBar.tsx`

Usage:

- add new owner/enrolment
- delete selected enrolments

## `AutoCompleteTextbox`

File:

- `src/components/organisms/AutoCompleteTextbox.tsx`

Usage in kennel boarding:

- species
- breed
- vet practice
- insurance provider

Important note:

This component is suggestion-based text entry. It behaves like the current app’s existing combobox pattern and depends on lookup endpoints that return:

```json
{ "suggestions": [{ "name": "..." }] }
```

---

## Configuration and API Endpoints

Client endpoint configuration lives in:

- `src/config/index.ts`

Relevant kennel boarding endpoints:

- `apiBoardingOwners`
- `apiBoardingSpecies`
- `apiBoardingBreeds`
- `apiBoardingVets`
- `apiBoardingInsuranceProviders`

### REST contract

#### List / retrieve

- `GET /api/boarding/owners`

Returns a flattened list of enrolment records for the list page and edit entry point.

#### Create

- `POST /api/boarding/owners`

Creates a new enrolment by mapping the flattened payload to the database stored procedure layer.

#### Update

- `PUT /api/boarding/owners/:id`

Updates an existing enrolment.

#### Delete

- `DELETE /api/boarding/owners`

Expected request body:

```json
{ "ids": [1, 2, 3] }
```

#### Lookups

- `GET /api/boarding/lookups/species`
- `GET /api/boarding/lookups/breeds`
- `GET /api/boarding/lookups/vets`
- `GET /api/boarding/lookups/insurance-providers`

Expected query parameter:

- `query`

Example:

`/api/boarding/lookups/species?query=Do`

---

## Client API Fallback Strategy

The app uses:

- `src/services/apiClient.ts`

If `VITE_USE_MOCK_API === 'true'`, requests are routed to the in-memory mock layer immediately.

If the real network request throws at runtime, the client also falls back to:

- `src/services/mockApi.ts`

This makes the SPA usable when the backend is not running.

### Important caveat

Fallback happens on request failure, not on every non-OK server response. If the server is reachable and returns a structured application error, that error is surfaced instead of silently switching to mock data.

---

## Mock Data Layer

Mock behaviour lives in:

- `src/services/mockApi.ts`

It provides:

- seeded owner enrolments
- seeded lookups for species, breeds, vets, and insurance providers
- in-memory create/update/delete behaviour

This is the default practical driver for local UI work when the database-backed API is unavailable.

Use mock data when:

- developing UI only
- running locally without the backend
- running front-end tests that do not depend on PostgreSQL

---

## Server Implementation

Server routes live in:

- `src/server/index.js`

### Responsibilities

- expose kennel boarding REST endpoints
- translate flattened UI payloads into stored-procedure-compatible parameter arrays
- read consolidated data from the database view
- expose autocomplete lookup endpoints

### Payload mapping

The helper:

- `mapBoardingPayloadToParams`

maps the front-end `BoardingOwnerRecord` shape into ordered arguments expected by:

- `public.create_boarding_enrolment`
- `public.update_boarding_enrolment`

This function is the key transformation seam between UI and SQL.

If you add or reorder stored procedure parameters, update this function immediately.

---

## Database Design

Source of truth:

- `docs/boarding/schema.sql`

The schema is normalized into separate tables for owners, pets, emergency contacts, vets, insurance, health, routine, bookings, agreements, and documents.

### Core tables

- `owners`
- `emergency_contacts`
- `pets`
- `pet_species`
- `pet_breed`
- `vet_practices`
- `pet_vet`
- `insurance_providers`
- `pet_insurance`
- `vaccination_types`
- `pet_vaccinations`
- `pet_health`
- `pet_medication`
- `pet_behavior`
- `pet_routine`
- `bookings`
- `booking_agreements`
- `documents`

### Consolidated view

To support application-friendly reads, the feature adds:

- `vwboarding_enrolments`

This view joins the normalized schema into a flattened read model suited to the SPA.

### Stored procedures

The feature adds:

- `create_boarding_enrolment`
- `update_boarding_enrolment`
- `delete_boarding_enrolment`

These procedures orchestrate writes across multiple normalized tables.

### Lookup helper functions

Schema helpers support upsert-like lookup resolution for:

- species
- breed
- insurance provider
- vaccination type

---

## Data Mapping Summary

This is the practical mapping path from UI to persistence:

1. User edits form fields in `BoardingDetailForm`
2. State is held in a flattened `BoardingOwnerRecord`
3. `handleSave` sends that record through `apiClient`
4. `src/server/index.js` converts the payload via `mapBoardingPayloadToParams`
5. Express calls the relevant SQL stored procedure
6. The procedure writes into the normalized schema
7. Reads are returned through `vwboarding_enrolments`
8. The list screen rehydrates from the flattened API result

---

## Styling and UX Notes

Styling is in:

- `src/pages/KennelBoarding/KennelBoarding.css`

### Design goals

- mobile-first layout
- generous touch targets
- strong focus states
- full-width inputs on smaller viewports
- clear progress indication
- consistent footer action placement
- review cards for confirmation readability

### Accessibility notes

The implementation follows the provided UI guidance by using:

- visible labels
- native form inputs where possible
- field grouping with `fieldset` and `legend`
- aria live regions for progress and success messaging
- minimum touch-friendly control sizing
- keyboard-focus styling

Current validation feedback is strongest on required text/date/time fields. If accessibility requirements tighten further, the next likely improvement is field-specific `aria-describedby` wiring for every validation message.

---

## Testing

### Build validation

The feature has been validated with:

- `npm run build`

### BDD / Playwright coverage

BDD coverage lives in:

- `tests/features/kennel-boarding.feature`

The Playwright page object model is in:

- `tests/page_objects/KennelBoardingPage.js`

The step definitions are in:

- `tests/step_definitions/kennelBoardingSteps.js`

### What the BDD suite covers

- list screen elements
- required field blocking before progression
- progression through the journey
- confirmation page rendering
- editing from the confirmation screen
- successful final confirmation and return to list

### Exclusive test command

Run only the kennel boarding BDD suite with:

```bash
npm run test:gherkin:kennel-boarding
```

---

## Local Development Workflow

### Front-end only

If you only need the UI:

```bash
npm run dev
```

Then visit:

- `http://127.0.0.1:5173/kennel-boarding`

If needed, set:

- `VITE_USE_MOCK_API=true`

to force the mock layer.

### BDD tests

```bash
npm run test:gherkin:kennel-boarding
```

### Production build check

```bash
npm run build
```

---

## Extension Guidance

## If you add a new field

You will typically need to update all of these:

1. `src/types/index.ts`
2. `src/pages/KennelBoarding/KennelBoarding.tsx`
3. `src/services/mockApi.ts`
4. `src/server/index.js`
5. `docs/boarding/schema.sql`
6. BDD tests if user-visible behaviour changes

## If you add a new lookup combobox

You will typically need to update:

1. `src/config/index.ts`
2. `src/server/index.js` lookup route
3. `src/services/mockApi.ts` lookup data
4. `src/pages/KennelBoarding/KennelBoarding.tsx`

## If you change validation rules

Update:

- `validateStep` in `BoardingDetailForm`
- any related accessibility hints or error displays
- the BDD feature and page object expectations

## If you change database procedure signatures

Update in lockstep:

- `docs/boarding/schema.sql`
- `mapBoardingPayloadToParams` in `src/server/index.js`

Parameter order must remain aligned.

---

## Known Constraints and Tradeoffs

1. **Flattened UI model vs normalized database**
   - The UI is intentionally flattened for simpler step rendering.
   - The backend is responsible for mapping this to normalized tables.

2. **Mock API is richer than current DB read model in some areas**
   - Some review-only or advanced fields are more fully represented in the mock layer than in the current SQL read projection.

3. **Server read projection currently returns placeholders for some optional arrays**
   - For example, some multi-select style fields are stubbed in the view response path.

4. **Validation is step-based, not exhaustive domain validation**
   - The app currently enforces only the required progression fields requested for the journey.

5. **Autocomplete depends on shared component behaviour**
   - Any future change to `AutoCompleteTextbox` will affect kennel boarding comboboxes too.

---

## Recommended Future Improvements

If this feature is expanded further, the highest-value next steps are:

1. add field-level error summaries and `aria-describedby` wiring
2. persist uploaded file metadata more explicitly instead of file-name placeholders
3. expand the SQL read model to cover all review fields natively
4. add more BDD scenarios for delete, edit existing records, and negative confirmation paths
5. split `KennelBoarding.tsx` into smaller subcomponents if the form grows further

---

## File Map

### Primary feature files

- `src/App.jsx`
- `src/pages/KennelBoarding/KennelBoarding.tsx`
- `src/pages/KennelBoarding/KennelBoarding.css`
- `src/types/index.ts`
- `src/config/index.ts`
- `src/services/apiClient.ts`
- `src/services/mockApi.ts`
- `src/server/index.js`
- `docs/boarding/schema.sql`

### Testing files

- `tests/features/kennel-boarding.feature`
- `tests/page_objects/KennelBoardingPage.js`
- `tests/step_definitions/kennelBoardingSteps.js`
- `tests/step_definitions/hooks.js`

---

## Summary

The kennel boarding app is a guided enrolment SPA that combines:

- reusable shared UI building blocks
- a flattened client-side form model
- a normalized relational schema
- server-side payload transformation
- mock-backed resiliency for UI work
- BDD automation for the critical user journey

For most maintenance tasks, start with the page component and work outward:

1. UI state and rendering
2. types and config
3. mock and server API
4. schema and procedures
5. tests

That sequence matches the feature’s actual dependency chain and is usually the safest way to extend it.
