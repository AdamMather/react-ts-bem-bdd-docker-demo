--
-- Boarding Kennels Schema
-- Data access via views; CRUD via stored procedures.
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Sequences
--
CREATE SEQUENCE public.owner_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.emergency_contact_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_species_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_breed_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.vet_practice_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_vet_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.insurance_provider_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_insurance_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.vaccination_type_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_vaccination_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_health_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_medication_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_behavior_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.pet_routine_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.booking_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.booking_agreement_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.document_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--
-- Tables
--
CREATE TABLE public.owners (
  id integer DEFAULT nextval('public.owner_id_seq'::regclass) NOT NULL,
  full_name character varying(120) NOT NULL,
  address text,
  postcode character varying(20),
  phone character varying(30),
  email character varying(255),
  preferred_contact character varying(10) NOT NULL,
  CONSTRAINT owners_pkey PRIMARY KEY (id),
  CONSTRAINT owners_preferred_contact_chk CHECK (preferred_contact IN ('phone', 'email', 'text'))
);

CREATE TABLE public.emergency_contacts (
  id integer DEFAULT nextval('public.emergency_contact_id_seq'::regclass) NOT NULL,
  owner_id integer NOT NULL,
  name character varying(120) NOT NULL,
  relationship character varying(80),
  phone character varying(30) NOT NULL,
  preferred_contact character varying(10) NOT NULL,
  CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT emergency_contacts_preferred_contact_chk CHECK (preferred_contact IN ('phone', 'email', 'text')),
  CONSTRAINT emergency_contacts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id) ON DELETE CASCADE
);

CREATE TABLE public.pet_species (
  id integer DEFAULT nextval('public.pet_species_id_seq'::regclass) NOT NULL,
  name character varying(50) NOT NULL,
  CONSTRAINT pet_species_pkey PRIMARY KEY (id),
  CONSTRAINT pet_species_unique_name UNIQUE (name)
);

CREATE TABLE public.pet_breed (
  id integer DEFAULT nextval('public.pet_breed_id_seq'::regclass) NOT NULL,
  name character varying(80) NOT NULL,
  CONSTRAINT pet_breed_pkey PRIMARY KEY (id),
  CONSTRAINT pet_breed_unique_name UNIQUE (name)
);

CREATE TABLE public.pets (
  id integer DEFAULT nextval('public.pet_id_seq'::regclass) NOT NULL,
  owner_id integer NOT NULL,
  name character varying(80) NOT NULL,
  species_id integer,
  breed_id integer,
  date_of_birth date,
  sex character varying(1),
  neutered boolean DEFAULT false NOT NULL,
  colour character varying(60),
  distinguishing_features text,
  microchip_number character varying(50),
  CONSTRAINT pets_pkey PRIMARY KEY (id),
  CONSTRAINT pets_sex_chk CHECK (sex IN ('M', 'F')),
  CONSTRAINT pets_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id) ON DELETE CASCADE,
  CONSTRAINT pets_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.pet_species(id),
  CONSTRAINT pets_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.pet_breed(id)
);

CREATE TABLE public.vet_practices (
  id integer DEFAULT nextval('public.vet_practice_id_seq'::regclass) NOT NULL,
  name character varying(120) NOT NULL,
  phone character varying(30) NOT NULL,
  CONSTRAINT vet_practices_pkey PRIMARY KEY (id),
  CONSTRAINT vet_practices_unique_name UNIQUE (name)
);

CREATE TABLE public.pet_vet (
  id integer DEFAULT nextval('public.pet_vet_id_seq'::regclass) NOT NULL,
  pet_id integer NOT NULL,
  vet_practice_id integer NOT NULL,
  emergency_consent boolean DEFAULT false NOT NULL,
  treatment_cost_limit numeric(10,2),
  CONSTRAINT pet_vet_pkey PRIMARY KEY (id),
  CONSTRAINT pet_vet_unique_pet UNIQUE (pet_id),
  CONSTRAINT pet_vet_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE,
  CONSTRAINT pet_vet_vet_practice_id_fkey FOREIGN KEY (vet_practice_id) REFERENCES public.vet_practices(id)
);

CREATE TABLE public.insurance_providers (
  id integer DEFAULT nextval('public.insurance_provider_id_seq'::regclass) NOT NULL,
  name character varying(120) NOT NULL,
  CONSTRAINT insurance_providers_pkey PRIMARY KEY (id),
  CONSTRAINT insurance_providers_unique_name UNIQUE (name)
);

CREATE TABLE public.pet_insurance (
  id integer DEFAULT nextval('public.pet_insurance_id_seq'::regclass) NOT NULL,
  pet_id integer NOT NULL,
  provider_id integer NOT NULL,
  policy_holder_name character varying(120),
  policy_number character varying(60),
  emergency_claims_phone character varying(30),
  excess_amount numeric(10,2),
  exclusions text,
  consent boolean DEFAULT false NOT NULL,
  CONSTRAINT pet_insurance_pkey PRIMARY KEY (id),
  CONSTRAINT pet_insurance_unique_pet UNIQUE (pet_id),
  CONSTRAINT pet_insurance_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE,
  CONSTRAINT pet_insurance_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.insurance_providers(id)
);

CREATE TABLE public.vaccination_types (
  id integer DEFAULT nextval('public.vaccination_type_id_seq'::regclass) NOT NULL,
  name character varying(120) NOT NULL,
  is_required boolean DEFAULT false NOT NULL,
  species_id integer,
  CONSTRAINT vaccination_types_pkey PRIMARY KEY (id),
  CONSTRAINT vaccination_types_unique_name UNIQUE (name),
  CONSTRAINT vaccination_types_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.pet_species(id)
);

CREATE TABLE public.documents (
  id integer DEFAULT nextval('public.document_id_seq'::regclass) NOT NULL,
  owner_id integer,
  pet_id integer,
  booking_id integer,
  document_type character varying(50) NOT NULL,
  file_name character varying(255),
  file_url text,
  uploaded_at timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT documents_pkey PRIMARY KEY (id)
);

CREATE TABLE public.pet_vaccinations (
  id integer DEFAULT nextval('public.pet_vaccination_id_seq'::regclass) NOT NULL,
  pet_id integer NOT NULL,
  vaccination_type_id integer NOT NULL,
  is_confirmed boolean DEFAULT false NOT NULL,
  next_due_date date,
  document_id integer,
  CONSTRAINT pet_vaccinations_pkey PRIMARY KEY (id),
  CONSTRAINT pet_vaccinations_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE,
  CONSTRAINT pet_vaccinations_vaccination_type_id_fkey FOREIGN KEY (vaccination_type_id) REFERENCES public.vaccination_types(id),
  CONSTRAINT pet_vaccinations_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id)
);

CREATE TABLE public.pet_health (
  id integer DEFAULT nextval('public.pet_health_id_seq'::regclass) NOT NULL,
  pet_id integer NOT NULL,
  conditions text,
  medication_required boolean DEFAULT false NOT NULL,
  recent_illness boolean DEFAULT false NOT NULL,
  flea_treatment_date date,
  worming_treatment_date date,
  CONSTRAINT pet_health_pkey PRIMARY KEY (id),
  CONSTRAINT pet_health_unique_pet UNIQUE (pet_id),
  CONSTRAINT pet_health_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE
);

