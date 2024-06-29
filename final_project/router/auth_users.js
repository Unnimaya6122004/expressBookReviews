const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");

const regd_users = express.Router();
let users = []; // Assuming this is where registered users are stored

// Function to check if a username is valid
const isValid = (username) => {
  // Example validation (can be extended based on actual requirements)
  return users.some(user => user.username === username);
}

// Function to authenticate user
const authenticatedUser = (username, password) => {
  // Example authentication logic (replace with actual implementation)
  return users.some(user => user.username === username && user.password === password);
}

// Login endpoint
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user exists and credentials are correct
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // User authenticated, generate JWT token
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Example token expiration

  // Return the JWT token as response
  return res.status(200).json({ token });
});

// Add or modify a book review endpoint (requires authentication)
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.query;
  const { username } = req; // Username from JWT payload

  try {
    // Example: Check if book exists (not implemented in booksdb.js)
    let book = books.getBookByISBN(isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Example: Check if user already reviewed this book
    if (!book.reviews) {
      book.reviews = {};
    }

    if (book.reviews[username]) {
      // Modify existing review
      book.reviews[username] = review;
    } else {
      // Add new review
      book.reviews[username] = review;
    }

    // Example: Update review in the book object (in booksdb.js)
    books.updateBookReviewByISBN(isbn, book.reviews);

    return res.status(200).json({ message: "Review added or modified successfully" });
  } catch (err) {
    console.error(`Error adding or modifying review for book with ISBN ${isbn}:`, err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete a book review endpoint (requires authentication)
regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const { username } = req; // Username from JWT payload

  try {
    // Example: Check if book exists (not implemented in booksdb.js)
    let book = books.getBookByISBN(isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Example: Check if the user has reviewed this book
    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: `No review found for user ${username} on book with ISBN ${isbn}` });
    }

    // Example: Delete the user's review from the book object (in booksdb.js)
    delete book.reviews[username];

    // Example: Update review in the book object (in booksdb.js)
    books.updateBookReviewByISBN(isbn, book.reviews);

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error(`Error deleting review for book with ISBN ${isbn}:`, err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Middleware function to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.username = decoded.username; // Add username to request object
    next();
  });
}

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
