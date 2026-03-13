--
-- PostgreSQL database dump
--

-- Dumped from database version 16.13 (Ubuntu 16.13-1.pgdg24.04+1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: create_addressrecord(integer, character varying, character varying, character varying, character varying, character varying, character varying, date, date); Type: PROCEDURE; Schema: public; Owner: admin
--

CREATE PROCEDURE public.create_addressrecord(IN contactid integer, IN buildingname character varying, IN roadname character varying, IN locationname character varying, IN regionname character varying, IN postcode character varying, IN countryname character varying, IN occupystart date, IN occupyend date, OUT value_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    buildingNameId integer;
    roadNameId integer;
    locationNameId integer;
    regionNameId integer;
    countryNameId integer;
    postcodeId integer;
BEGIN
    -- Return the id of each record item
    SELECT getBuildingName(buildingName) INTO buildingNameId;
    SELECT getRoadName(roadName) INTO roadNameId;
    SELECT getLocationName(locationName) INTO locationNameId;
    SELECT getRegionName(regionName) INTO regionNameId;
    SELECT getCountryName(countryName) INTO countryNameId;
    SELECT getPostcode(postcode) INTO postcodeId;


    -- Try to insert the new value
    INSERT INTO contactAddress (contact_id, building_name_id, road_name_id, location_name_id, region_name_id, country_name_id, postcode_id, occupy_start, occupy_end)
    VALUES (contactId, buildingNameId, roadNameId, locationNameId, regionNameId, countryNameId, postcodeId, occupyStart, occupyEnd)
    ON CONFLICT (contact_id, building_name_id, road_name_id, location_name_id, region_name_id, country_name_id, postcode_id, occupy_start, occupy_end) DO NOTHING;

    -- Retrieve the id of the existing or newly inserted value
    SELECT id INTO value_id
    FROM contactAddress
    WHERE contact_id = contactId
    AND building_name_id = buildingNameId
    AND postcode_id = postcodeId
    ORDER BY id ASC LIMIT 1;

    -- The OUT parameter value_id will be returned automatically
END;
$$;


ALTER PROCEDURE public.create_addressrecord(IN contactid integer, IN buildingname character varying, IN roadname character varying, IN locationname character varying, IN regionname character varying, IN postcode character varying, IN countryname character varying, IN occupystart date, IN occupyend date, OUT value_id integer) OWNER TO vac;

--
-- Name: create_contact(character varying, character varying, character varying, character varying, character varying); Type: PROCEDURE; Schema: public; Owner: admin
--

CREATE PROCEDURE public.create_contact(IN first_name character varying, IN last_name character varying, IN telephone character varying, IN mobile character varying, IN email character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO contacts (first_name, last_name, telephone, mobile, email)
  VALUES (first_name, last_name, telephone, mobile, email);
END;
$$;


ALTER PROCEDURE public.create_contact(IN first_name character varying, IN last_name character varying, IN telephone character varying, IN mobile character varying, IN email character varying) OWNER TO vac;

--
-- Name: create_vehicle(integer, character varying, character varying, date, date); Type: PROCEDURE; Schema: public; Owner: admin
--

CREATE PROCEDURE public.create_vehicle(IN contact_id integer, IN make character varying, IN model character varying, IN registered date, IN purchased date)
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO vehicles (contact_id, make, model, registered, purchased)
  VALUES (contact_id, make, model, registered, purchased);
END;
$$;


ALTER PROCEDURE public.create_vehicle(IN contact_id integer, IN make character varying, IN model character varying, IN registered date, IN purchased date) OWNER TO vac;

--
-- Name: create_vehiclerecord(integer, character varying, character varying, date, date); Type: PROCEDURE; Schema: public; Owner: admin
--

CREATE PROCEDURE public.create_vehiclerecord(IN contactid integer, IN make character varying, IN model character varying, IN registereddate date, IN purchaseddate date, OUT value_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    vehicleMakeId integer;
    vehicleModelId integer;
    vehicleDetailId integer;
    vehicleRegisteredId integer;
BEGIN
    -- Assuming getVehicleMake, getVehicleModel, getVehicleDetail, getVehicleRegistered are functions returning integers
    SELECT getVehicleMake(make) INTO vehicleMakeId;
    SELECT getVehicleModel(model) INTO vehicleModelId;
    SELECT getVehicleDetail(vehicleMakeId, vehicleModelId) INTO vehicleDetailId;
    SELECT getVehicleRegistered(vehicleDetailId, registeredDate) INTO vehicleRegisteredId;

    -- Try to insert the new value
    INSERT INTO vehicleowner (contact_id, vehicleregistered_id, purchased)
    VALUES (contactId, vehicleRegisteredId, purchasedDate)
    ON CONFLICT (contact_id, vehicleregistered_id, purchased) DO NOTHING;

    -- Retrieve the id of the existing or newly inserted value
    SELECT id INTO value_id
    FROM vehicleowner
    WHERE contact_id = contactId
	AND vehicleregistered_id = vehicleRegisteredId
    AND purchased = purchasedDate
    ORDER BY id ASC LIMIT 1;

    -- The OUT parameter value_id will be returned automatically
END;
$$;


ALTER PROCEDURE public.create_vehiclerecord(IN contactid integer, IN make character varying, IN model character varying, IN registereddate date, IN purchaseddate date, OUT value_id integer) OWNER TO vac;

--
-- Name: delete_addressrecord(integer[]); Type: PROCEDURE; Schema: public; Owner: admin
--

CREATE PROCEDURE public.delete_addressrecord(IN ids integer[])
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM contactAddress WHERE id = ANY(ids);
END;
$$;


ALTER PROCEDURE public.delete_addressrecord(IN ids integer[]) OWNER TO vac;

--
-- Name: delete_vehiclerecord(integer[]); Type: PROCEDURE; Schema: public; Owner: admin
--

CREATE PROCEDURE public.delete_vehiclerecord(IN ids integer[])
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM vehicleowner WHERE id = ANY(ids);
END;
$$;


ALTER PROCEDURE public.delete_vehiclerecord(IN ids integer[]) OWNER TO vac;

--
-- Name: getbuildingname(character varying); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getbuildingname(value character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    building_name_id integer;
BEGIN
	 -- Try to insert the new value
    INSERT INTO address_building_name (name) VALUES (value)
    ON CONFLICT (name) DO NOTHING;
    -- Query to find the id of the vehicle make
    SELECT id INTO building_name_id
    FROM address_building_name
    WHERE name = value
    LIMIT 1;

    -- Return the found id, or NULL if no match is found
    RETURN building_name_id;
END;
$$;


ALTER FUNCTION public.getbuildingname(value character varying) OWNER TO vac;

--
-- Name: getcountryname(character varying); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getcountryname(value character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    country_name_id integer;
BEGIN
    -- Try to insert the new value
    INSERT INTO address_country_name (name) VALUES (value)
    ON CONFLICT (name) DO NOTHING;
    -- Query to find the id of the vehicle make
    SELECT id INTO country_name_id
    FROM address_country_name
    WHERE name = value
    LIMIT 1;

    -- Return the found id, or NULL if no match is found
    RETURN country_name_id;
END;
$$;


ALTER FUNCTION public.getcountryname(value character varying) OWNER TO vac;

--
-- Name: getlocationname(character varying); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getlocationname(value character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    location_name_id integer;
BEGIN
    -- Try to insert the new value
    INSERT INTO address_location_name (name) VALUES (value)
    ON CONFLICT (name) DO NOTHING;
    -- Query to find the id of the vehicle make
    SELECT id INTO location_name_id
    FROM address_location_name
    WHERE name = value
    LIMIT 1;

    -- Return the found id, or NULL if no match is found
    RETURN location_name_id;
END;
$$;


ALTER FUNCTION public.getlocationname(value character varying) OWNER TO vac;

--
-- Name: getpostcode(character varying); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getpostcode(value character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    postcode_id integer;
BEGIN
    -- Try to insert the new value
    INSERT INTO address_postcode (name) VALUES (value)
    ON CONFLICT (name) DO NOTHING;
    -- Query to find the id of the vehicle make
    SELECT id INTO postcode_id
    FROM address_postcode
    WHERE name = value
    LIMIT 1;

    -- Return the found id, or NULL if no match is found
    RETURN postcode_id;
END;
$$;


ALTER FUNCTION public.getpostcode(value character varying) OWNER TO vac;

--
-- Name: getregionname(character varying); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getregionname(value character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    region_name_id integer;
BEGIN
    -- Try to insert the new value
    INSERT INTO address_region_name (name) VALUES (value)
    ON CONFLICT (name) DO NOTHING;
    -- Query to find the id of the vehicle make
    SELECT id INTO region_name_id
    FROM address_region_name
    WHERE name = value
    LIMIT 1;

    -- Return the found id, or NULL if no match is found
    RETURN region_name_id;
END;
$$;


ALTER FUNCTION public.getregionname(value character varying) OWNER TO vac;

--
-- Name: getroadname(character varying); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getroadname(value character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    road_name_id integer;
BEGIN
    -- Try to insert the new value
    INSERT INTO address_road_name (name) VALUES (value)
    ON CONFLICT (name) DO NOTHING;
    -- Query to find the id of the vehicle make
    SELECT id INTO road_name_id
    FROM address_road_name
    WHERE name = value
    LIMIT 1;

    -- Return the found id, or NULL if no match is found
    RETURN road_name_id;
END;
$$;


ALTER FUNCTION public.getroadname(value character varying) OWNER TO vac;

--
-- Name: getvehicledetail(integer, integer); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getvehicledetail(makeid integer, modelid integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    value_id INTEGER;
BEGIN
    -- Try to insert the new value
    INSERT INTO vehicledetails (make_id, model_id) VALUES (makeId, modelId)
    ON CONFLICT (make_id, model_id) DO NOTHING;
    
    -- Retrieve the id of the existing or newly inserted value
    SELECT id INTO value_id
    FROM vehicledetails
    WHERE make_id = makeId
    AND model_id = modelId;
    
    RETURN value_id;
END;
$$;


ALTER FUNCTION public.getvehicledetail(makeid integer, modelid integer) OWNER TO vac;

--
-- Name: getvehiclemake(character varying); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getvehiclemake(value character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    vehicle_make_id integer;
BEGIN
	 -- Try to insert the new value
    INSERT INTO vehiclemake (name) VALUES (value)
    ON CONFLICT (name) DO NOTHING;
    -- Query to find the id of the vehicle make
    SELECT id INTO vehicle_make_id
    FROM vehiclemake
    WHERE name = value
    LIMIT 1;

    -- Return the found id, or NULL if no match is found
    RETURN vehicle_make_id;
END;
$$;


ALTER FUNCTION public.getvehiclemake(value character varying) OWNER TO vac;

--
-- Name: getvehiclemodel(character varying); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getvehiclemodel(value character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    vehicle_model_id integer;
BEGIN
	 -- Try to insert the new value
    INSERT INTO vehiclemodel (name) VALUES (value)
    ON CONFLICT (name) DO NOTHING;
    -- Query to find the id of the vehicle make
    SELECT id INTO vehicle_model_id
    FROM vehiclemodel
    WHERE name = value
    LIMIT 1;

    -- Return the found id, or NULL if no match is found
    RETURN vehicle_model_id;
END;
$$;


ALTER FUNCTION public.getvehiclemodel(value character varying) OWNER TO vac;

--
-- Name: getvehicleregistered(integer, date); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.getvehicleregistered(vehicledetailid integer, registereddate date) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    value_id INTEGER;
BEGIN
    -- Try to insert the new value
    INSERT INTO vehicleregistered (vehicledetail_id, registered) VALUES (vehicleDetailId, registeredDate)
    ON CONFLICT (vehicleDetail_id, registered) DO NOTHING;
    
    -- Retrieve the id of the existing or newly inserted value
    SELECT id INTO value_id
    FROM vehicleregistered
    WHERE vehicledetail_id = vehicleDetailId
    AND registered = registeredDate
    ORDER BY id ASC LIMIT 1;

    RETURN value_id;
END;
$$;


ALTER FUNCTION public.getvehicleregistered(vehicledetailid integer, registereddate date) OWNER TO vac;

--
-- Name: insert_contact(character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.insert_contact(p_first_name character varying, p_last_name character varying, p_telephone character varying, p_mobile character varying, p_email character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO contacts (first_name, last_name, telephone, mobile, email)
    VALUES (p_first_name, p_last_name, p_telephone, p_mobile, p_email);
END;
$$;


ALTER FUNCTION public.insert_contact(p_first_name character varying, p_last_name character varying, p_telephone character varying, p_mobile character varying, p_email character varying) OWNER TO vac;

--
-- Name: insert_vehicle(integer, character varying, character varying, character varying, date); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.insert_vehicle(contact_id integer, make character varying, model character varying, registration character varying, purchased date) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
   v_id integer;
BEGIN
   -- Inserts the new person record and retrieves the last inserted id
   INSERT INTO vehicles (contact_id, make, model, registration, purchased)
   VALUES (contact_id, make, model, registration, purchased)
   RETURNING id INTO v_id;

   -- Return the new id so we can use it in a select clause or return the new id into the user application
    RETURN v_id;
END;
$$;


ALTER FUNCTION public.insert_vehicle(contact_id integer, make character varying, model character varying, registration character varying, purchased date) OWNER TO vac;

--
-- Name: update_addressrecord(integer, character varying, character varying, character varying, character varying, character varying, character varying, date, date, integer); Type: PROCEDURE; Schema: public; Owner: admin
--

CREATE PROCEDURE public.update_addressrecord(IN contactid integer, IN buildingname character varying, IN roadname character varying, IN locationname character varying, IN regionname character varying, IN postcode character varying, IN countryname character varying, IN occupystart date, IN occupyend date, IN value_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    buildingNameId integer;
    roadNameId integer;
    locationNameId integer;
    regionNameId integer;
    countryNameId integer;
    postcodeId integer;
BEGIN
    -- Return the id of each record item
    SELECT getBuildingName(buildingName) INTO buildingNameId;
    SELECT getRoadName(roadName) INTO roadNameId;
    SELECT getLocationName(locationName) INTO locationNameId;
    SELECT getRegionName(regionName) INTO regionNameId;
    SELECT getCountryName(countryName) INTO countryNameId;
    SELECT getPostcode(postcode) INTO postcodeId;

	-- update master record
    UPDATE contactAddress 
    SET contact_id = contactId, building_name_id = buildingNameId, road_name_id = roadNameId, location_name_id = locationNameId, region_name_id = regionNameId, country_name_id = countryNameId, postcode_id = postcodeId, occupy_start = occupyStart,occupy_end = occupyEnd
	WHERE id = value_id;

END;
$$;


ALTER PROCEDURE public.update_addressrecord(IN contactid integer, IN buildingname character varying, IN roadname character varying, IN locationname character varying, IN regionname character varying, IN postcode character varying, IN countryname character varying, IN occupystart date, IN occupyend date, IN value_id integer) OWNER TO vac;

--
-- Name: update_vehiclerecord(integer, character varying, character varying, date, date, integer); Type: PROCEDURE; Schema: public; Owner: admin
--

CREATE PROCEDURE public.update_vehiclerecord(IN contactid integer, IN make character varying, IN model character varying, IN registereddate date, IN purchaseddate date, IN value_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    vehicleMakeId integer;
    vehicleModelId integer;
    vehicleDetailId integer;
    vehicleRegisteredId integer;
BEGIN
    -- Assuming getVehicleMake, getVehicleModel, getVehicleDetail, getVehicleRegistered are functions returning integers
    SELECT getVehicleMake(make) INTO vehicleMakeId;
    SELECT getVehicleModel(model) INTO vehicleModelId;
    SELECT getVehicleDetail(vehicleMakeId, vehicleModelId) INTO vehicleDetailId;
    SELECT getVehicleRegistered(vehicleDetailId, registereddate) INTO vehicleRegisteredId;

    -- Try to insert the new value
    UPDATE vehicleowner 
    SET contact_id = contactId, vehicleregistered_id = vehicleRegisteredId, purchased = purchaseddate
	WHERE id = value_id;
END;
$$;


ALTER PROCEDURE public.update_vehiclerecord(IN contactid integer, IN make character varying, IN model character varying, IN registereddate date, IN purchaseddate date, IN value_id integer) OWNER TO vac;

--
-- Name: bui_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.bui_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bui_id_seq OWNER TO vac;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: address_building_name; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.address_building_name (
    id integer DEFAULT nextval('public.bui_id_seq'::regclass) NOT NULL,
    name character varying(20)
);


ALTER TABLE public.address_building_name OWNER TO vac;

--
-- Name: cou_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cou_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cou_id_seq OWNER TO vac;

--
-- Name: address_country_name; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.address_country_name (
    id integer DEFAULT nextval('public.cou_id_seq'::regclass) NOT NULL,
    name character varying(20)
);


ALTER TABLE public.address_country_name OWNER TO vac;

--
-- Name: loc_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.loc_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.loc_id_seq OWNER TO vac;

--
-- Name: address_location_name; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.address_location_name (
    id integer DEFAULT nextval('public.loc_id_seq'::regclass) NOT NULL,
    name character varying(20)
);


ALTER TABLE public.address_location_name OWNER TO vac;

--
-- Name: pc_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.pc_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pc_id_seq OWNER TO vac;

--
-- Name: address_postcode; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.address_postcode (
    id integer DEFAULT nextval('public.pc_id_seq'::regclass) NOT NULL,
    name character varying(20)
);


ALTER TABLE public.address_postcode OWNER TO vac;

--
-- Name: reg_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.reg_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reg_id_seq OWNER TO vac;

--
-- Name: address_region_name; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.address_region_name (
    id integer DEFAULT nextval('public.reg_id_seq'::regclass) NOT NULL,
    name character varying(20)
);


ALTER TABLE public.address_region_name OWNER TO vac;

--
-- Name: rd_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.rd_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rd_id_seq OWNER TO vac;

--
-- Name: address_road_name; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.address_road_name (
    id integer DEFAULT nextval('public.rd_id_seq'::regclass) NOT NULL,
    name character varying(20)
);


ALTER TABLE public.address_road_name OWNER TO vac;

--
-- Name: contactaddress; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.contactaddress (
    id integer NOT NULL,
    contact_id integer,
    building_name_id integer,
    road_name_id integer,
    location_name_id integer,
    region_name_id integer,
    country_name_id integer,
    postcode_id integer,
    occupy_start date,
    occupy_end date
);


ALTER TABLE public.contactaddress OWNER TO vac;

--
-- Name: contactaddress_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.contactaddress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contactaddress_id_seq OWNER TO vac;

--
-- Name: contactaddress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.contactaddress_id_seq OWNED BY public.contactaddress.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    telephone character varying(20),
    mobile character varying(20),
    email character varying(255)
);


ALTER TABLE public.contacts OWNER TO vac;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO vac;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: customer; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.customer (
    id integer NOT NULL,
    forename character varying(50) NOT NULL,
    lastname character varying(50) NOT NULL,
    tel character varying(20),
    mobile character varying(20),
    email character varying(100),
    primarycontact character varying(10) NOT NULL
);


ALTER TABLE public.customer OWNER TO vac;

--
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_id_seq OWNER TO vac;

--
-- Name: customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.customer_id_seq OWNED BY public.customer.id;


--
-- Name: vehicledetails; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.vehicledetails (
    id integer NOT NULL,
    make_id integer NOT NULL,
    model_id integer NOT NULL
);


ALTER TABLE public.vehicledetails OWNER TO vac;

--
-- Name: vehicledetails_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.vehicledetails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicledetails_id_seq OWNER TO vac;

--
-- Name: vehicledetails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.vehicledetails_id_seq OWNED BY public.vehicledetails.id;


--
-- Name: vehiclemake; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.vehiclemake (
    id integer NOT NULL,
    name character varying(20)
);


ALTER TABLE public.vehiclemake OWNER TO vac;

--
-- Name: vehiclemake_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.vehiclemake_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiclemake_id_seq OWNER TO vac;

--
-- Name: vehiclemake_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.vehiclemake_id_seq OWNED BY public.vehiclemake.id;


--
-- Name: vehiclemodel; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.vehiclemodel (
    id integer NOT NULL,
    name character varying(20)
);


ALTER TABLE public.vehiclemodel OWNER TO vac;

--
-- Name: vehiclemodel_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.vehiclemodel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiclemodel_id_seq OWNER TO vac;

--
-- Name: vehiclemodel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.vehiclemodel_id_seq OWNED BY public.vehiclemodel.id;


--
-- Name: vehicleowner; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.vehicleowner (
    id integer NOT NULL,
    contact_id integer NOT NULL,
    vehicleregistered_id integer NOT NULL,
    purchased date DEFAULT '1980-01-01'::date NOT NULL
);


ALTER TABLE public.vehicleowner OWNER TO vac;

--
-- Name: vehicleowner_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.vehicleowner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicleowner_id_seq OWNER TO vac;

--
-- Name: vehicleowner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.vehicleowner_id_seq OWNED BY public.vehicleowner.id;


--
-- Name: vehicleregistered; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.vehicleregistered (
    id integer NOT NULL,
    vehicledetail_id integer NOT NULL,
    registered date DEFAULT '1980-01-01'::date NOT NULL
);


ALTER TABLE public.vehicleregistered OWNER TO vac;

--
-- Name: vehicleregistered_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.vehicleregistered_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicleregistered_id_seq OWNER TO vac;

--
-- Name: vehicleregistered_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.vehicleregistered_id_seq OWNED BY public.vehicleregistered.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    contact_id integer DEFAULT 0 NOT NULL,
    make character varying(20),
    model character varying(20),
    registered date DEFAULT '1980-01-01'::date NOT NULL,
    purchased date DEFAULT '1980-01-01'::date NOT NULL
);


ALTER TABLE public.vehicles OWNER TO vac;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO vac;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: vwcontactaddress; Type: VIEW; Schema: public; Owner: admin
--

CREATE VIEW public.vwcontactaddress AS
 SELECT ca.id AS ca_id,
    ca.contact_id,
    contact.first_name,
    contact.last_name,
    ca.building_name_id,
    bu.name AS building_name,
    ca.road_name_id,
    loc.name AS road_name,
    ca.location_name_id,
    loc.name AS location_name,
    ca.region_name_id,
    reg.name AS region_name,
    ca.country_name_id,
    cou.name AS country_name,
    ca.postcode_id,
    pc.name AS postcode,
    ca.occupy_start,
    ca.occupy_end
   FROM (((((((public.contactaddress ca
     JOIN public.contacts contact ON ((ca.contact_id = contact.id)))
     JOIN public.address_building_name bu ON ((ca.building_name_id = bu.id)))
     JOIN public.address_road_name ro ON ((ca.road_name_id = ro.id)))
     JOIN public.address_location_name loc ON ((ca.location_name_id = loc.id)))
     JOIN public.address_region_name reg ON ((ca.region_name_id = reg.id)))
     JOIN public.address_country_name cou ON ((ca.country_name_id = cou.id)))
     JOIN public.address_postcode pc ON ((ca.postcode_id = pc.id)));


ALTER VIEW public.vwcontactaddress OWNER TO vac;

--
-- Name: vwcontacts; Type: VIEW; Schema: public; Owner: admin
--

CREATE VIEW public.vwcontacts AS
 SELECT id,
    first_name,
    last_name,
    telephone,
    mobile,
    email
   FROM public.contacts;


ALTER VIEW public.vwcontacts OWNER TO vac;

--
-- Name: vwcontactvehicle; Type: VIEW; Schema: public; Owner: admin
--

CREATE VIEW public.vwcontactvehicle AS
 SELECT vo.id AS vo_id,
    vo.contact_id,
    contact.first_name,
    contact.last_name,
    vd.id AS vd_id,
    vd.make_id,
    make.name AS make,
    vd.model_id,
    model.name AS model,
    vr.registered,
    vo.purchased
   FROM (((((public.vehicleowner vo
     JOIN public.contacts contact ON ((vo.contact_id = contact.id)))
     JOIN public.vehicleregistered vr ON ((vo.vehicleregistered_id = vr.id)))
     JOIN public.vehicledetails vd ON ((vr.vehicledetail_id = vd.id)))
     JOIN public.vehiclemake make ON ((vd.make_id = make.id)))
     JOIN public.vehiclemodel model ON ((vd.model_id = model.id)));


ALTER VIEW public.vwcontactvehicle OWNER TO vac;

--
-- Name: vwvehiclemake; Type: VIEW; Schema: public; Owner: admin
--

CREATE VIEW public.vwvehiclemake AS
 SELECT id,
    name
   FROM public.vehiclemake;


ALTER VIEW public.vwvehiclemake OWNER TO vac;

--
-- Name: vwvehiclemodel; Type: VIEW; Schema: public; Owner: admin
--

CREATE VIEW public.vwvehiclemodel AS
 SELECT id,
    name
   FROM public.vehiclemodel;


ALTER VIEW public.vwvehiclemodel OWNER TO vac;

--
-- Name: contactaddress id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.contactaddress ALTER COLUMN id SET DEFAULT nextval('public.contactaddress_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: customer id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.customer ALTER COLUMN id SET DEFAULT nextval('public.customer_id_seq'::regclass);


--
-- Name: vehicledetails id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicledetails ALTER COLUMN id SET DEFAULT nextval('public.vehicledetails_id_seq'::regclass);


--
-- Name: vehiclemake id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehiclemake ALTER COLUMN id SET DEFAULT nextval('public.vehiclemake_id_seq'::regclass);


--
-- Name: vehiclemodel id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehiclemodel ALTER COLUMN id SET DEFAULT nextval('public.vehiclemodel_id_seq'::regclass);


--
-- Name: vehicleowner id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicleowner ALTER COLUMN id SET DEFAULT nextval('public.vehicleowner_id_seq'::regclass);


--
-- Name: vehicleregistered id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicleregistered ALTER COLUMN id SET DEFAULT nextval('public.vehicleregistered_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Data for Name: address_building_name; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.address_building_name (id, name) FROM stdin;
9	Building A
10	7
13	26
27	
28	\N
29	h
\.


--
-- Data for Name: address_country_name; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.address_country_name (id, name) FROM stdin;
7	Country Y
8	BANANAMANIA
11	DARLINGTON
12	United Kingdom
24	UK
25	
26	\N
27	o
\.


--
-- Data for Name: address_location_name; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.address_location_name (id, name) FROM stdin;
7	Townsville
8	BANANA TOWN
11	DARLINGTON
24	TOMBRIDGE
25	
26	\N
27	l
\.


--
-- Data for Name: address_postcode; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.address_postcode (id, name) FROM stdin;
7	12345
8	BA1 2NA
11	DL3 8DN
24	OX13 9NY
25	
28	[pkp
29	[pkp[kp[
\.


--
-- Data for Name: address_region_name; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.address_region_name (id, name) FROM stdin;
7	Region X
8	BANANACNTY
11	Durham
24	OXMOUTH
25	
26	\N
27	f
\.


--
-- Data for Name: address_road_name; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.address_road_name (id, name) FROM stdin;
7	Main Street
8	ACACIA AVENUE
15	LONGEYE WAY
24	MINOR ROAD
25	
26	\N
27	d
\.


--
-- Data for Name: contactaddress; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.contactaddress (id, contact_id, building_name_id, road_name_id, location_name_id, region_name_id, country_name_id, postcode_id, occupy_start, occupy_end) FROM stdin;
1	2	10	8	8	8	8	8	2024-07-05	2024-07-05
4	\N	13	8	11	11	12	11	2024-07-16	2024-07-16
5	\N	13	15	11	11	12	11	2024-07-17	2024-07-17
7	\N	10	8	11	11	12	11	2024-07-17	2024-07-17
8	\N	13	15	11	11	12	11	2024-07-17	2024-07-17
9	\N	13	15	11	11	12	11	2024-07-17	2024-07-17
10	\N	13	15	11	11	12	11	2024-07-17	2024-07-17
11	1	10	15	11	11	12	11	2024-07-17	2024-07-17
14	2	13	24	24	24	24	24	2024-07-17	2024-07-17
15	0	27	25	25	25	25	25	2024-07-18	2024-07-18
13	1	\N	\N	\N	\N	\N	11	\N	\N
16	0	29	27	27	27	27	25	\N	\N
17	0	29	27	27	27	27	28	\N	\N
18	0	29	27	27	27	27	29	\N	\N
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.contacts (id, first_name, last_name, telephone, mobile, email) FROM stdin;
3	Scott	Woodgate	\N	\N	scottwoodgate@gmail.com
2	Harry	Jones	\N	\N	harris.jones@aol.com
1	Toni	Marston	\N	\N	tony@domain.com
6	ADAM	MATHER	01562965487	07896107608	adammather@gmail.com
5	David	Michaels	01252 98765543	07658342186	david.michaels@gmail.com
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.customer (id, forename, lastname, tel, mobile, email, primarycontact) FROM stdin;
1	John	Doe	123456789	987654321	john.doe@example.com	email
\.


--
-- Data for Name: vehicledetails; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.vehicledetails (id, make_id, model_id) FROM stdin;
1	2	1
2	2	2
3	2	5
4	2	6
5	4	7
6	4	8
7	4	9
17	48	26
20	22	29
22	53	31
23	54	32
24	12	29
25	10	34
27	9	36
28	11	37
29	60	38
30	61	39
32	6	41
35	60	44
42	61	51
44	4	53
\.


--
-- Data for Name: vehiclemake; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.vehiclemake (id, name) FROM stdin;
1	ALPHA ROMEO
2	AUDI
3	BMW
4	FORD
5	HONDA
6	JAGUAR
7	LAND ROVER
8	MERCEDES-BENZ
9	MG
10	MINI
11	MITSUBISHI
12	NISSAN
13	PEUGEOT
14	PORSCHE
15	SAAB
16	SKODA
17	SUBARU
18	SUZUKI
19	TOYOTA
20	VAUXHALL
21	VOLKSWAGEN
22	VOLVO
28	ERG
33	MAZDA
48	Toyota
53	FERRARI
54	Volkswagen
60	ASTON MARTIN
61	MORRIS
\.


--
-- Data for Name: vehiclemodel; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.vehiclemodel (id, name) FROM stdin;
1	A2
2	A3
3	A4
4	Q2
5	Q3
6	Q4
7	C-MAX
8	FIESTA
9	FOCUS
10	GRAND C-MAX
12	S-MAX
11	SIERRA
26	Corolla
29	SKYLINE
31	ENZO
32	Golf
34	cooper S
36	MIDGET
37	EVO
38	DB7
39	TRAVELLER
41	E-TYPE
44	DB5
51	1000
53	KA+
\.


--
-- Data for Name: vehicleowner; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.vehicleowner (id, contact_id, vehicleregistered_id, purchased) FROM stdin;
15	74	22	2024-04-22
17	73	24	2024-07-04
9	2	27	2024-06-24
14	1	29	2024-05-28
4	2	32	2024-07-14
20	1	36	2024-07-16
21	0	37	2024-08-19
22	3	37	2024-08-19
\.


--
-- Data for Name: vehicleregistered; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.vehicleregistered (id, vehicledetail_id, registered) FROM stdin;
1	1	2024-06-24
2	2	2024-06-24
3	3	2024-06-24
4	4	2024-06-24
5	5	2024-06-24
10	17	2023-01-01
13	20	2024-06-25
14	7	2024-06-25
15	22	2024-06-25
16	23	2024-06-27
17	24	2024-06-23
18	25	2024-03-02
19	25	2024-07-01
20	27	2024-07-01
21	28	2024-06-30
22	29	2024-04-05
23	30	2024-07-03
24	22	2024-07-04
25	32	2024-06-13
26	5	2024-07-05
27	24	2024-06-24
28	35	2024-06-23
29	5	2024-07-08
30	35	2024-06-18
32	35	2024-02-09
35	42	2024-07-16
36	30	2024-07-16
37	44	2024-08-19
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.vehicles (id, contact_id, make, model, registered, purchased) FROM stdin;
3	71	NISSAN	SKYLINE	2024-06-14	2024-06-19
4	0	FORD	SIERRA	2024-06-05	2024-06-21
5	71	VOLVO	XC60	2024-04-18	2024-06-13
7	1	NISSAN	CMAX	2024-06-24	2024-06-24
8	2	FORD	CMAX	2024-06-25	2024-06-25
9	1	FORD	CMAX	2024-06-25	2024-06-25
11	2	VOLVO	XC60	2024-06-25	2024-06-25
15	1	NISSAN	SIERRA	2024-06-25	2024-06-25
10	1	MINI	COOPER S	2024-06-16	2024-06-24
\.


--
-- Name: bui_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.bui_id_seq', 31, true);


--
-- Name: contactaddress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.contactaddress_id_seq', 18, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.contacts_id_seq', 6, true);


--
-- Name: cou_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.cou_id_seq', 29, true);


--
-- Name: customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.customer_id_seq', 1, true);


--
-- Name: loc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.loc_id_seq', 29, true);


--
-- Name: pc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.pc_id_seq', 29, true);


--
-- Name: rd_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.rd_id_seq', 29, true);


--
-- Name: reg_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.reg_id_seq', 29, true);


--
-- Name: vehicledetails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.vehicledetails_id_seq', 45, true);


--
-- Name: vehiclemake_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.vehiclemake_id_seq', 76, true);


--
-- Name: vehiclemodel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.vehiclemodel_id_seq', 54, true);


--
-- Name: vehicleowner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.vehicleowner_id_seq', 22, true);


--
-- Name: vehicleregistered_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.vehicleregistered_id_seq', 38, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 15, true);


--
-- Name: address_building_name bui_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_building_name
    ADD CONSTRAINT bui_pkey PRIMARY KEY (id);


--
-- Name: contactaddress contactaddress_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.contactaddress
    ADD CONSTRAINT contactaddress_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: address_country_name cou_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_country_name
    ADD CONSTRAINT cou_pkey PRIMARY KEY (id);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: address_location_name loc_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_location_name
    ADD CONSTRAINT loc_pkey PRIMARY KEY (id);


--
-- Name: address_postcode pc_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_postcode
    ADD CONSTRAINT pc_pkey PRIMARY KEY (id);


--
-- Name: address_road_name rd_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_road_name
    ADD CONSTRAINT rd_pkey PRIMARY KEY (id);


--
-- Name: address_region_name reg_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_region_name
    ADD CONSTRAINT reg_pkey PRIMARY KEY (id);


--
-- Name: address_building_name unique_bui_name; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_building_name
    ADD CONSTRAINT unique_bui_name UNIQUE (name);


--
-- Name: contactaddress unique_contact_address; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.contactaddress
    ADD CONSTRAINT unique_contact_address UNIQUE (contact_id, building_name_id, road_name_id, location_name_id, region_name_id, country_name_id, postcode_id, occupy_start, occupy_end);


--
-- Name: vehicleowner unique_contact_vehicledetail_purchased; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicleowner
    ADD CONSTRAINT unique_contact_vehicledetail_purchased UNIQUE (contact_id, vehicleregistered_id, purchased);


--
-- Name: address_country_name unique_cou_name; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_country_name
    ADD CONSTRAINT unique_cou_name UNIQUE (name);


--
-- Name: address_location_name unique_loc_name; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_location_name
    ADD CONSTRAINT unique_loc_name UNIQUE (name);


--
-- Name: vehicledetails unique_make_model; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicledetails
    ADD CONSTRAINT unique_make_model UNIQUE (make_id, model_id);


--
-- Name: vehiclemake unique_makename; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehiclemake
    ADD CONSTRAINT unique_makename UNIQUE (name);


--
-- Name: vehiclemodel unique_modelname; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehiclemodel
    ADD CONSTRAINT unique_modelname UNIQUE (name);


--
-- Name: vehiclemake unique_name; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehiclemake
    ADD CONSTRAINT unique_name UNIQUE (name);


--
-- Name: address_postcode unique_pc_name; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_postcode
    ADD CONSTRAINT unique_pc_name UNIQUE (name);


--
-- Name: address_road_name unique_rd_name; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_road_name
    ADD CONSTRAINT unique_rd_name UNIQUE (name);


--
-- Name: address_region_name unique_reg_name; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.address_region_name
    ADD CONSTRAINT unique_reg_name UNIQUE (name);


--
-- Name: vehicleregistered unique_registered_id; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicleregistered
    ADD CONSTRAINT unique_registered_id UNIQUE (id);


--
-- Name: vehicleregistered unique_vehicledetail_registered; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicleregistered
    ADD CONSTRAINT unique_vehicledetail_registered UNIQUE (vehicledetail_id, registered);


--
-- Name: vehicledetails vehicledetails_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicledetails
    ADD CONSTRAINT vehicledetails_pkey PRIMARY KEY (id);


--
-- Name: vehiclemake vehiclemake_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehiclemake
    ADD CONSTRAINT vehiclemake_pkey PRIMARY KEY (id);


--
-- Name: vehiclemodel vehiclemodel_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehiclemodel
    ADD CONSTRAINT vehiclemodel_pkey PRIMARY KEY (id);


--
-- Name: vehicleowner vehicleowner_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicleowner
    ADD CONSTRAINT vehicleowner_pkey PRIMARY KEY (id);


--
-- Name: vehicleregistered vehicleregistered_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicleregistered
    ADD CONSTRAINT vehicleregistered_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vehicledetails vehicledetails_make_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicledetails
    ADD CONSTRAINT vehicledetails_make_id_fkey FOREIGN KEY (make_id) REFERENCES public.vehiclemake(id);


--
-- Name: vehicledetails vehicledetails_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicledetails
    ADD CONSTRAINT vehicledetails_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.vehiclemodel(id);


--
-- Name: vehicleowner vehicleowner_vehicleregistered_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicleowner
    ADD CONSTRAINT vehicleowner_vehicleregistered_id_fkey FOREIGN KEY (vehicleregistered_id) REFERENCES public.vehicleregistered(id);


--
-- Name: vehicleregistered vehicleregistered_vehicledetail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.vehicleregistered
    ADD CONSTRAINT vehicleregistered_vehicledetail_id_fkey FOREIGN KEY (vehicledetail_id) REFERENCES public.vehicledetails(id);


--
-- PostgreSQL database dump complete
--