CREATE TABLE public.pet_medication (
  id integer DEFAULT nextval('public.pet_medication_id_seq'::regclass) NOT NULL,
  pet_id integer NOT NULL,
  medication_name character varying(120) NOT NULL,
  dose character varying(80),
  administration_time character varying(40),
  instructions text,
  CONSTRAINT pet_medication_pkey PRIMARY KEY (id),
  CONSTRAINT pet_medication_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE
);

CREATE TABLE public.pet_behavior (
  id integer DEFAULT nextval('public.pet_behavior_id_seq'::regclass) NOT NULL,
  pet_id integer NOT NULL,
  mix_with_dogs character varying(12),
  aggression_dogs boolean DEFAULT false NOT NULL,
  aggression_people boolean DEFAULT false NOT NULL,
  separation_anxiety boolean DEFAULT false NOT NULL,
  escape_risk boolean DEFAULT false NOT NULL,
  triggers text,
  CONSTRAINT pet_behavior_pkey PRIMARY KEY (id),
  CONSTRAINT pet_behavior_unique_pet UNIQUE (pet_id),
  CONSTRAINT pet_behavior_mix_with_dogs_chk CHECK (mix_with_dogs IN ('yes', 'no', 'unsure', 'selectively')),
  CONSTRAINT pet_behavior_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE
);

CREATE TABLE public.pet_routine (
  id integer DEFAULT nextval('public.pet_routine_id_seq'::regclass) NOT NULL,
  pet_id integer NOT NULL,
  food_provided_by_owner boolean DEFAULT false NOT NULL,
  food_type character varying(120),
  feeding_times character varying(120),
  portion_size character varying(80),
  treats_allowed boolean DEFAULT false NOT NULL,
  exercise_level character varying(10),
  sleeping_preference character varying(20),
  CONSTRAINT pet_routine_pkey PRIMARY KEY (id),
  CONSTRAINT pet_routine_unique_pet UNIQUE (pet_id),
  CONSTRAINT pet_routine_exercise_level_chk CHECK (exercise_level IN ('low', 'medium', 'high')),
  CONSTRAINT pet_routine_sleeping_pref_chk CHECK (sleeping_preference IN ('kennel_bedding', 'owner_bedding')),
  CONSTRAINT pet_routine_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE
);

CREATE TABLE public.bookings (
  id integer DEFAULT nextval('public.booking_id_seq'::regclass) NOT NULL,
  pet_id integer NOT NULL,
  arrival_date date NOT NULL,
  departure_date date NOT NULL,
  dropoff_time time without time zone,
  collection_time time without time zone,
  grooming boolean DEFAULT false NOT NULL,
  additional_exercise boolean DEFAULT false NOT NULL,
  training_session boolean DEFAULT false NOT NULL,
  owner_instructions text,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE
);

CREATE TABLE public.booking_agreements (
  id integer DEFAULT nextval('public.booking_agreement_id_seq'::regclass) NOT NULL,
  booking_id integer NOT NULL,
  vaccinated boolean DEFAULT false NOT NULL,
  free_from_illness boolean DEFAULT false NOT NULL,
  vet_treatment_authorized boolean DEFAULT false NOT NULL,
  owner_responsible_costs boolean DEFAULT false NOT NULL,
  info_accurate boolean DEFAULT false NOT NULL,
  agrees_terms boolean DEFAULT false NOT NULL,
  signature character varying(120),
  signed_date date,
  privacy_consent boolean DEFAULT false NOT NULL,
  CONSTRAINT booking_agreements_pkey PRIMARY KEY (id),
  CONSTRAINT booking_agreements_unique_booking UNIQUE (booking_id),
  CONSTRAINT booking_agreements_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE
);

ALTER TABLE public.documents
  ADD CONSTRAINT documents_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id) ON DELETE CASCADE,
  ADD CONSTRAINT documents_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE,
  ADD CONSTRAINT documents_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

--
-- Lookup helper functions
--
CREATE FUNCTION public.get_pet_species(value character varying) RETURNS integer
  LANGUAGE plpgsql
AS $$
DECLARE
  value_id integer;
BEGIN
  INSERT INTO public.pet_species (name) VALUES (value)
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO value_id
  FROM public.pet_species
  WHERE name = value
  LIMIT 1;

  RETURN value_id;
END;
$$;

CREATE FUNCTION public.get_pet_breed(value character varying) RETURNS integer
  LANGUAGE plpgsql
AS $$
DECLARE
  value_id integer;
BEGIN
  INSERT INTO public.pet_breed (name) VALUES (value)
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO value_id
  FROM public.pet_breed
  WHERE name = value
  LIMIT 1;

  RETURN value_id;
END;
$$;

CREATE FUNCTION public.get_insurance_provider(value character varying) RETURNS integer
  LANGUAGE plpgsql
AS $$
DECLARE
  value_id integer;
BEGIN
  INSERT INTO public.insurance_providers (name) VALUES (value)
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO value_id
  FROM public.insurance_providers
  WHERE name = value
  LIMIT 1;

  RETURN value_id;
END;
$$;

CREATE FUNCTION public.get_vaccination_type(value character varying, required_flag boolean, species_id integer) RETURNS integer
  LANGUAGE plpgsql
AS $$
DECLARE
  value_id integer;
BEGIN
  INSERT INTO public.vaccination_types (name, is_required, species_id)
  VALUES (value, required_flag, species_id)
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO value_id
  FROM public.vaccination_types
  WHERE name = value
  LIMIT 1;

  RETURN value_id;
END;
$$;

