const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const passport = require("passport");

/*const LocalStrategy = require('passport-local').Strategy;*/

// Sign up route
router.post("/signup", (req, res) => {
  const { username, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      const createUserQuery = `
        INSERT INTO users (username, password, role)
        VALUES ($1, $2, 'user')
        RETURNING id, username, role
      `;

      return pool.query(createUserQuery, [username, hashedPassword]);
    })
    .then((result) => {
      res.status(201).json(result.rows[0]);
    })
    .catch((error) => {
      if (error.code === "23505") {
        // Unique violation error
        return res.status(400).json({ error: "Username already exists!" });
      }
      console.error("Error creating user:", error);
      res
        .status(500)
        .json({ error: "An error occurred while creating the user" });
    });
});

// Login route

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json(req.user);
});

//middleware
// importing the isAdmin function from the middleware.js

const { isAdmin } = require("../middleware");

router.post("/admin", isAdmin, async (req, res) => {
  try {
    const bookingInfo = await pool.query("Select * from bookings");
    res
      .status(200)
      .json({ message: "Welcome, admin!", bookingInfo: bookingInfo.rows });
  } catch (error) {
    console.error("Error getting bookings:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the bookings" });
  }
});

// get all user details
router.get("/", async (req, res) => {
  try {
    const userInfo = await pool.query(
      `SELECT id, username FROM users where role = 'user'`
    );
    res.status(200).json(userInfo.rows);
  } catch (error) {
    console.error("Error getting bookings:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the bookings" });
  }
});

module.exports = router;
