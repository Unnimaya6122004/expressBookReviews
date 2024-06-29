const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Setup session middleware
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Custom authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if session contains token
  const token = req.session.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded; // Attach user information to request object
    next(); // Move to the next middleware
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log("Server is running on port", PORT));
