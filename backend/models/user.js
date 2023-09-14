const pool = require('../config/db');

// Function to create the users table
function createUserTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL
    )
  `;

  return pool.query(createTableQuery);
}

// Execute the function and handle the promise it returns
createUserTable()
  .then(() => console.log('User table created successfully'))
  .catch((error) => console.error('Error creating user table:', error));
  module.exports = createUserTable;