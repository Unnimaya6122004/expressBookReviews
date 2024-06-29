const express = require('express');
const axios = require('axios'); // Import Axios for making HTTP requests
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // If username does not exist, create a new user
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

// Get all books (using async-await with Axios)
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://your-books-api-endpoint.com/api/books'); // Replace with your actual endpoint
    const allBooks = response.data;

    if (!allBooks || allBooks.length === 0) {
      return res.status(404).json({ message: "No books found" });
    }

    return res.status(200).json(allBooks);
  } catch (err) {
    console.error("Error fetching books:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book details by ISBN (using async-await with Axios)
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://your-books-api-endpoint.com/api/books/${isbn}`); // Replace with your actual endpoint
    const book = response.data;

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (err) {
    console.error(`Error fetching book with ISBN ${isbn}:`, err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get books by author (using async-await with Axios)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get(`http://your-books-api-endpoint.com/api/books?author=${author}`); // Replace with your actual endpoint
    const booksByAuthor = response.data;

    if (!booksByAuthor || booksByAuthor.length === 0) {
      return res.status(404).json({ message: `No books found by author ${author}` });
    }

    return res.status(200).json(booksByAuthor);
  } catch (err) {
    console.error(`Error fetching books by author ${author}:`, err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get books by title (using async-await with Axios)
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get(`http://your-books-api-endpoint.com/api/books?title=${title}`); // Replace with your actual endpoint
    const booksByTitle = response.data;

    if (!booksByTitle || booksByTitle.length === 0) {
      return res.status(404).json({ message: `No books found with title ${title}` });
    }

    return res.status(200).json(booksByTitle);
  } catch (err) {
    console.error(`Error fetching books with title ${title}:`, err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  try {
    let review = books.getBookReviewByISBN(isbn);

    if (!review) {
      return res.status(404).json({ message: `Review not found for book with ISBN ${isbn}` });
    }

    return res.status(200).json({ isbn: isbn, review: review });
  } catch (err) {
    console.error(`Error fetching review for book with ISBN ${isbn}:`, err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports.general = public_users;
