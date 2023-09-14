//Creating a new route to handle sharing bookings
/*This route can accept a POST request with 
the id of the booking and the id of the user 
to share with, and add a new row to the "shared bookings" table.*/
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Route to get booking share
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const getsharedQuery = `
      SELECT id, booking_id, sender_user_id, receiver_user_id
      FROM  shared_bookings
      WHERE sender_user_id = $1
    `;
  try {
    // first checking if userId exist or not
    const existsUserId = await pool.query(
      `SELECT sender_user_id from shared_bookings Where sender_user_id=${userId}`
    );
    if (!existsUserId.rowCount) {
      return res.status(404).json({ error: "sender_user_id does not exist" });
    }

    const shareInfo = await pool.query(getsharedQuery, [userId]);
    res.status(200).json(shareInfo.rows);
  } catch (error) {
    console.error("Error getting shared bookings:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the shared bookings" });
  }
});

// Route delete bookings share
router.delete("/:bookingId/:receiverUserId", (req, res) => {
  const { bookingId, receiverUserId } = req.params;

  const deleteSharedBookingQuery = `
      DELETE FROM shared_bookings 
      WHERE (booking_id = $1 And receiver_user_id = $2)
    `;

  pool
    .query(deleteSharedBookingQuery, [bookingId, receiverUserId])
    .then(() => {
      res.status(200).json({ message: "Shared Booking deleted successfully" });
    })
    .catch((error) => {
      console.error("Error deleting booking:", error);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the shared booking" });
    });
});

module.exports = router;
