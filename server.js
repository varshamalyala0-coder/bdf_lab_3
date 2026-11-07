
const express = require("express");
const app = express();

app.use(express.json());

// Initial sample book data
let books = [
    { id: 1, title: "The Alchemist", author: "Paulo Coelho", price: 299, pages: 208 },
    { id: 2, title: "Wings of Fire", author: "A.P.J. Abdul Kalam", price: 250, pages: 180 },
    { id: 3, title: "Atomic Habits", author: "James Clear", price: 499, pages: 320 },
    { id: 4, title: "The Guide", author: "R.K. Narayan", price: 199, pages: 220 },
    { id: 5, title: "Ikigai", author: "Hector Garcia", price: 350, pages: 208 },
    { id: 6, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: 399, pages: 336 },
    { id: 7, title: "Deep Work", author: "Cal Newport", price: 450, pages: 304 },
    { id: 8, title: "The White Tiger", author: "Aravind Adiga", price: 325, pages: 321 },
    { id: 9, title: "The Psychology of Money", author: "Morgan Housel", price: 280, pages: 256 },
    { id: 10, title: "Zero to One", author: "Peter Thiel", price: 380, pages: 200 }
];

let nextId = 11;

// Validate book details
function validateBook(data, partial = false) {
    const allowedFields = ["title", "author", "price", "pages"];

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "Request body must be a valid JSON object";
    }

    if (Object.keys(data).length === 0) {
        return "Book details cannot be empty";
    }

    for (const key of Object.keys(data)) {
        if (!allowedFields.includes(key)) {
            return `Invalid field: ${key}`;
        }
    }

    if (!partial) {
        for (const field of allowedFields) {
            if (data[field] === undefined || data[field] === null ||
                data[field] === "") {
                return `${field} is required`;
            }
        }
    }

    if ("title" in data &&
        (typeof data.title !== "string" || !data.title.trim())) {
        return "Title must be a non-empty string";
    }

    if ("author" in data &&
        (typeof data.author !== "string" || !data.author.trim())) {
        return "Author must be a non-empty string";
    }

    if ("price" in data &&
        (!Number.isFinite(data.price) || data.price <= 0)) {
        return "Price must be a positive number";
    }

    if ("pages" in data &&
        (!Number.isInteger(data.pages) || data.pages <= 0)) {
        return "Pages must be a positive integer";
    }

    return null;
}

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

// Route 4: Get all books with pagination, search, sort and price filter
app.get("/books", (req, res) => {
    const {
        limit = "10",
        offset = "0",
        search,
        sort,
        order = "asc",
        minPrice,
        maxPrice
    } = req.query;

    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    if (!Number.isInteger(limitNum) || limitNum <= 0 ||
        !Number.isInteger(offsetNum) || offsetNum < 0) {
        return res.status(400).json({
            error: "Limit must be positive and offset must be non-negative integers"
        });
    }

    if (!["asc", "desc"].includes(order)) {
        return res.status(400).json({
            error: "Order must be either asc or desc"
        });
    }

    const allowedSortFields = ["title", "author", "price", "pages"];

    if (sort && !allowedSortFields.includes(sort)) {
        return res.status(400).json({
            error: "Invalid sort field"
        });
    }

    if (minPrice !== undefined &&
        (!Number.isFinite(Number(minPrice)) || Number(minPrice) < 0)) {
        return res.status(400).json({
            error: "Invalid minimum price"
        });
    }

    if (maxPrice !== undefined &&
        (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) < 0)) {
        return res.status(400).json({
            error: "Invalid maximum price"
        });
    }

    if (minPrice !== undefined && maxPrice !== undefined &&
        Number(minPrice) > Number(maxPrice)) {
        return res.status(400).json({
            error: "Minimum price cannot exceed maximum price"
        });
    }

    let result = [...books];

    // Search by title or author
    if (search) {
        const term = search.toLowerCase();

        result = result.filter(book =>
            book.title.toLowerCase().includes(term) ||
            book.author.toLowerCase().includes(term)
        );
    }

    // Filter by price range
    if (minPrice !== undefined) {
        result = result.filter(book => book.price >= Number(minPrice));
    }

    if (maxPrice !== undefined) {
        result = result.filter(book => book.price <= Number(maxPrice));
    }

    // Sort books
    if (sort) {
        result.sort((a, b) => {
            let comparison;

            if (typeof a[sort] === "string") {
                comparison = a[sort].localeCompare(b[sort]);
            } else {
                comparison = a[sort] - b[sort];
            }

            return order === "asc" ? comparison : -comparison;
        });
    }

    const count = result.length;
    const paginatedBooks = result.slice(offsetNum, offsetNum + limitNum);

    res.status(200).json({
        count,
        limit: limitNum,
        offset: offsetNum,
        books: paginatedBooks
    });
});

// Route 5: Get a single book by ID
app.get("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid book ID"
        });
    }

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            error: "Book not found"
        });
    }

    res.status(200).json(book);
});

// Route 6: Create a new book
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

    res.status(201).json({
        message: "Book added",
        bookId: newBook.id
    });
});


// Route 7: Update a book
app.put("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            error: "Book not found"
        });
    }

    Object.assign(book, req.body);

    res.status(200).json({
        message: "Book updated"
    });
});

// Route 8: Delete a book
app.delete("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid book ID"
        });
    }

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1)[0];

    res.status(200).json({
        message: "Book deleted successfully",
        book: deletedBook
    });
});

// Route 9: Unknown paths
app.use((req, res) => {
    res.status(404).json({
        error: "404 - Page not found"
    });
});

// Handle malformed JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            error: "Invalid JSON format"
        });
    }

    res.status(500).json({
        error: "Internal server error"
    });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
