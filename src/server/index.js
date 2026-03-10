const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const axios = require('axios');
const db = require('./config');

const app = express();
const host = process.env.API_HOST || '127.0.0.1';
const port = process.env.API_PORT || 3001; // Port for your server to listen on
const vehicleMakeServiceBaseUrl = process.env.VEHICLE_MAKE_SERVICE_URL || 'http://127.0.0.1:5055';
const vehicleModelServiceBaseUrl = process.env.VEHICLE_MODEL_SERVICE_URL || 'http://127.0.0.1:5056';

// Enable CORS for all origins
app.use(cors());

// Configure body parser middleware to parse JSON request bodies
app.use(bodyParser.json());


app.get('/utils/vehiclemake', async (req, res) => {
  const query = (req.query.query ?? '').toString().trim().toLowerCase();

  try {
    if (!query) {
      return res.json({ suggestions: [] });
    }

    const response = await axios.get(`${vehicleMakeServiceBaseUrl}/vehiclemake`, {
      params: { query },
      timeout: 5000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching vehicle makes from service:', error.message);
    res.status(502).json({ error: 'Vehicle make service unavailable' });
  }
});

app.get('/utils/vehiclemodel', async (req, res) => {
  const query = (req.query.query ?? '').toString().trim().toLowerCase();

  try {
    if (!query) {
      return res.json({ suggestions: [] });
    }

    const response = await axios.get(`${vehicleModelServiceBaseUrl}/vehiclemodel`, {
      params: { query },
      timeout: 5000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching vehicle models from service:', error.message);
    res.status(502).json({ error: 'Vehicle model service unavailable' });
  }
});

// Routes for CRUD operations
app.get('/api/contacts', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, first_name, last_name, email FROM vwcontacts');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contact/names', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, contact FROM vwcontacts');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vehicles', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM vwVehicleOwner');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: error.message });
  }
}); 

// Endpoint to GET vehicles by contact
app.get('/api/vehicles/:contactId', async (req, res) => {
  const { contactId } = req.params;
  try {
    const { rows } = await db.query(`SELECT make, model, registered, purchased, vo_id AS id, contact_id FROM vwVehicleOwner WHERE contact_id = ${contactId}`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contact vehicles:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  const { first_name, last_name, telephone, mobile, email } = req.body;
  const sproc = 'CALL create_contact($1, $2, $3, $4, $5)';
  try {
    const { rows } = await db.query(
      sproc, [first_name, last_name, telephone, mobile, email]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to UPDATE a contact
app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, telephone, mobile, email } = req.body;
  try {
    await db.query(
      'UPDATE contacts SET first_name = $1, last_name = $2, telephone = $3, mobile = $4, email = $5 WHERE id = $6',
      [first_name, last_name, telephone, mobile, email, id]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.sendStatus(500);
  }
});

// Endpoint to DELETE a contact
app.delete('/api/contacts', async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) {
    return res.status(400).send('No IDs provided');
  }

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  await db.query(`DELETE FROM contacts WHERE id IN (${placeholders})`, ids);
  res.sendStatus(200);
});

// Endpoint to CREATE a vehicle
app.post('/api/vehicles', async (req, res) => {
  const { contact_id, make, model, registered, purchased } = req.body;
  const sproc = `CALL public.create_vehicleRecord($1, $2, $3, $4, $5, $6)`; //'CALL create_vehicle($1, $2, $3, $4, $5)';
  try {
    const { rows } = await db.query(
      sproc, [contact_id, make, model, registered, purchased, null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to UPDATE a vehicle
app.put('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { contact_id, make, model, registered, purchased } = req.body;
  const sproc = `CALL public.update_vehicleRecord($1, $2, $3, $4, $5, $6)`;
  //console.log(`body: ${JSON.stringify(req.body)}`);
  try {
    await db.query(
      sproc,[contact_id, make, model, registered, purchased, id]
    );
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

  //const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  const sproc = `CALL public.delete_vehicleRecord($1)`;
  await db.query(sproc, ids);
  res.sendStatus(200);
});

// Start the server
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
