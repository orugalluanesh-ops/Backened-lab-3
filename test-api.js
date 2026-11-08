/**
 * Automated Verification Script for Lab 3
 * Tests all 18 Postman test cases against the Express + SQLite API.
 * Supports both direct in-memory invocation (sandbox-safe) and HTTP requests.
 */

const { Readable } = require('stream');
const { EventEmitter } = require('events');
const express = require('express');
const { initializeDatabase } = require('./database');
const booksRouter = require('./routes/books');

// Setup express app
const app = express();
app.use(express.json());
app.use('/books', booksRouter);

/**
 * In-memory request dispatcher for Express.
 * Works seamlessly inside restricted sandboxes without requiring TCP network sockets.
 */
function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const req = new Readable();
        req._read = () => { };

        if (body !== null) {
            const jsonStr = JSON.stringify(body);
            req.push(jsonStr);
            req.headers = {
                'content-type': 'application/json',
                'content-length': Buffer.byteLength(jsonStr)
            };
        } else {
            req.headers = {};
        }
        req.push(null);

        req.method = method.toUpperCase();
        req.url = path;

        const res = new EventEmitter();
        res.statusCode = 200;
        res._headers = {};

        res.status = function (code) {
            this.statusCode = code;
            return this;
        };

        res.setHeader = function (k, v) {
            this._headers[k.toLowerCase()] = v;
        };
        res.getHeader = function (k) {
            return this._headers[k.toLowerCase()];
        };

        res.json = function (data) {
            resolve({
                status: res.statusCode,
                json: async () => data
            });
            return this;
        };

        res.send = function (data) {
            resolve({
                status: res.statusCode,
                json: async () => (typeof data === 'string' ? JSON.parse(data) : data),
                text: async () => String(data)
            });
            return this;
        };

        res.end = function () {
            resolve({
                status: res.statusCode,
                json: async () => ({})
            });
            return this;
        };

        try {
            app(req, res, (err) => {
                if (err) reject(err);
                else {
                    resolve({
                        status: 404,
                        json: async () => ({ message: 'Not Found' })
                    });
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

async function runTests() {
    console.log('=== Starting Lab 3 Automated Test Suite ===\n');

    // Initialize DB
    await initializeDatabase();

    let passedCount = 0;
    let failedCount = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`[PASS] ${name}`);
            passedCount++;
        } catch (err) {
            console.error(`[FAIL] ${name}`);
            console.error(`       Error: ${err.message}`);
            failedCount++;
        }
    }

    // --- SUCCESS TESTS ---
    console.log('--- SUCCESS TESTS ---');

    await test('1. GET all books → 200', async () => {
        const res = await request('GET', '/books');
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Expected non-empty array');
    });

    await test('2. GET existing book → 200', async () => {
        const res = await request('GET', '/books/1');
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        if (data.id !== 1 || !data.title) throw new Error('Invalid book data returned');
    });

    let createdBookId = null;
    await test('3. POST valid book → 201', async () => {
        const newBook = {
            title: 'Clean Code',
            author: 'Robert C. Martin',
            price: 450
        };
        const res = await request('POST', '/books', newBook);
        if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
        const data = await res.json();
        if (!data.id || !data.book) throw new Error('Expected created book ID and details');
        createdBookId = data.id;
    });

    await test('4. PUT existing book → 200', async () => {
        const updatePayload = {
            title: 'Clean Code (Updated Edition)',
            author: 'Robert C. Martin',
            price: 480
        };
        const res = await request('PUT', `/books/${createdBookId}`, updatePayload);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        if (data.book.title !== updatePayload.title) throw new Error('Book title was not updated');
    });

    await test('5. DELETE existing book → 200', async () => {
        const res = await request('DELETE', `/books/${createdBookId}`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        if (data.message !== 'Book deleted successfully') throw new Error('Unexpected delete message');

        // Verify it was deleted
        const verifyRes = await request('GET', `/books/${createdBookId}`);
        if (verifyRes.status !== 404) throw new Error('Deleted book still returned 200');
    });

    await test('6. Search using search_q → 200', async () => {
        const res = await request('GET', '/books?search_q=python');
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Search returned no results');
        for (const b of data) {
            if (!b.title.toLowerCase().includes('python')) {
                throw new Error(`Search result '${b.title}' does not contain 'python'`);
            }
        }
    });

    await test('7. Sort using order_by and order → 200', async () => {
        const res = await request('GET', '/books?order_by=price&order=DESC');
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        if (data.length < 2) throw new Error('Not enough data to verify sorting');
        for (let i = 0; i < data.length - 1; i++) {
            if (data[i].price < data[i + 1].price) {
                throw new Error(`Books not sorted in DESC order: ${data[i].price} < ${data[i + 1].price}`);
            }
        }
    });

    await test('8. Pagination using limit and offset → 200', async () => {
        const res1 = await request('GET', '/books?limit=2&offset=0');
        const res2 = await request('GET', '/books?limit=2&offset=2');
        const page1 = await res1.json();
        const page2 = await res2.json();
        if (page1.length !== 2 || page2.length !== 2) throw new Error('Pagination page sizes incorrect');
        if (page1[0].id === page2[0].id) throw new Error('Page 1 and Page 2 contain same records');
    });

    await test('9. Filter using min_price → 200', async () => {
        const res = await request('GET', '/books?min_price=400');
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        for (const b of data) {
            if (b.price < 400) throw new Error(`Book price ${b.price} is less than min_price 400`);
        }
    });

    await test('10. Filter using max_price → 200', async () => {
        const res = await request('GET', '/books?max_price=350');
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        for (const b of data) {
            if (b.price > 350) throw new Error(`Book price ${b.price} is greater than max_price 350`);
        }
    });

    await test('11. Filter using both min_price and max_price → 200', async () => {
        const res = await request('GET', '/books?min_price=300&max_price=550');
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        for (const b of data) {
            if (b.price < 300 || b.price > 550) {
                throw new Error(`Book price ${b.price} outside range 300-550`);
            }
        }
    });

    // --- FAILURE & VALIDATION TESTS ---
    console.log('\n--- FAILURE & VALIDATION TESTS ---');

    await test('12. POST with missing title → 400', async () => {
        const res = await request('POST', '/books', { author: 'John', price: 300 });
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
        const data = await res.json();
        if (!data.message) throw new Error('Expected JSON message');
    });

    await test('13. POST with missing author → 400', async () => {
        const res = await request('POST', '/books', { title: 'Example Book', price: 300 });
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
        const data = await res.json();
        if (!data.message) throw new Error('Expected JSON message');
    });

    await test('14. POST with missing price → 400', async () => {
        const res = await request('POST', '/books', { title: 'Example Book', author: 'John' });
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
        const data = await res.json();
        if (!data.message) throw new Error('Expected JSON message');
    });

    await test('15. POST with non-numeric price → 400', async () => {
        const res = await request('POST', '/books', { title: 'Example Book', author: 'John', price: 'abc' });
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
        const data = await res.json();
        if (data.message !== 'Price must be numeric') {
            throw new Error(`Expected message 'Price must be numeric', got '${data.message}'`);
        }
    });

    await test('16. GET non-existing ID → 404', async () => {
        const res = await request('GET', '/books/99999');
        if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
        const data = await res.json();
        if (data.message !== 'Book not found') throw new Error(`Expected 'Book not found', got '${data.message}'`);
    });

    await test('17. PUT non-existing ID → 404', async () => {
        const res = await request('PUT', '/books/99999', { title: 'Non-existent', author: 'Ghost', price: 100 });
        if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
        const data = await res.json();
        if (data.message !== 'Book not found') throw new Error(`Expected 'Book not found', got '${data.message}'`);
    });

    await test('18. DELETE non-existing ID → 404', async () => {
        const res = await request('DELETE', '/books/99999');
        if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
        const data = await res.json();
        if (data.message !== 'Book not found') throw new Error(`Expected 'Book not found', got '${data.message}'`);
    });

    console.log(`\n===================================`);
    console.log(`Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
    console.log(`===================================\n`);

    if (failedCount > 0) {
        process.exit(1);
    }
}

runTests().catch((err) => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
});
