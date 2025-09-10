const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// check if username already exists
const isValid = (username) => {
  let userWithSameName = users.filter((user) => user.username === username);
  return userWithSameName.length > 0 ? false : true;
};

// check if username and password match
const authenticatedUser = (username, password) => {
  let validUser = users.filter(
    (user) => user.username === username && user.password === password
  );
  return validUser.length > 0;
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username: username },
      "access", // secret key
      { expiresIn: "1h" }
    );

    return res.status(200).json({ message: "Login successful", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.body.username;

  if (!isbn || !review || !username) {
    return res.status(400).json({ message: "ISBN, review, and username are required" });
  }

  if (books[isbn]) {
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review; // each user can add/update their review
    return res.status(200).json({
      message: `Review for book with ISBN ${isbn} added/updated successfully`,
      reviews: books[isbn].reviews,
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
