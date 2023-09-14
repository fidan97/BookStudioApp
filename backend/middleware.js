//the session middleware (should be used before initializing Passport and Passport's session management.)
const session = require("express-session");
/*exporting a function from middleware.js that takes an Express app as an argument and sets up the middleware on it. 
I then import this function in server.js and call it with my app. This keeps my server.js file clean and 
allows me to manage all my middleware setup in one place.*/
function setupSession(app) {
  app.use(
    session({
      // This is A SECRET KEY for signing the session ID cookie that is secured in .env
      secret: process.env.SESSION_SECRET,
      //resave:forces the session to be saved back to the session store, even if the session was never modified during the request
      resave: false,
      //saveUninitialized:forces a session that is "uninitialized" to be saved to the store.
      //A session is uninitialized when it is new but not modified.
      saveUninitialized: false,
      //cookie:is an object for the session ID cookie settings
      cookie: {
        sameSite: "none",
        maxAge: 60 * 60 * 1000,
        secure: false,
      },
    })
  ); //have to remember to set this to true if using https
}

// role middleware
/* middleware function to my routes 
that checks the role of the authenticated 
user and only allows certain roles
to access certain routes.
isAdmin function can be added to routes that 
should only be accessible to admin users*/

function isAdmin(req, res, next) {
  const { role } = req.body;
  if (role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "You do not have permission to access this resource" });
  }
}

module.exports = {
  setupSession,
  isAdmin,
};
