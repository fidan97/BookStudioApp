const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const e = require("express");

// Route:1 Create booking route using: Post "/bookings".
router.post("/", (req, res) => {
  const { userId, room, startTime, endTime } = req.body;

  const createBookingQuery = `
      INSERT INTO bookings (user_id, room, start_time, end_time)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, room, start_time, end_time
    `;

  pool
    .query(createBookingQuery, [userId, room, startTime, endTime])
    .then((result) => {
      res.status(201).json(result.rows[0]);
    })
    .catch((error) => {
      if (error.code === "23505") {
        // Unique violation error

        return res
          .status(400)
          .json({ error: "This room is already booked for the selected time" });
      } else if (error.code === "23503") {
        return res.status(404).json({ error: "userId not found" });
      } else {
        console.error("Error creating booking:", error);
        return res
          .status(500)
          .json({ error: "An error occurred while creating the booking" });
      }
    });
});

/**Below route will accept a user id and
return all bookings for that user.
This code creates a new route at /bookings/:userId 
that listens for GET requests.
It expects the userId as a route parameter.
It then sends a SELECT SQL query to the database to get all bookings
for the provided user id. If the bookings are retrieved successfully,
it returns them in the response.
If there's an error, it logs the error and
returns a 500 status code with an error message.
(GET reQuest in Postman)*/

//Route:2 View bookings route using get "/bookings/:userId".
router.get("/:userId", async (req, res) => {
  // console.log(req.user);
  const { userId } = req.params;
  const getBookingsQuery = `
      SELECT id, room, start_time, end_time 
      FROM bookings 
      WHERE user_id = $1
    `;
  try {
    // first checking if userId exist or not
    const existsUserId = await pool.query(
      `SELECT user_id from bookings Where user_id=${userId}`
    );
    if (!existsUserId.rowCount) {
      return res.status(404).json({ error: "user_id does not exist" });
    }

    const bookingInfo = await pool.query(getBookingsQuery, [userId]);
    res.status(200).json(bookingInfo.rows);
  } catch (error) {
    if (error.code === "42703") {
      //errorMissingColumn
      return res.status(404).json({ error: "No booking found !" });
    }
    console.error("Error getting bookings:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the bookings" });
  }
});

/* This below route will accept a booking id and
  new booking details (room, start time, and end time),
  update the booking in the bookings table,
  and return a success message.
  This code creates a new route at /bookings/:bookingId that
  listens for PUT requests. 
  It expects the bookingId as a route parameter
  and the new booking details in the request body. 
  It then sends an UPDATE SQL query to the database
  to update the booking with the provided id. 
  If the booking is updated successfully, 
  it returns the updated booking's
  id, user id, room, start time, and end time in the response. 
  If there's an error, it logs the error and returns a 500 status code 
  with an error message. (PUT reQuest in POSTMAN)*/

// Route:3  Update existing bookings using: Put "/bookings/:bookingId"

router.put("/:bookingId", (req, res) => {
  const { bookingId } = req.params;
  const { room, startTime, endTime } = req.body;

  const updateBookingQuery = `
      UPDATE bookings 
      SET room = $1, start_time = $2, end_time = $3
      WHERE id = $4
      RETURNING id, user_id, room, start_time, end_time
    `;

  pool
    .query(updateBookingQuery, [room, startTime, endTime, bookingId])
    .then((result) => {
      res.status(200).json(result.rows[0]);
    })
    .catch((error) => {
      console.error("Error updating booking:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the booking" });
    });
});

/*This route for delete bookings
  at /:bookingId that listens for DELETE requests. 
  It expects the bookingId as a route parameter. 
  It then sends a DELETE SQL query to the database 
  to delete the booking with the provided id. 
  If the booking is deleted successfully, 
  it returns a success message in the response. 
  If there's an error, it logs the error and 
  returns a 500 status code with an error message.
  (DELETE reQuest in POSTMAN)*/

// Delete booking route
/*This route will accept a booking id, 
delete the booking from the bookings table, 
and return a success message.*/
router.delete("/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  const deleteBookingQuery = `
      DELETE FROM bookings 
      WHERE id = $1
    `;
  const deleteSharedBookingQuery = `
    DELETE FROM shared_bookings 
    WHERE booking_id = $1
  `;

  try {
    // first delete bookings from shared bookings table then delete form booking table
    const deleteSharedBooking = await pool.query(deleteSharedBookingQuery, [
      bookingId,
    ]);
    if (deleteSharedBooking.rowCount) {
      await pool.query(deleteBookingQuery, [bookingId]);
    } else {
      await pool.query(deleteBookingQuery, [bookingId]);
    }
    res.status(200).json({
      message:
        "Booking deleted successfully and also shared bookings deleted if any",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the booking" });
  }
});

/** Below route for share a bookings with another user this route accept booking id as parms and
 * senderUserId, receiverUserId in req body  */

// Route to share a booking with another user
router.post("/:bookingId/share", async (req, res) => {
  const { bookingId } = req.params;
  const { senderUserId, receiverUserId } = req.body;

  const shareBookingQuery = `
    INSERT INTO shared_bookings (booking_id, sender_user_id, receiver_user_id)
    VALUES ($1, $2, $3)
    RETURNING id, booking_id, sender_user_id, receiver_user_id
  `;
  try {
    const sharedBookingInfo = await pool.query(shareBookingQuery, [
      bookingId,
      senderUserId,
      receiverUserId,
    ]);
    res.status(200).json({
      message: "Booking shared successfully",
      result: sharedBookingInfo.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      // Unique violation error
      res
        .status(400)
        .json({ error: "This booking is already shared with this user!" });
    } else if (error.code === "23503") {
      return res
        .status(404)
        .json({ error: "booking id or user id not found!" });
    } else {
      console.error("Error sharing booking:", error);
      res
        .status(500)
        .json({ error: "An error occurred while sharing the booking" });
    }
  }
});

module.exports = router;