--
-- CRUD stored procedures
--
CREATE PROCEDURE public.create_owner(
  IN full_name character varying,
  IN address text,
  IN postcode character varying,
  IN phone character varying,
  IN email character varying,
  IN preferred_contact character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.owners (full_name, address, postcode, phone, email, preferred_contact)
  VALUES (full_name, address, postcode, phone, email, preferred_contact);
END;
$$;

CREATE PROCEDURE public.update_owner(
  IN p_owner_id integer,
  IN p_full_name character varying,
  IN p_address text,
  IN p_postcode character varying,
  IN p_phone character varying,
  IN p_email character varying,
  IN p_preferred_contact character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.owners
  SET full_name = p_full_name,
      address = p_address,
      postcode = p_postcode,
      phone = p_phone,
      email = p_email,
      preferred_contact = p_preferred_contact
  WHERE id = p_owner_id;
END;
$$;

CREATE PROCEDURE public.delete_owner(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.owners WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_emergency_contact(
  IN owner_id integer,
  IN name character varying,
  IN relationship character varying,
  IN phone character varying,
  IN preferred_contact character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.emergency_contacts (owner_id, name, relationship, phone, preferred_contact)
  VALUES (owner_id, name, relationship, phone, preferred_contact);
END;
$$;

CREATE PROCEDURE public.update_emergency_contact(
  IN p_contact_id integer,
  IN p_owner_id integer,
  IN p_name character varying,
  IN p_relationship character varying,
  IN p_phone character varying,
  IN p_preferred_contact character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.emergency_contacts
  SET owner_id = p_owner_id,
      name = p_name,
      relationship = p_relationship,
      phone = p_phone,
      preferred_contact = p_preferred_contact
  WHERE id = p_contact_id;
END;
$$;

CREATE PROCEDURE public.delete_emergency_contact(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.emergency_contacts WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_pet(
  IN owner_id integer,
  IN pet_name character varying,
  IN species_name character varying,
  IN breed_name character varying,
  IN date_of_birth date,
  IN sex character varying,
  IN neutered boolean,
  IN colour character varying,
  IN distinguishing_features text,
  IN microchip_number character varying
)
LANGUAGE plpgsql
AS $$
DECLARE
  species_id integer;
  breed_id integer;
BEGIN
  IF species_name IS NOT NULL THEN
    SELECT public.get_pet_species(species_name) INTO species_id;
  END IF;
  IF breed_name IS NOT NULL THEN
    SELECT public.get_pet_breed(breed_name) INTO breed_id;
  END IF;

  INSERT INTO public.pets (owner_id, name, species_id, breed_id, date_of_birth, sex, neutered, colour, distinguishing_features, microchip_number)
  VALUES (owner_id, pet_name, species_id, breed_id, date_of_birth, sex, neutered, colour, distinguishing_features, microchip_number);
END;
$$;

CREATE PROCEDURE public.update_pet(
  IN p_pet_id integer,
  IN p_owner_id integer,
  IN p_pet_name character varying,
  IN p_species_name character varying,
  IN p_breed_name character varying,
  IN p_date_of_birth date,
  IN p_sex character varying,
  IN p_neutered boolean,
  IN p_colour character varying,
  IN p_distinguishing_features text,
  IN p_microchip_number character varying
)
LANGUAGE plpgsql
AS $$
DECLARE
  species_id integer;
  breed_id integer;
BEGIN
  IF p_species_name IS NOT NULL THEN
    SELECT public.get_pet_species(p_species_name) INTO species_id;
  END IF;
  IF p_breed_name IS NOT NULL THEN
    SELECT public.get_pet_breed(p_breed_name) INTO breed_id;
  END IF;

  UPDATE public.pets
  SET owner_id = p_owner_id,
      name = p_pet_name,
      species_id = species_id,
      breed_id = breed_id,
      date_of_birth = p_date_of_birth,
      sex = p_sex,
      neutered = p_neutered,
      colour = p_colour,
      distinguishing_features = p_distinguishing_features,
      microchip_number = p_microchip_number
  WHERE id = p_pet_id;
END;
$$;

CREATE PROCEDURE public.delete_pet(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.pets WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_vet_practice(
  IN name character varying,
  IN phone character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.vet_practices (name, phone)
  VALUES (name, phone);
END;
$$;

CREATE PROCEDURE public.update_vet_practice(
  IN p_vet_practice_id integer,
  IN p_name character varying,
  IN p_phone character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.vet_practices
  SET name = p_name,
      phone = p_phone
  WHERE id = p_vet_practice_id;
END;
$$;

CREATE PROCEDURE public.delete_vet_practice(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.vet_practices WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_pet_vet(
  IN pet_id integer,
  IN vet_practice_id integer,
  IN emergency_consent boolean,
  IN treatment_cost_limit numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.pet_vet (pet_id, vet_practice_id, emergency_consent, treatment_cost_limit)
  VALUES (pet_id, vet_practice_id, emergency_consent, treatment_cost_limit);
END;
$$;

CREATE PROCEDURE public.update_pet_vet(
  IN p_pet_vet_id integer,
  IN p_pet_id integer,
  IN p_vet_practice_id integer,
  IN p_emergency_consent boolean,
  IN p_treatment_cost_limit numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.pet_vet
  SET pet_id = p_pet_id,
      vet_practice_id = p_vet_practice_id,
      emergency_consent = p_emergency_consent,
      treatment_cost_limit = p_treatment_cost_limit
  WHERE id = p_pet_vet_id;
END;
$$;

CREATE PROCEDURE public.delete_pet_vet(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.pet_vet WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_pet_insurance(
  IN pet_id integer,
  IN provider_name character varying,
  IN policy_holder_name character varying,
  IN policy_number character varying,
  IN emergency_claims_phone character varying,
  IN excess_amount numeric,
  IN exclusions text,
  IN consent boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  provider_id integer;
BEGIN
  IF provider_name IS NOT NULL THEN
    SELECT public.get_insurance_provider(provider_name) INTO provider_id;
  END IF;

  INSERT INTO public.pet_insurance (pet_id, provider_id, policy_holder_name, policy_number, emergency_claims_phone, excess_amount, exclusions, consent)
  VALUES (pet_id, provider_id, policy_holder_name, policy_number, emergency_claims_phone, excess_amount, exclusions, consent);
END;
$$;

CREATE PROCEDURE public.update_pet_insurance(
  IN p_pet_insurance_id integer,
  IN p_pet_id integer,
  IN p_provider_name character varying,
  IN p_policy_holder_name character varying,
  IN p_policy_number character varying,
  IN p_emergency_claims_phone character varying,
  IN p_excess_amount numeric,
  IN p_exclusions text,
  IN p_consent boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  provider_id integer;
BEGIN
  IF p_provider_name IS NOT NULL THEN
    SELECT public.get_insurance_provider(p_provider_name) INTO provider_id;
  END IF;

  UPDATE public.pet_insurance
  SET pet_id = p_pet_id,
      provider_id = provider_id,
      policy_holder_name = p_policy_holder_name,
      policy_number = p_policy_number,
      emergency_claims_phone = p_emergency_claims_phone,
      excess_amount = p_excess_amount,
      exclusions = p_exclusions,
      consent = p_consent
  WHERE id = p_pet_insurance_id;
END;
$$;

CREATE PROCEDURE public.delete_pet_insurance(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.pet_insurance WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_pet_vaccination(
  IN pet_id integer,
  IN vaccination_name character varying,
  IN is_required boolean,
  IN species_id integer,
  IN is_confirmed boolean,
  IN next_due_date date,
  IN document_id integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  vaccination_type_id integer;
BEGIN
  IF vaccination_name IS NOT NULL THEN
    SELECT public.get_vaccination_type(vaccination_name, is_required, species_id) INTO vaccination_type_id;
  END IF;

  INSERT INTO public.pet_vaccinations (pet_id, vaccination_type_id, is_confirmed, next_due_date, document_id)
  VALUES (pet_id, vaccination_type_id, is_confirmed, next_due_date, document_id);
END;
$$;

CREATE PROCEDURE public.update_pet_vaccination(
  IN p_pet_vaccination_id integer,
  IN p_pet_id integer,
  IN p_vaccination_name character varying,
  IN p_is_required boolean,
  IN p_species_id integer,
  IN p_is_confirmed boolean,
  IN p_next_due_date date,
  IN p_document_id integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  vaccination_type_id integer;
BEGIN
  IF p_vaccination_name IS NOT NULL THEN
    SELECT public.get_vaccination_type(p_vaccination_name, p_is_required, p_species_id) INTO vaccination_type_id;
  END IF;

  UPDATE public.pet_vaccinations
  SET pet_id = p_pet_id,
      vaccination_type_id = vaccination_type_id,
      is_confirmed = p_is_confirmed,
      next_due_date = p_next_due_date,
      document_id = p_document_id
  WHERE id = p_pet_vaccination_id;
END;
$$;

CREATE PROCEDURE public.delete_pet_vaccination(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.pet_vaccinations WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_pet_health(
  IN pet_id integer,
  IN conditions text,
  IN medication_required boolean,
  IN recent_illness boolean,
  IN flea_treatment_date date,
  IN worming_treatment_date date
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.pet_health (pet_id, conditions, medication_required, recent_illness, flea_treatment_date, worming_treatment_date)
  VALUES (pet_id, conditions, medication_required, recent_illness, flea_treatment_date, worming_treatment_date);
END;
$$;

CREATE PROCEDURE public.update_pet_health(
  IN p_pet_health_id integer,
  IN p_pet_id integer,
  IN p_conditions text,
  IN p_medication_required boolean,
  IN p_recent_illness boolean,
  IN p_flea_treatment_date date,
  IN p_worming_treatment_date date
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.pet_health
  SET pet_id = p_pet_id,
      conditions = p_conditions,
      medication_required = p_medication_required,
      recent_illness = p_recent_illness,
      flea_treatment_date = p_flea_treatment_date,
      worming_treatment_date = p_worming_treatment_date
  WHERE id = p_pet_health_id;
END;
$$;

CREATE PROCEDURE public.delete_pet_health(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.pet_health WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_pet_medication(
  IN pet_id integer,
  IN medication_name character varying,
  IN dose character varying,
  IN administration_time character varying,
  IN instructions text
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.pet_medication (pet_id, medication_name, dose, administration_time, instructions)
  VALUES (pet_id, medication_name, dose, administration_time, instructions);
END;
$$;

CREATE PROCEDURE public.update_pet_medication(
  IN p_pet_medication_id integer,
  IN p_pet_id integer,
  IN p_medication_name character varying,
  IN p_dose character varying,
  IN p_administration_time character varying,
  IN p_instructions text
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.pet_medication
  SET pet_id = p_pet_id,
      medication_name = p_medication_name,
      dose = p_dose,
      administration_time = p_administration_time,
      instructions = p_instructions
  WHERE id = p_pet_medication_id;
END;
$$;

CREATE PROCEDURE public.delete_pet_medication(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.pet_medication WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_pet_behavior(
  IN pet_id integer,
  IN mix_with_dogs character varying,
  IN aggression_dogs boolean,
  IN aggression_people boolean,
  IN separation_anxiety boolean,
  IN escape_risk boolean,
  IN triggers text
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.pet_behavior (pet_id, mix_with_dogs, aggression_dogs, aggression_people, separation_anxiety, escape_risk, triggers)
  VALUES (pet_id, mix_with_dogs, aggression_dogs, aggression_people, separation_anxiety, escape_risk, triggers);
END;
$$;

CREATE PROCEDURE public.update_pet_behavior(
  IN p_pet_behavior_id integer,
  IN p_pet_id integer,
  IN p_mix_with_dogs character varying,
  IN p_aggression_dogs boolean,
  IN p_aggression_people boolean,
  IN p_separation_anxiety boolean,
  IN p_escape_risk boolean,
  IN p_triggers text
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.pet_behavior
  SET pet_id = p_pet_id,
      mix_with_dogs = p_mix_with_dogs,
      aggression_dogs = p_aggression_dogs,
      aggression_people = p_aggression_people,
      separation_anxiety = p_separation_anxiety,
      escape_risk = p_escape_risk,
      triggers = p_triggers
  WHERE id = p_pet_behavior_id;
END;
$$;

CREATE PROCEDURE public.delete_pet_behavior(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.pet_behavior WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_pet_routine(
  IN pet_id integer,
  IN food_provided_by_owner boolean,
  IN food_type character varying,
  IN feeding_times character varying,
  IN portion_size character varying,
  IN treats_allowed boolean,
  IN exercise_level character varying,
  IN sleeping_preference character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.pet_routine (pet_id, food_provided_by_owner, food_type, feeding_times, portion_size, treats_allowed, exercise_level, sleeping_preference)
  VALUES (pet_id, food_provided_by_owner, food_type, feeding_times, portion_size, treats_allowed, exercise_level, sleeping_preference);
END;
$$;

CREATE PROCEDURE public.update_pet_routine(
  IN p_pet_routine_id integer,
  IN p_pet_id integer,
  IN p_food_provided_by_owner boolean,
  IN p_food_type character varying,
  IN p_feeding_times character varying,
  IN p_portion_size character varying,
  IN p_treats_allowed boolean,
  IN p_exercise_level character varying,
  IN p_sleeping_preference character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.pet_routine
  SET pet_id = p_pet_id,
      food_provided_by_owner = p_food_provided_by_owner,
      food_type = p_food_type,
      feeding_times = p_feeding_times,
      portion_size = p_portion_size,
      treats_allowed = p_treats_allowed,
      exercise_level = p_exercise_level,
      sleeping_preference = p_sleeping_preference
  WHERE id = p_pet_routine_id;
END;
$$;

CREATE PROCEDURE public.delete_pet_routine(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.pet_routine WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_booking(
  IN pet_id integer,
  IN arrival_date date,
  IN departure_date date,
  IN dropoff_time time,
  IN collection_time time,
  IN grooming boolean,
  IN additional_exercise boolean,
  IN training_session boolean,
  IN owner_instructions text
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.bookings (pet_id, arrival_date, departure_date, dropoff_time, collection_time, grooming, additional_exercise, training_session, owner_instructions)
  VALUES (pet_id, arrival_date, departure_date, dropoff_time, collection_time, grooming, additional_exercise, training_session, owner_instructions);
END;
$$;

CREATE PROCEDURE public.update_booking(
  IN p_booking_id integer,
  IN p_pet_id integer,
  IN p_arrival_date date,
  IN p_departure_date date,
  IN p_dropoff_time time,
  IN p_collection_time time,
  IN p_grooming boolean,
  IN p_additional_exercise boolean,
  IN p_training_session boolean,
  IN p_owner_instructions text
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.bookings
  SET pet_id = p_pet_id,
      arrival_date = p_arrival_date,
      departure_date = p_departure_date,
      dropoff_time = p_dropoff_time,
      collection_time = p_collection_time,
      grooming = p_grooming,
      additional_exercise = p_additional_exercise,
      training_session = p_training_session,
      owner_instructions = p_owner_instructions
  WHERE id = p_booking_id;
END;
$$;

CREATE PROCEDURE public.delete_booking(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.bookings WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_booking_agreement(
  IN booking_id integer,
  IN vaccinated boolean,
  IN free_from_illness boolean,
  IN vet_treatment_authorized boolean,
  IN owner_responsible_costs boolean,
  IN info_accurate boolean,
  IN agrees_terms boolean,
  IN signature character varying,
  IN signed_date date,
  IN privacy_consent boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.booking_agreements (
    booking_id,
    vaccinated,
    free_from_illness,
    vet_treatment_authorized,
    owner_responsible_costs,
    info_accurate,
    agrees_terms,
    signature,
    signed_date,
    privacy_consent
  )
  VALUES (
    booking_id,
    vaccinated,
    free_from_illness,
    vet_treatment_authorized,
    owner_responsible_costs,
    info_accurate,
    agrees_terms,
    signature,
    signed_date,
    privacy_consent
  );
END;
$$;

CREATE PROCEDURE public.update_booking_agreement(
  IN p_agreement_id integer,
  IN p_booking_id integer,
  IN p_vaccinated boolean,
  IN p_free_from_illness boolean,
  IN p_vet_treatment_authorized boolean,
  IN p_owner_responsible_costs boolean,
  IN p_info_accurate boolean,
  IN p_agrees_terms boolean,
  IN p_signature character varying,
  IN p_signed_date date,
  IN p_privacy_consent boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.booking_agreements
  SET booking_id = p_booking_id,
      vaccinated = p_vaccinated,
      free_from_illness = p_free_from_illness,
      vet_treatment_authorized = p_vet_treatment_authorized,
      owner_responsible_costs = p_owner_responsible_costs,
      info_accurate = p_info_accurate,
      agrees_terms = p_agrees_terms,
      signature = p_signature,
      signed_date = p_signed_date,
      privacy_consent = p_privacy_consent
  WHERE id = p_agreement_id;
END;
$$;

CREATE PROCEDURE public.delete_booking_agreement(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.booking_agreements WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.create_document(
  IN owner_id integer,
  IN pet_id integer,
  IN booking_id integer,
  IN document_type character varying,
  IN file_name character varying,
  IN file_url text
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.documents (owner_id, pet_id, booking_id, document_type, file_name, file_url)
  VALUES (owner_id, pet_id, booking_id, document_type, file_name, file_url);
END;
$$;

CREATE PROCEDURE public.update_document(
  IN p_document_id integer,
  IN p_owner_id integer,
  IN p_pet_id integer,
  IN p_booking_id integer,
  IN p_document_type character varying,
  IN p_file_name character varying,
  IN p_file_url text
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.documents
  SET owner_id = p_owner_id,
      pet_id = p_pet_id,
      booking_id = p_booking_id,
      document_type = p_document_type,
      file_name = p_file_name,
      file_url = p_file_url
  WHERE id = p_document_id;
END;
$$;

CREATE PROCEDURE public.delete_document(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.documents WHERE id = ANY(ids);
END;
$$;

--
-- Views
--
CREATE VIEW public.vwowners AS
  SELECT id, full_name, address, postcode, phone, email, preferred_contact
  FROM public.owners;

CREATE VIEW public.vwemergency_contacts AS
  SELECT ec.id,
         ec.owner_id,
         o.full_name AS owner_name,
         ec.name,
         ec.relationship,
         ec.phone,
         ec.preferred_contact
  FROM public.emergency_contacts ec
  JOIN public.owners o ON ec.owner_id = o.id;

CREATE VIEW public.vwpets AS
  SELECT p.id,
         p.owner_id,
         o.full_name AS owner_name,
         p.name,
         ps.name AS species,
         pb.name AS breed,
         p.date_of_birth,
         p.sex,
         p.neutered,
         p.colour,
         p.distinguishing_features,
         p.microchip_number
  FROM public.pets p
  JOIN public.owners o ON p.owner_id = o.id
  LEFT JOIN public.pet_species ps ON p.species_id = ps.id
  LEFT JOIN public.pet_breed pb ON p.breed_id = pb.id;

CREATE VIEW public.vwpet_vet AS
  SELECT pv.id,
         pv.pet_id,
         p.name AS pet_name,
         v.name AS vet_practice,
         v.phone AS vet_phone,
         pv.emergency_consent,
         pv.treatment_cost_limit
  FROM public.pet_vet pv
  JOIN public.pets p ON pv.pet_id = p.id
  JOIN public.vet_practices v ON pv.vet_practice_id = v.id;

CREATE VIEW public.vwpet_insurance AS
  SELECT pi.id,
         pi.pet_id,
         p.name AS pet_name,
         ip.name AS provider_name,
         pi.policy_holder_name,
         pi.policy_number,
         pi.emergency_claims_phone,
         pi.excess_amount,
         pi.exclusions,
         pi.consent
  FROM public.pet_insurance pi
  JOIN public.pets p ON pi.pet_id = p.id
  JOIN public.insurance_providers ip ON pi.provider_id = ip.id;

CREATE VIEW public.vwpet_vaccinations AS
  SELECT pv.id,
         pv.pet_id,
         p.name AS pet_name,
         vt.name AS vaccination,
         vt.is_required,
         pv.is_confirmed,
         pv.next_due_date,
         d.file_name AS document_name,
         d.file_url AS document_url
  FROM public.pet_vaccinations pv
  JOIN public.pets p ON pv.pet_id = p.id
  JOIN public.vaccination_types vt ON pv.vaccination_type_id = vt.id
  LEFT JOIN public.documents d ON pv.document_id = d.id;

CREATE VIEW public.vwpet_health AS
  SELECT ph.id,
         ph.pet_id,
         p.name AS pet_name,
         ph.conditions,
         ph.medication_required,
         ph.recent_illness,
         ph.flea_treatment_date,
         ph.worming_treatment_date
  FROM public.pet_health ph
  JOIN public.pets p ON ph.pet_id = p.id;

CREATE VIEW public.vwpet_medication AS
  SELECT pm.id,
         pm.pet_id,
         p.name AS pet_name,
         pm.medication_name,
         pm.dose,
         pm.administration_time,
         pm.instructions
  FROM public.pet_medication pm
  JOIN public.pets p ON pm.pet_id = p.id;

CREATE VIEW public.vwpet_behavior AS
  SELECT pb.id,
         pb.pet_id,
         p.name AS pet_name,
         pb.mix_with_dogs,
         pb.aggression_dogs,
         pb.aggression_people,
         pb.separation_anxiety,
         pb.escape_risk,
         pb.triggers
  FROM public.pet_behavior pb
  JOIN public.pets p ON pb.pet_id = p.id;

CREATE VIEW public.vwpet_routine AS
  SELECT pr.id,
         pr.pet_id,
         p.name AS pet_name,
         pr.food_provided_by_owner,
         pr.food_type,
         pr.feeding_times,
         pr.portion_size,
         pr.treats_allowed,
         pr.exercise_level,
         pr.sleeping_preference
  FROM public.pet_routine pr
  JOIN public.pets p ON pr.pet_id = p.id;

CREATE VIEW public.vwbookings AS
  SELECT b.id,
         b.pet_id,
         p.name AS pet_name,
         o.full_name AS owner_name,
         b.arrival_date,
         b.departure_date,
         b.dropoff_time,
         b.collection_time,
         b.grooming,
         b.additional_exercise,
         b.training_session,
         b.owner_instructions
  FROM public.bookings b
  JOIN public.pets p ON b.pet_id = p.id
  JOIN public.owners o ON p.owner_id = o.id;

CREATE VIEW public.vwbooking_agreements AS
  SELECT ba.id,
         ba.booking_id,
         b.pet_id,
         p.name AS pet_name,
         ba.vaccinated,
         ba.free_from_illness,
         ba.vet_treatment_authorized,
         ba.owner_responsible_costs,
         ba.info_accurate,
         ba.agrees_terms,
         ba.signature,
         ba.signed_date,
         ba.privacy_consent
  FROM public.booking_agreements ba
  JOIN public.bookings b ON ba.booking_id = b.id
  JOIN public.pets p ON b.pet_id = p.id;

CREATE VIEW public.vwdocuments AS
  SELECT d.id,
         d.document_type,
         d.file_name,
         d.file_url,
         d.uploaded_at,
         d.owner_id,
         o.full_name AS owner_name,
         d.pet_id,
         p.name AS pet_name,
         d.booking_id
  FROM public.documents d
  LEFT JOIN public.owners o ON d.owner_id = o.id
  LEFT JOIN public.pets p ON d.pet_id = p.id;

CREATE VIEW public.vwpet_emergency_summary AS
  SELECT p.id AS pet_id,
         p.name AS pet_name,
         o.full_name AS owner_name,
         o.phone AS owner_phone,
         o.email AS owner_email,
         v.name AS vet_practice,
         v.phone AS vet_phone,
         pv.emergency_consent,
         pv.treatment_cost_limit,
         ph.conditions,
         ph.medication_required,
         ph.recent_illness,
         pm.medication_name,
         pm.dose,
         pm.administration_time,
         pm.instructions
  FROM public.pets p
  JOIN public.owners o ON p.owner_id = o.id
  LEFT JOIN public.pet_vet pv ON pv.pet_id = p.id
  LEFT JOIN public.vet_practices v ON pv.vet_practice_id = v.id
  LEFT JOIN public.pet_health ph ON ph.pet_id = p.id
  LEFT JOIN public.pet_medication pm ON pm.pet_id = p.id;

CREATE VIEW public.vwboarding_enrolments AS
  SELECT o.id,
         o.full_name,
         o.address,
         o.postcode,
         o.phone,
         o.email,
         o.preferred_contact,
         ec.name AS emergency_contact_name,
         ec.relationship AS emergency_contact_relationship,
         ec.phone AS emergency_contact_phone,
         ec.preferred_contact AS emergency_contact_preferred_contact,
         p.name AS pet_name,
         ps.name AS species,
         pb.name AS breed,
         p.date_of_birth,
         p.sex,
         p.neutered,
         p.colour,
         p.distinguishing_features,
         p.microchip_number,
         vp.name AS vet_practice_name,
         vp.phone AS vet_phone,
         pv.emergency_consent,
         pv.treatment_cost_limit,
         ip.name AS insurance_provider_name,
         pi.policy_holder_name,
         pi.policy_number,
         pi.emergency_claims_phone,
         pi.excess_amount,
         pi.exclusions,
         pi.consent AS insurance_consent,
         ph.conditions AS health_conditions,
         ph.medication_required,
         ph.recent_illness,
         ph.flea_treatment_date,
         ph.worming_treatment_date,
         pr.food_provided_by_owner,
         pr.food_type,
         pr.feeding_times,
         pr.portion_size,
         pr.treats_allowed,
         pr.exercise_level,
         b.arrival_date,
         b.departure_date,
         b.dropoff_time,
         b.collection_time,
         b.grooming,
         b.additional_exercise,
         b.training_session,
         b.owner_instructions,
         ba.vaccinated AS vaccinated_agreement,
         ba.free_from_illness AS free_from_illness_agreement,
         ba.vet_treatment_authorized AS vet_treatment_authorized_agreement,
         ba.owner_responsible_costs AS owner_responsible_costs_agreement,
         ba.info_accurate AS info_accurate_agreement,
         ba.agrees_terms,
         ba.signature,
         ba.signed_date,
         ba.privacy_consent
  FROM public.owners o
  LEFT JOIN public.emergency_contacts ec ON ec.owner_id = o.id
  LEFT JOIN public.pets p ON p.owner_id = o.id
  LEFT JOIN public.pet_species ps ON p.species_id = ps.id
  LEFT JOIN public.pet_breed pb ON p.breed_id = pb.id
  LEFT JOIN public.pet_vet pv ON pv.pet_id = p.id
  LEFT JOIN public.vet_practices vp ON pv.vet_practice_id = vp.id
  LEFT JOIN public.pet_insurance pi ON pi.pet_id = p.id
  LEFT JOIN public.insurance_providers ip ON pi.provider_id = ip.id
  LEFT JOIN public.pet_health ph ON ph.pet_id = p.id
  LEFT JOIN public.pet_routine pr ON pr.pet_id = p.id
  LEFT JOIN public.bookings b ON b.pet_id = p.id
  LEFT JOIN public.booking_agreements ba ON ba.booking_id = b.id;

CREATE PROCEDURE public.create_boarding_enrolment(
  IN p_full_name character varying,
  IN p_address text,
  IN p_postcode character varying,
  IN p_phone character varying,
  IN p_email character varying,
  IN p_preferred_contact character varying,
  IN p_emergency_contact_name character varying,
  IN p_emergency_contact_relationship character varying,
  IN p_emergency_contact_phone character varying,
  IN p_emergency_contact_preferred_contact character varying,
  IN p_pet_name character varying,
  IN p_species_name character varying,
  IN p_breed_name character varying,
  IN p_date_of_birth date,
  IN p_sex character varying,
  IN p_neutered boolean,
  IN p_colour character varying,
  IN p_distinguishing_features text,
  IN p_microchip_number character varying,
  IN p_vet_practice_name character varying,
  IN p_vet_phone character varying,
  IN p_emergency_consent boolean,
  IN p_treatment_cost_limit numeric,
  IN p_insurance_provider_name character varying,
  IN p_policy_holder_name character varying,
  IN p_policy_number character varying,
  IN p_emergency_claims_phone character varying,
  IN p_excess_amount numeric,
  IN p_exclusions text,
  IN p_insurance_consent boolean,
  IN p_health_conditions text,
  IN p_medication_required boolean,
  IN p_recent_illness boolean,
  IN p_flea_treatment_date date,
  IN p_worming_treatment_date date,
  IN p_food_provided_by_owner boolean,
  IN p_food_type character varying,
  IN p_feeding_times character varying,
  IN p_portion_size character varying,
  IN p_treats_allowed boolean,
  IN p_exercise_level character varying,
  IN p_arrival_date date,
  IN p_departure_date date,
  IN p_dropoff_time time,
  IN p_collection_time time,
  IN p_grooming boolean,
  IN p_additional_exercise boolean,
  IN p_training_session boolean,
  IN p_owner_instructions text,
  IN p_vaccinated boolean,
  IN p_free_from_illness boolean,
  IN p_vet_treatment_authorized boolean,
  IN p_owner_responsible_costs boolean,
  IN p_info_accurate boolean,
  IN p_agrees_terms boolean,
  IN p_signature character varying,
  IN p_signed_date date,
  IN p_privacy_consent boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_owner_id integer;
  v_pet_id integer;
  v_species_id integer;
  v_breed_id integer;
  v_vet_practice_id integer;
  v_provider_id integer;
  v_booking_id integer;
BEGIN
  INSERT INTO public.owners (full_name, address, postcode, phone, email, preferred_contact)
  VALUES (p_full_name, p_address, p_postcode, p_phone, p_email, p_preferred_contact)
  RETURNING id INTO v_owner_id;

  INSERT INTO public.emergency_contacts (owner_id, name, relationship, phone, preferred_contact)
  VALUES (v_owner_id, p_emergency_contact_name, p_emergency_contact_relationship, p_emergency_contact_phone, p_emergency_contact_preferred_contact);

  SELECT public.get_pet_species(p_species_name) INTO v_species_id;
  SELECT public.get_pet_breed(p_breed_name) INTO v_breed_id;

  INSERT INTO public.pets (
    owner_id, name, species_id, breed_id, date_of_birth, sex, neutered, colour, distinguishing_features, microchip_number
  )
  VALUES (
    v_owner_id, p_pet_name, v_species_id, v_breed_id, p_date_of_birth, p_sex, p_neutered, p_colour, p_distinguishing_features, p_microchip_number
  )
  RETURNING id INTO v_pet_id;

  IF p_vet_practice_name IS NOT NULL THEN
    INSERT INTO public.vet_practices (name, phone)
    VALUES (p_vet_practice_name, p_vet_phone)
    ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone
    RETURNING id INTO v_vet_practice_id;

    INSERT INTO public.pet_vet (pet_id, vet_practice_id, emergency_consent, treatment_cost_limit)
    VALUES (v_pet_id, v_vet_practice_id, p_emergency_consent, p_treatment_cost_limit);
  END IF;

  IF p_insurance_provider_name IS NOT NULL THEN
    SELECT public.get_insurance_provider(p_insurance_provider_name) INTO v_provider_id;

    INSERT INTO public.pet_insurance (
      pet_id, provider_id, policy_holder_name, policy_number, emergency_claims_phone, excess_amount, exclusions, consent
    )
    VALUES (
      v_pet_id, v_provider_id, p_policy_holder_name, p_policy_number, p_emergency_claims_phone, p_excess_amount, p_exclusions, p_insurance_consent
    );
  END IF;

  INSERT INTO public.pet_health (
    pet_id, conditions, medication_required, recent_illness, flea_treatment_date, worming_treatment_date
  )
  VALUES (
    v_pet_id, p_health_conditions, p_medication_required, p_recent_illness, p_flea_treatment_date, p_worming_treatment_date
  );

  INSERT INTO public.pet_routine (
    pet_id, food_provided_by_owner, food_type, feeding_times, portion_size, treats_allowed, exercise_level
  )
  VALUES (
    v_pet_id, p_food_provided_by_owner, p_food_type, p_feeding_times, p_portion_size, p_treats_allowed, p_exercise_level
  );

  INSERT INTO public.bookings (
    pet_id, arrival_date, departure_date, dropoff_time, collection_time, grooming, additional_exercise, training_session, owner_instructions
  )
  VALUES (
    v_pet_id, p_arrival_date, p_departure_date, p_dropoff_time, p_collection_time, p_grooming, p_additional_exercise, p_training_session, p_owner_instructions
  )
  RETURNING id INTO v_booking_id;

  INSERT INTO public.booking_agreements (
    booking_id, vaccinated, free_from_illness, vet_treatment_authorized, owner_responsible_costs, info_accurate, agrees_terms, signature, signed_date, privacy_consent
  )
  VALUES (
    v_booking_id, p_vaccinated, p_free_from_illness, p_vet_treatment_authorized, p_owner_responsible_costs, p_info_accurate, p_agrees_terms, p_signature, p_signed_date, p_privacy_consent
  );
END;
$$;

CREATE PROCEDURE public.delete_boarding_enrolment(IN ids integer[])
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.owners WHERE id = ANY(ids);
END;
$$;

CREATE PROCEDURE public.update_boarding_enrolment(
  IN p_owner_id integer,
  IN p_full_name character varying,
  IN p_address text,
  IN p_postcode character varying,
  IN p_phone character varying,
  IN p_email character varying,
  IN p_preferred_contact character varying,
  IN p_emergency_contact_name character varying,
  IN p_emergency_contact_relationship character varying,
  IN p_emergency_contact_phone character varying,
  IN p_emergency_contact_preferred_contact character varying,
  IN p_pet_name character varying,
  IN p_species_name character varying,
  IN p_breed_name character varying,
  IN p_date_of_birth date,
  IN p_sex character varying,
  IN p_neutered boolean,
  IN p_colour character varying,
  IN p_distinguishing_features text,
  IN p_microchip_number character varying,
  IN p_vet_practice_name character varying,
  IN p_vet_phone character varying,
  IN p_emergency_consent boolean,
  IN p_treatment_cost_limit numeric,
  IN p_insurance_provider_name character varying,
  IN p_policy_holder_name character varying,
  IN p_policy_number character varying,
  IN p_emergency_claims_phone character varying,
  IN p_excess_amount numeric,
  IN p_exclusions text,
  IN p_insurance_consent boolean,
  IN p_health_conditions text,
  IN p_medication_required boolean,
  IN p_recent_illness boolean,
  IN p_flea_treatment_date date,
  IN p_worming_treatment_date date,
  IN p_food_provided_by_owner boolean,
  IN p_food_type character varying,
  IN p_feeding_times character varying,
  IN p_portion_size character varying,
  IN p_treats_allowed boolean,
  IN p_exercise_level character varying,
  IN p_arrival_date date,
  IN p_departure_date date,
  IN p_dropoff_time time,
  IN p_collection_time time,
  IN p_grooming boolean,
  IN p_additional_exercise boolean,
  IN p_training_session boolean,
  IN p_owner_instructions text,
  IN p_vaccinated boolean,
  IN p_free_from_illness boolean,
  IN p_vet_treatment_authorized boolean,
  IN p_owner_responsible_costs boolean,
  IN p_info_accurate boolean,
  IN p_agrees_terms boolean,
  IN p_signature character varying,
  IN p_signed_date date,
  IN p_privacy_consent boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_pet_id integer;
  v_species_id integer;
  v_breed_id integer;
  v_vet_practice_id integer;
  v_provider_id integer;
  v_booking_id integer;
BEGIN
  UPDATE public.owners
  SET full_name = p_full_name,
      address = p_address,
      postcode = p_postcode,
      phone = p_phone,
      email = p_email,
      preferred_contact = p_preferred_contact
  WHERE id = p_owner_id;

  UPDATE public.emergency_contacts
  SET name = p_emergency_contact_name,
      relationship = p_emergency_contact_relationship,
      phone = p_emergency_contact_phone,
      preferred_contact = p_emergency_contact_preferred_contact
  WHERE owner_id = p_owner_id;

  SELECT id INTO v_pet_id
  FROM public.pets
  WHERE owner_id = p_owner_id
  ORDER BY id
  LIMIT 1;

  SELECT public.get_pet_species(p_species_name) INTO v_species_id;
  SELECT public.get_pet_breed(p_breed_name) INTO v_breed_id;

  UPDATE public.pets
  SET name = p_pet_name,
      species_id = v_species_id,
      breed_id = v_breed_id,
      date_of_birth = p_date_of_birth,
      sex = p_sex,
      neutered = p_neutered,
      colour = p_colour,
      distinguishing_features = p_distinguishing_features,
      microchip_number = p_microchip_number
  WHERE id = v_pet_id;

  IF p_vet_practice_name IS NOT NULL THEN
    INSERT INTO public.vet_practices (name, phone)
    VALUES (p_vet_practice_name, p_vet_phone)
    ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone
    RETURNING id INTO v_vet_practice_id;

    INSERT INTO public.pet_vet (pet_id, vet_practice_id, emergency_consent, treatment_cost_limit)
    VALUES (v_pet_id, v_vet_practice_id, p_emergency_consent, p_treatment_cost_limit)
    ON CONFLICT (pet_id) DO UPDATE SET
      vet_practice_id = EXCLUDED.vet_practice_id,
      emergency_consent = EXCLUDED.emergency_consent,
      treatment_cost_limit = EXCLUDED.treatment_cost_limit;
  END IF;

  IF p_insurance_provider_name IS NOT NULL THEN
    SELECT public.get_insurance_provider(p_insurance_provider_name) INTO v_provider_id;

    INSERT INTO public.pet_insurance (
      pet_id, provider_id, policy_holder_name, policy_number, emergency_claims_phone, excess_amount, exclusions, consent
    )
    VALUES (
      v_pet_id, v_provider_id, p_policy_holder_name, p_policy_number, p_emergency_claims_phone, p_excess_amount, p_exclusions, p_insurance_consent
    )
    ON CONFLICT (pet_id) DO UPDATE SET
      provider_id = EXCLUDED.provider_id,
      policy_holder_name = EXCLUDED.policy_holder_name,
      policy_number = EXCLUDED.policy_number,
      emergency_claims_phone = EXCLUDED.emergency_claims_phone,
      excess_amount = EXCLUDED.excess_amount,
      exclusions = EXCLUDED.exclusions,
      consent = EXCLUDED.consent;
  END IF;

  INSERT INTO public.pet_health (
    pet_id, conditions, medication_required, recent_illness, flea_treatment_date, worming_treatment_date
  )
  VALUES (
    v_pet_id, p_health_conditions, p_medication_required, p_recent_illness, p_flea_treatment_date, p_worming_treatment_date
  )
  ON CONFLICT (pet_id) DO UPDATE SET
    conditions = EXCLUDED.conditions,
    medication_required = EXCLUDED.medication_required,
    recent_illness = EXCLUDED.recent_illness,
    flea_treatment_date = EXCLUDED.flea_treatment_date,
    worming_treatment_date = EXCLUDED.worming_treatment_date;

  INSERT INTO public.pet_routine (
    pet_id, food_provided_by_owner, food_type, feeding_times, portion_size, treats_allowed, exercise_level
  )
  VALUES (
    v_pet_id, p_food_provided_by_owner, p_food_type, p_feeding_times, p_portion_size, p_treats_allowed, p_exercise_level
  )
  ON CONFLICT (pet_id) DO UPDATE SET
    food_provided_by_owner = EXCLUDED.food_provided_by_owner,
    food_type = EXCLUDED.food_type,
    feeding_times = EXCLUDED.feeding_times,
    portion_size = EXCLUDED.portion_size,
    treats_allowed = EXCLUDED.treats_allowed,
    exercise_level = EXCLUDED.exercise_level;

  INSERT INTO public.bookings (
    pet_id, arrival_date, departure_date, dropoff_time, collection_time, grooming, additional_exercise, training_session, owner_instructions
  )
  VALUES (
    v_pet_id, p_arrival_date, p_departure_date, p_dropoff_time, p_collection_time, p_grooming, p_additional_exercise, p_training_session, p_owner_instructions
  )
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_booking_id
  FROM public.bookings
  WHERE pet_id = v_pet_id
  ORDER BY id
  LIMIT 1;

  UPDATE public.bookings
  SET arrival_date = p_arrival_date,
      departure_date = p_departure_date,
      dropoff_time = p_dropoff_time,
      collection_time = p_collection_time,
      grooming = p_grooming,
      additional_exercise = p_additional_exercise,
      training_session = p_training_session,
      owner_instructions = p_owner_instructions
  WHERE id = v_booking_id;

  INSERT INTO public.booking_agreements (
    booking_id, vaccinated, free_from_illness, vet_treatment_authorized, owner_responsible_costs, info_accurate, agrees_terms, signature, signed_date, privacy_consent
  )
  VALUES (
    v_booking_id, p_vaccinated, p_free_from_illness, p_vet_treatment_authorized, p_owner_responsible_costs, p_info_accurate, p_agrees_terms, p_signature, p_signed_date, p_privacy_consent
  )
  ON CONFLICT (booking_id) DO UPDATE SET
    vaccinated = EXCLUDED.vaccinated,
    free_from_illness = EXCLUDED.free_from_illness,
    vet_treatment_authorized = EXCLUDED.vet_treatment_authorized,
    owner_responsible_costs = EXCLUDED.owner_responsible_costs,
    info_accurate = EXCLUDED.info_accurate,
    agrees_terms = EXCLUDED.agrees_terms,
    signature = EXCLUDED.signature,
    signed_date = EXCLUDED.signed_date,
    privacy_consent = EXCLUDED.privacy_consent;
END;
$$;

--
-- Seed data
--
INSERT INTO public.pet_species (name)
VALUES ('Dog'), ('Cat')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.insurance_providers (name)
VALUES ('Petplan'), ('ManyPets'), ('Agria'), ('Bought By Many')
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  dog_id integer;
BEGIN
  SELECT public.get_pet_species('Dog') INTO dog_id;

  PERFORM public.get_vaccination_type('Distemper', true, dog_id);
  PERFORM public.get_vaccination_type('Parvovirus', true, dog_id);
  PERFORM public.get_vaccination_type('Hepatitis', true, dog_id);
  PERFORM public.get_vaccination_type('Leptospirosis', true, dog_id);
  PERFORM public.get_vaccination_type('Kennel Cough', false, dog_id);
END;
$$;
