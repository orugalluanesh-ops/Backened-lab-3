/**
 * Backend Development Fundamentals — Lab 3
 * Main Server Entry Point
 *
 * Configures Express application, initializes the SQLite database,
 * mounts the /books REST API routes, and starts the HTTP server.
 */

const express = require('express');
const { initializeDatabase } = require('./database');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: parse incoming JSON request bodies
app.use(express.json());

// Root endpoint: API health check and route discovery
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to Backend Development Fundamentals - Lab 3 Books API',
        endpoints: {
            getAllBooks: 'GET /books',
            getBookById: 'GET /books/:id',
            createBook: 'POST /books',
            updateBook: 'PUT /books/:id',
            deleteBook: 'DELETE /books/:id',
            examples: {
                search: 'GET /books?search_q=python',
                sorting: 'GET /books?order_by=price&order=DESC',
                pagination: 'GET /books?limit=5&offset=0',
                priceRange: 'GET /books?min_price=100&max_price=500'
            }
        }
    });
});

// Mount books router
app.use('/books', booksRouter);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    // Catch JSON parsing errors in request body
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload in request body' });
    }

    console.error('Unhandled Server Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
});

/**
 * Bootstrap function to initialize the database before listening for incoming requests.
 */
async function startServer() {
    try {
        // Ensure database connection and tables are ready
        await initializeDatabase();

        const server = app.listen(PORT, () => {
            console.log(`=======================================================`);
            console.log(`Lab 3 Books API is running at: http://localhost:${PORT}`);
            console.log(`Test endpoint: http://localhost:${PORT}/books`);
            console.log(`=======================================================`);
        });

        // Debugging Requirement (Step 9): Gracefully handle port in use error
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`\n[DEBUGGING TIP] Port ${PORT} is already in use.`);
                console.error(`Please close any existing process running on port ${PORT},`);
                console.error(`or start on a different port:`);
                console.error(`  PowerShell: $env:PORT=3001; npm run dev`);
                console.error(`  Command Prompt: set PORT=3001 && npm run dev\n`);
            } else {
                console.error('Server error:', error.message);
            }
            process.exit(1);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

// Start the application
startServer();

