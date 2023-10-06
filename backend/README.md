# studioBooking

    server.js: This is the entry point of the application. It sets up the Express server, applies middleware, and mounts the routes. The express.json() middleware is used to parse incoming JSON requests, which is necessary for the signup route.

    config/db.js: This file sets up the connection to my PostgreSQL database using the pg library. It exports a Pool object, which is used to query my database.

    models/user.js: This file creates the users table in my database. It defines the structure of the table and executes a CREATE TABLE SQL query.

    routes/users.js: This file defines the routes related to users. Currently, it only contains a signup route that creates a new user in the users table. next step-->login route

    





....
integrated libraries:

    express..
    node..
    pg..
    passport: This is the main Passport library, which provides the core authentication functionality.
    passport-local: This is a Passport strategy for authenticating with a username and password. Passport supports many different authentication strategies, but for your application, you'll just use the local strategy.
    bcrypt: This library allows you to securely hash and check passwords. When you store a user's password, you should never store the plain text password. Instead, you should hash the password and store the hash. Then, when you need to check a password, you can compare the hashed version of the input password with the stored hash.
     config/db.js: This file sets up the connection to my PostgreSQL database using the pg library. It exports a Pool object, which is used to query my database.

    models/user.js: This file creates the users table in my database. It defines the structure of the table and executes a CREATE TABLE SQL query.

    routes/users.js: This file defines the routes related to users. Currently, it only contains a signup route that creates a new user in the users table. next step-->login route

    (same for system for bookings and shared bookings routes and models )




    passwords will be securely hashed*
    role-based accounts*
     authentication sheme*
    offline support*
    live-hosted*
    Html5 responsive*
    Json*
    Database Postgre*
