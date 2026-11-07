
const express = require("express");
const app = express();

app.use(express.json());

// Store books
let books = [];
let nextId = 1;

// Route 1: Home
app.get("/", (req, res) => {
    res.status(200).send("Welcome to my server!");
});

// Route 2: About
app.get("/about", (req, res) => {
    res.status(200).json({
        name: "Malyala Varsha",
        section: "CSE-GEN-AI 2B 111"
    });
});

// Route 3: Current date and time
app.get("/time", (req, res) => {
    res.status(200).send(new Date().toString());
});

// Route 4: Create a new book
app.post("/books", (req, res) => {
    const { title, author, price, pages } = req.body;

    const newBook = {
        id: nextId++,
        title,
        author,
        price,
        pages
    };

    books.push(newBook);

    res.status(201).json(newBook);
});

// Route 5: Get all books
app.get("/books", (req, res) => {
    res.status(200).json(books);
});

// Route 6: Unknown paths
app.use((req, res) => {
    res.status(404).send("404 - Page not found");
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
