const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const db = require('./config');

const app = express();
const host = process.env.API_HOST || '127.0.0.1';
const port = process.env.API_PORT || 3001; // Port for your server to listen on

// Enable CORS for all origins
app.use(cors());

// Configure body parser middleware to parse JSON request bodies
app.use(bodyParser.json());

app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error' });
  }
});

const mapBoardingPayloadToParams = (body) => [
  body.full_name,
  body.address,
  body.postcode,
  body.phone,
  body.email,
  body.preferred_contact,
  body.emergency_contact_name,
  body.emergency_contact_relationship,
  body.emergency_contact_phone,
  body.emergency_contact_preferred_contact,
  body.pet_name,
  body.species,
  body.breed,
  body.date_of_birth || null,
  body.sex,
  Boolean(body.neutered),
  body.colour,
  body.distinguishing_features,
  body.microchip_number,
  body.vet_practice_name,
  body.vet_phone,
  Boolean(body.emergency_vet_consent),
  body.treatment_cost_limit || null,
  body.insurance_provider_name || null,
  body.policy_holder_name || null,
  body.policy_number || null,
  body.emergency_claims_phone || null,
  body.excess_amount || null,
  body.exclusions || null,
  Boolean(body.insurance_consent),
  body.health_conditions || null,
  Boolean(body.medication_required),
  Boolean(body.recent_illness),
  body.flea_treatment_date || null,
  body.worming_treatment_date || null,
  Boolean(body.food_provided_by_owner),
  body.food_type || null,
  body.feeding_times || null,
  body.portion_size || null,
  Boolean(body.treats_allowed),
  body.exercise_preferences || null,
  body.arrival_date || null,
  body.departure_date || null,
  body.dropoff_time || null,
  body.collection_time || null,
  Boolean(body.grooming),
  Boolean(body.additional_exercise),
  Boolean(body.training_session),
  body.owner_instructions || null,
  Boolean(body.vaccinated_agreement),
  Boolean(body.free_from_illness_agreement),
  Boolean(body.vet_treatment_authorized_agreement),
  Boolean(body.owner_responsible_costs_agreement),
  Boolean(body.info_accurate_agreement),
  Boolean(body.agrees_terms),
  body.signature || null,
  body.signed_date || null,
  Boolean(body.privacy_consent),
];

