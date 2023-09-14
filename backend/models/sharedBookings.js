//Creating a "shared bookings" table in my database.
//booking_id and user_id.
//Each row in this table represents a booking being shared with a user.

const pool = require("../config/db");
//In this code, PRIMARY KEY (booking_id, user_id) creates a composite primary key,
//which means that the combination of booking_id and user_id must be unique for each row in the table.
function createSharedBookingsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS shared_bookings(
      id SERIAL ,
      booking_id INTEGER REFERENCES bookings(id),
      sender_user_id INTEGER REFERENCES users(id) NOT NULL,
      receiver_user_id INTEGER REFERENCES users(id) NOT NULL,
      PRIMARY KEY (booking_id, receiver_user_id)
    )
  `;

  return pool.query(createTableQuery);
}

//exports a function that creates a new table shared_bookings in my database if it doesn't already exist
module.exports = createSharedBookingsTable;
