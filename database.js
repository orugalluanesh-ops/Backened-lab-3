/**
 * Backend Development Fundamentals — Lab 3
 * Database Configuration and Initialization Module
 *
 * This module connects to the SQLite database, ensures the 'books' table exists,
 * and seeds initial sample records if the table is empty.
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Resolve path to the database directory and file
const dbDirectory = path.resolve(__dirname, 'database');
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}
const dbPath = path.join(dbDirectory, 'books.db');

let dbInstance = null;

/**
 * Initializes the SQLite database connection, creates the schema,
 * and seeds initial sample data if the table is empty.
 * @returns {Promise<object>} The connected database instance.
 */
async function initializeDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        // Open the SQLite database connection
        dbInstance = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Step 1: Create the 'books' table if it doesn't already exist
        // Note: Using table name 'books' consistently across the project
        // id: auto-incrementing integer primary key
        // title: text, required
        // author: text, required
        // price: numeric (REAL/INTEGER), required
        await dbInstance.exec(`
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                price REAL NOT NULL
            );
        `);

        // Step 10: Insert sample data only when the database is empty
        const countResult = await dbInstance.get('SELECT COUNT(*) AS count FROM books');
        if (countResult && countResult.count === 0) {
            const sampleBooks = [
                { title: 'Clean Code', author: 'Robert C. Martin', price: 450 },
                { title: 'The Pragmatic Programmer', author: 'Andrew Hunt and David Thomas', price: 550 },
                { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 300 },
                { title: 'Learning Python', author: 'Mark Lutz', price: 600 },
                { title: 'Python Crash Course', author: 'Eric Matthes', price: 400 },
                { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 900 },
                { title: "You Don't Know JS", author: 'Kyle Simpson', price: 250 },
                { title: 'Atomic Habits', author: 'James Clear', price: 350 }
            ];

            // Use parameterized inserts for safe data population
            for (const book of sampleBooks) {
                await dbInstance.run(
                    'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
                    [book.title, book.author, book.price]
                );
            }
            console.log('Database initialized: Seeded initial sample books.');
        }

        return dbInstance;
    } catch (error) {
        console.error('Database initialization error:', error.message);
        throw error;
    }
}

/**
 * Helper to retrieve the active database instance.
 * @returns {object} Active database instance.
 */
function getDB() {
    if (!dbInstance) {
        throw new Error('Database is not initialized yet. Please call initializeDatabase() before accessing the database.');
    }
    return dbInstance;
}

module.exports = {
    initializeDatabase,
    getDB
};