app.get('/api/boarding/owners', async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id,
              full_name,
              address,
              postcode,
              phone,
              email,
              preferred_contact,
              emergency_contact_name,
              emergency_contact_relationship,
              emergency_contact_phone,
              emergency_contact_preferred_contact,
              pet_name,
              species,
              breed,
              date_of_birth,
              sex,
              neutered,
              colour,
              distinguishing_features,
              microchip_number,
              vet_practice_name,
              vet_phone,
              emergency_consent AS emergency_vet_consent,
              treatment_cost_limit,
              insurance_provider_name,
              policy_holder_name,
              policy_number,
              emergency_claims_phone,
              excess_amount,
              exclusions,
              insurance_consent,
              health_conditions,
              medication_required,
              recent_illness,
              flea_treatment_date,
              worming_treatment_date,
              food_provided_by_owner,
              food_type,
              feeding_times,
              portion_size,
              treats_allowed,
              exercise_level AS exercise_preferences,
              arrival_date,
              departure_date,
              dropoff_time,
              collection_time,
              grooming,
              additional_exercise,
              training_session,
              owner_instructions,
              vaccinated_agreement,
              free_from_illness_agreement,
              vet_treatment_authorized_agreement,
              owner_responsible_costs_agreement,
              info_accurate_agreement,
              agrees_terms,
              privacy_consent,
              signature,
              signed_date,
              ARRAY[]::text[] AS vaccinations,
              ARRAY[]::text[] AS aggression_toward,
              false AS separation_anxiety,
              false AS escape_risk,
              ''::text AS triggers,
              ''::text AS pet_photo_name,
              ''::text AS vaccination_next_due_date,
              ''::text AS vaccination_card_file_name,
              ''::text AS medication_name,
              ''::text AS dose,
              ''::text AS administration_time,
              ''::text AS special_instructions,
              'yes'::text AS mix_with_other_dogs
       FROM public.vwboarding_enrolments
       ORDER BY id`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching boarding owners:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/boarding/lookups/species', async (req, res) => {
  const query = (req.query.query ?? '').toString().trim();
  try {
    const { rows } = await db.query(
      'SELECT name FROM public.pet_species WHERE name ILIKE $1 ORDER BY name LIMIT 10',
      [`${query}%`]
    );
    res.json({ suggestions: rows });
  } catch (error) {
    console.error('Error fetching pet species:', error);
    res.status(500).json({ error: 'Pet species lookup failed' });
  }
});

app.get('/api/boarding/lookups/breeds', async (req, res) => {
  const query = (req.query.query ?? '').toString().trim();
  try {
    const { rows } = await db.query(
      'SELECT name FROM public.pet_breed WHERE name ILIKE $1 ORDER BY name LIMIT 10',
      [`${query}%`]
    );
    res.json({ suggestions: rows });
  } catch (error) {
    console.error('Error fetching pet breeds:', error);
    res.status(500).json({ error: 'Pet breed lookup failed' });
  }
});

app.get('/api/boarding/lookups/vets', async (req, res) => {
  const query = (req.query.query ?? '').toString().trim();
  try {
    const { rows } = await db.query(
      'SELECT name FROM public.vet_practices WHERE name ILIKE $1 ORDER BY name LIMIT 10',
      [`${query}%`]
    );
    res.json({ suggestions: rows });
  } catch (error) {
    console.error('Error fetching vet practices:', error);
    res.status(500).json({ error: 'Vet practice lookup failed' });
  }
});

app.get('/api/boarding/lookups/insurance-providers', async (req, res) => {
  const query = (req.query.query ?? '').toString().trim();
  try {
    const { rows } = await db.query(
      'SELECT name FROM public.insurance_providers WHERE name ILIKE $1 ORDER BY name LIMIT 10',
      [`${query}%`]
    );
    res.json({ suggestions: rows });
  } catch (error) {
    console.error('Error fetching insurance providers:', error);
    res.status(500).json({ error: 'Insurance provider lookup failed' });
  }
});

app.post('/api/boarding/owners', async (req, res) => {
  const params = mapBoardingPayloadToParams(req.body);
  const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');

  try {
    await db.query(`CALL public.create_boarding_enrolment(${placeholders})`, params);
    res.sendStatus(201);
  } catch (error) {
    console.error('Error creating boarding enrolment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/boarding/owners/:id', async (req, res) => {
  const params = [Number(req.params.id), ...mapBoardingPayloadToParams(req.body)];
  const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');

  try {
    await db.query(`CALL public.update_boarding_enrolment(${placeholders})`, params);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating boarding enrolment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/boarding/owners', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).send('No IDs provided');
  }

  try {
    await db.query('CALL public.delete_boarding_enrolment($1)', [ids]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting boarding enrolments:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/utils/vehiclemake', async (req, res) => {
  const query = (req.query.query ?? '').toString().trim();

  try {
    if (!query) {
      return res.json({ suggestions: [] });
    }

    const { rows } = await db.query(
      'SELECT name FROM vwvehiclemake WHERE name ILIKE $1 ORDER BY name LIMIT 10',
      [`${query}%`]
    );
    res.json({ suggestions: rows });
  } catch (error) {
    console.error('Error fetching vehicle makes:', error);
    res.status(500).json({ error: 'Vehicle make lookup failed' });
  }
});

app.get('/utils/vehiclemodel', async (req, res) => {
  const query = (req.query.query ?? '').toString().trim();

  try {
    if (!query) {
      return res.json({ suggestions: [] });
    }

    const { rows } = await db.query(
      'SELECT name FROM vwvehiclemodel WHERE name ILIKE $1 ORDER BY name LIMIT 10',
      [`${query}%`]
    );
    res.json({ suggestions: rows });
  } catch (error) {
    console.error('Error fetching vehicle models:', error);
    res.status(500).json({ error: 'Vehicle model lookup failed' });
  }
});

// Routes for CRUD operations
app.get('/api/contacts', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.id,
              c.first_name,
              c.last_name,
              c.telephone,
              c.mobile,
              c.email,
              COALESCE(cu.primarycontact, 'email') AS primary_contact
       FROM vwcontacts c
       LEFT JOIN customer cu ON cu.id = c.id
       ORDER BY c.id`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contact/names', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id,
              TRIM(CONCAT_WS(' ', first_name, last_name)) AS contact
       FROM vwcontacts
       ORDER BY id`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contact/address', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT ca_id AS id,
              contact_id,
              building_name AS "addressLine1",
              road_name AS "addressLine2",
              location_name AS "addressLine3",
              region_name AS "addressLine4",
              postcode,
              occupy_start AS "occupyStart",
              occupy_end AS "occupyEnd"
       FROM vwcontactaddress
       ORDER BY ca_id`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contact/address/:contactId', async (req, res) => {
  const contactId = Number(req.params.contactId);
  try {
    const { rows } = await db.query(
      `SELECT ca_id AS id,
              contact_id,
              building_name AS "addressLine1",
              road_name AS "addressLine2",
              location_name AS "addressLine3",
              region_name AS "addressLine4",
              postcode,
              occupy_start AS "occupyStart",
              occupy_end AS "occupyEnd"
       FROM vwcontactaddress
       WHERE contact_id = $1
       ORDER BY ca_id`,
      [contactId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contact addresses:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vehicles', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT vo_id AS id,
              contact_id,
              make,
              model,
              registered,
              purchased
       FROM vwcontactvehicle
       ORDER BY vo_id`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: error.message });
  }
}); 

// Endpoint to GET vehicles by contact
app.get('/api/vehicles/:contactId', async (req, res) => {
  const contactId = Number(req.params.contactId);
  try {
    const { rows } = await db.query(
      `SELECT vo_id AS id,
              contact_id,
              make,
              model,
              registered,
              purchased
       FROM vwcontactvehicle
       WHERE contact_id = $1
       ORDER BY vo_id`,
      [contactId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contact vehicles:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  const { first_name, last_name, telephone, mobile, email, primary_contact } = req.body;
  const sproc = 'CALL create_contact($1, $2, $3, $4, $5)';
  const client = await db.getClient();

  try {
    await client.query('BEGIN');
    await client.query(sproc, [first_name, last_name, telephone, mobile, email]);
    const idResult = await client.query('SELECT currval(\'contacts_id_seq\') AS id');
    const contactId = idResult.rows[0]?.id;

    await client.query(
      `INSERT INTO customer (id, forename, lastname, tel, mobile, email, primarycontact)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         forename = EXCLUDED.forename,
         lastname = EXCLUDED.lastname,
         tel = EXCLUDED.tel,
         mobile = EXCLUDED.mobile,
         email = EXCLUDED.email,
         primarycontact = EXCLUDED.primarycontact`,
      [contactId, first_name, last_name, telephone, mobile, email, primary_contact || 'email']
    );

    await client.query('COMMIT');
    res.status(201).json({ id: contactId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating contact:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Endpoint to UPDATE a contact
app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, telephone, mobile, email, primary_contact } = req.body;
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE contacts SET first_name = $1, last_name = $2, telephone = $3, mobile = $4, email = $5 WHERE id = $6',
      [first_name, last_name, telephone, mobile, email, id]
    );
    await client.query(
      `INSERT INTO customer (id, forename, lastname, tel, mobile, email, primarycontact)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         forename = EXCLUDED.forename,
         lastname = EXCLUDED.lastname,
         tel = EXCLUDED.tel,
         mobile = EXCLUDED.mobile,
         email = EXCLUDED.email,
         primarycontact = EXCLUDED.primarycontact`,
      [id, first_name, last_name, telephone, mobile, email, primary_contact || 'email']
    );
    await client.query('COMMIT');
    res.sendStatus(200);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating contact:', error);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

// Endpoint to DELETE a contact
app.delete('/api/contacts', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).send('No IDs provided');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM contactaddress WHERE contact_id = ANY($1)', [ids]);
    await client.query('DELETE FROM vehicleowner WHERE contact_id = ANY($1)', [ids]);
    await client.query('DELETE FROM customer WHERE id = ANY($1)', [ids]);
    await client.query('DELETE FROM contacts WHERE id = ANY($1)', [ids]);
    await client.query('COMMIT');
    res.sendStatus(200);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting contacts:', error);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

// Endpoint to CREATE an address
app.post('/api/contact/address', async (req, res) => {
  const { contact_id, addressLine1, addressLine2, addressLine3, addressLine4, postcode, occupyStart, occupyEnd } = req.body;
  const sproc = 'CALL public.create_addressrecord($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
  const countryName = 'United Kingdom';

  try {
    await db.query(sproc, [
      contact_id,
      addressLine1,
      addressLine2,
      addressLine3,
      addressLine4,
      postcode,
      countryName,
      occupyStart,
      occupyEnd,
      null
    ]);
    res.sendStatus(201);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to UPDATE an address
app.put('/api/contact/address/:id', async (req, res) => {
  const { id } = req.params;
  const { contact_id, addressLine1, addressLine2, addressLine3, addressLine4, postcode, occupyStart, occupyEnd } = req.body;
  const sproc = 'CALL public.update_addressrecord($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
  const countryName = 'United Kingdom';

  try {
    await db.query(sproc, [
      contact_id,
      addressLine1,
      addressLine2,
      addressLine3,
      addressLine4,
      postcode,
      countryName,
      occupyStart,
      occupyEnd,
      id
    ]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating address:', error);
    res.sendStatus(500);
  }
});

// Endpoint to DELETE an address
app.delete('/api/contact/address', async (req, res) => {
  const { selectedIds } = req.body;
  if (!Array.isArray(selectedIds)) {
    return res.status(400).send('selectedIds must be an array');
  }

  const sproc = 'CALL public.delete_addressrecord($1)';
  try {
    await db.query(sproc, [selectedIds]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting addresses:', error);
    res.sendStatus(500);
  }
});

// Endpoint to CREATE a vehicle
app.post('/api/vehicles', async (req, res) => {
  const { contact_id, make, model, registered, purchased } = req.body;
  const sproc = 'CALL public.create_vehiclerecord($1, $2, $3, $4, $5, $6)';
  try {
    await db.query(sproc, [contact_id, make, model, registered, purchased, null]);
    res.sendStatus(201);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to UPDATE a vehicle
app.put('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { contact_id, make, model, registered, purchased } = req.body;
  const sproc = 'CALL public.update_vehiclerecord($1, $2, $3, $4, $5, $6)';
  try {
    await db.query(sproc, [contact_id, make, model, registered, purchased, id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.sendStatus(500);
  }
});

// Endpoint to DELETE a vehicle
app.delete('/api/vehicles', async (req, res) => {
  const { selectedIds } = req.body;
  if (!Array.isArray(selectedIds)) {
    return res.status(400).send('selectedIds must be an array');
  }

  const sproc = 'CALL public.delete_vehiclerecord($1)';
  try {
    await db.query(sproc, [selectedIds]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting vehicles:', error);
    res.sendStatus(500);
  }
});

// Start the server
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
