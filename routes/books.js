const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// GET all books with search, sorting, pagination, and price filters
router.get('/', async (req, res, next) => {
    try {
        const db = getDB();
        const {
            search_q,
            order_by = 'id',
            order = 'ASC',
            limit,
            offset = 0,
            min_price,
            max_price
        } = req.query;

        let sql = 'SELECT * FROM books WHERE 1=1';
        const params = [];

        if (search_q) {
            sql += ' AND LOWER(title) LIKE ?';
            params.push(`%${search_q.toLowerCase()}%`);
        }

        if (min_price !== undefined) {
            sql += ' AND price >= ?';
            params.push(Number(min_price));
        }

        if (max_price !== undefined) {
            sql += ' AND price <= ?';
            params.push(Number(max_price));
        }

        const allowedColumns = ['id', 'title', 'author', 'price'];
        const column = allowedColumns.includes(order_by)
            ? order_by
            : 'id';

        const direction = order.toUpperCase() === 'DESC'
            ? 'DESC'
            : 'ASC';

        sql += ` ORDER BY ${column} ${direction}`;

        if (limit !== undefined) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(
                Math.max(0, parseInt(limit, 10) || 0),
                Math.max(0, parseInt(offset, 10) || 0)
            );
        }

        const books = await db.all(sql, params);
        res.status(200).json(books);
    } catch (err) {
        next(err);
    }
});

// GET a book by ID
router.get('/:id', async (req, res, next) => {
    try {
        const db = getDB();
        const id = Number(req.params.id);

        const book = await db.get(
            'SELECT * FROM books WHERE id = ?',
            [id]
        );

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.status(200).json(book);
    } catch (err) {
        next(err);
    }
});

// POST a new book
router.post('/', async (req, res, next) => {
    try {
        const { title, author, price } = req.body;

        if (!title || !author || price === undefined ||
            title.trim() === '' || author.trim() === '') {
            return res.status(400).json({
                message: 'Title, author, and price are required'
            });
        }

        if (typeof price !== 'number' || !Number.isFinite(price)) {
            return res.status(400).json({
                message: 'Price must be numeric'
            });
        }

        const db = getDB();

        const result = await db.run(
            'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
            [title.trim(), author.trim(), price]
        );

        const book = await db.get(
            'SELECT * FROM books WHERE id = ?',
            [result.lastID]
        );

        res.status(201).json({
            id: result.lastID,
            book
        });
    } catch (err) {
        next(err);
    }
});

// PUT update a book
router.put('/:id', async (req, res, next) => {
    try {
        const { title, author, price } = req.body;
        const id = Number(req.params.id);
        const db = getDB();

        const existing = await db.get(
            'SELECT * FROM books WHERE id = ?',
            [id]
        );

        if (!existing) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        if (!title || !author || price === undefined ||
            title.trim() === '' || author.trim() === '') {
            return res.status(400).json({
                message: 'Title, author, and price are required'
            });
        }

        if (typeof price !== 'number' || !Number.isFinite(price)) {
            return res.status(400).json({
                message: 'Price must be numeric'
            });
        }

        await db.run(
            'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?',
            [title.trim(), author.trim(), price, id]
        );

        const book = await db.get(
            'SELECT * FROM books WHERE id = ?',
            [id]
        );

        res.status(200).json({ book });
    } catch (err) {
        next(err);
    }
});

// DELETE a book
router.delete('/:id', async (req, res, next) => {
    try {
        const db = getDB();
        const id = Number(req.params.id);

        const existing = await db.get(
            'SELECT * FROM books WHERE id = ?',
            [id]
        );

        if (!existing) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        await db.run(
            'DELETE FROM books WHERE id = ?',
            [id]
        );

        res.status(200).json({
            message: 'Book deleted successfully'
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
