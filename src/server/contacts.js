const db = require('./config');

const getContacts = async () => {
    const result = await db.query('SELECT * FROM vwcontactlist');
    return result.rows;
  };

  module.exports = {
    getContacts
  };