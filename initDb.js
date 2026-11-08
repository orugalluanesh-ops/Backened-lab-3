const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const dbPath = path.resolve(__dirname, 'database/books.db');

async function initializeDatabase() {
    console.log('Connecting to database at:', dbPath);
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS book (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            price INTEGER NOT NULL,
            pages INTEGER NOT NULL
        );
    `);

    // Check count
    const countRow = await db.get('SELECT COUNT(*) AS count FROM book');
    if (countRow.count === 0) {
        console.log('Seeding 10 sample books...');
        const sampleBooks = [
            { title: 'The Alchemist', author: 'Paulo Coelho', price: 350, pages: 208 },
            { title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', price: 299, pages: 180 },
            { title: 'Atomic Habits', author: 'James Clear', price: 499, pages: 320 },
            { title: 'The Hobbit', author: 'J. R. R. Tolkien', price: 399, pages: 310 },
            { title: '1984', author: 'George Orwell', price: 250, pages: 328 },
            { title: 'Pride and Prejudice', author: 'Jane Austen', price: 275, pages: 432 },
            { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 220, pages: 180 },
            { title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 325, pages: 281 },
            { title: 'The Book Thief', author: 'Markus Zusak', price: 450, pages: 584 },
            { title: 'Ikigai', author: 'Héctor García and Francesc Miralles', price: 299, pages: 208 }
        ];

        for (const b of sampleBooks) {
            await db.run(
                'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)',
                [b.title, b.author, b.price, b.pages]
            );
        }
        console.log('10 books seeded successfully.');
    } else {
        console.log(`Database already has ${countRow.count} records.`);
    }

    const books = await db.all('SELECT * FROM book');
    console.log('Current books in DB:', books.length);
    await db.close();
}

initializeDatabase().catch(err => {
    console.error('Database initialization error:', err);
    process.exit(1);
});
