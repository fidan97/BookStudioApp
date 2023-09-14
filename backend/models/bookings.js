const pool = require('../config/db');

// Function to create the bookings table
function createBookingTable() {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS bookings(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    room VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    UNIQUE(room, start_time, end_time)
  )
`;

  return pool.query(createTableQuery);
}

// Execute the function and handle the promise it returns
createBookingTable()
  .then(() => console.log('Booking table created successfully'))
  .catch((error) => console.error('Error creating booking table:', error));
  module.exports = createBookingTable;