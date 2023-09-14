const express = require("express");
//Setting up Passport provides the core authentication functionality.
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { setupSession } = require("./middleware");

const userRoutes = require("./routes/users");
const bookingsRoutes = require("./routes/bookings");

//This table has a many-to-many relationship between bookings and users, representing the bookings that have been shared with each user.
const sharedBookingsRoutes = require("./routes/sharedBookings");

const createSharedBookingsTable = require("./models/sharedBookings");
const createUserTable = require("./models/user");
const createBookingTable = require("./models/bookings");

const pool = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Setup middleware
setupSession(app);

app.use(passport.initialize());
app.use(passport.session());

/*Creating the Passport local strategy. 
This strategy requires a verify callback, 
which accepts a username and password, 
and calls done with the user 
if the username and password are valid:*/
passport.use(
  new LocalStrategy(function (username, password, done) {
    pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
      (err, result) => {
        if (err) {
          return done(err);
        }
        if (result.rows.length > 0) {
          const user = result.rows[0];
          if (bcrypt.compareSync(password, user.password)) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect password." });
          }
        } else {
          return done(null, false, { message: "Incorrect username." });
        }
      }
    );
  })
);

//Serializing and deserializing user instances.
/* Passport needs to serialize and 
deserialize user instances to and from the session.*/
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  pool.query("SELECT * FROM users WHERE id = $1", [id], (err, result) => {
    if (err) {
      return done(err);
    }
    done(null, result.rows[0]);
  });
});

// Add Access Control Allow Origin headers
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Methods", "Content-Type", "Authorization");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use("/shared-bookings", sharedBookingsRoutes);
app.use("/users", userRoutes);
app.use("/bookings", bookingsRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

createSharedBookingsTable()
  .then(() => {
    console.log("Shared bookings table created successfully");
    return createUserTable();
  })
  .then(() => {
    console.log("User table created successfully");
    return createBookingTable();
  })
  .then(() => {
    console.log("Booking table created successfully");
    app.listen(port, () => {
      console.log(`Server listening at ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error creating tables:", error);
  });
