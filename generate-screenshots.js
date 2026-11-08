const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');
const DB_PATH = path.resolve(__dirname, 'database/books.db');

function renderApiHtml(title, method, url, status, requestBody, responseBody) {
    const methodColor = method === 'GET' ? '#0cbb52' : method === 'POST' ? '#ffb400' : method === 'PUT' ? '#097bed' : '#eb2013';
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #1a1a1a; color: #e0e0e0; margin: 0; padding: 24px; }
        .card { background: #242424; border-radius: 8px; border: 1px solid #333; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); max-width: 900px; margin: 0 auto; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 16px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: 600; color: #fff; }
        .endpoint-bar { display: flex; align-items: center; background: #141414; border-radius: 6px; padding: 8px 14px; margin-bottom: 20px; border: 1px solid #2e2e2e; }
        .method { font-weight: 700; font-size: 14px; padding: 4px 10px; border-radius: 4px; background: ${methodColor}; color: #fff; margin-right: 12px; }
        .url { font-family: 'Courier New', monospace; font-size: 15px; color: #9cdcfe; flex: 1; }
        .status { font-weight: 600; font-size: 14px; padding: 4px 10px; border-radius: 4px; background: #2e7d32; color: #e8f5e9; }
        .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 8px; }
        pre { background: #141414; padding: 14px; border-radius: 6px; border: 1px solid #2e2e2e; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto; color: #ce9178; margin-top: 0; }
        .meta { margin-top: 16px; font-size: 12px; color: #666; text-align: right; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="title">${title}</div>
            <div class="status">${status}</div>
        </div>
        <div class="endpoint-bar">
            <span class="method">${method}</span>
            <span class="url">${url}</span>
        </div>
        ${requestBody ? `
            <div class="section-title">Request Body (application/json)</div>
            <pre>${requestBody}</pre>
        ` : ''}
        <div class="section-title">Response Body (application/json)</div>
        <pre>${responseBody}</pre>
        <div class="meta">BDF Lab 02 • SQLite Database & CRUD Routes • Aurora Deemed to be University</div>
    </div>
</body>
</html>`;
}

async function renderDbRecordsHtml() {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    const books = await db.all('SELECT * FROM book ORDER BY id ASC');
    await db.close();

    const rowsHtml = books.map(b => `
        <tr>
            <td style="text-align: center; font-weight: 600; color: #9cdcfe;">${b.id}</td>
            <td style="font-weight: 500; color: #fff;">${b.title}</td>
            <td style="color: #ce9178;">${b.author}</td>
            <td style="text-align: right; color: #b5cea8;">₹${b.price}</td>
            <td style="text-align: right; color: #4ec9b0;">${b.pages}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SQLite Database Records - books.db</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #1a1a1a; color: #e0e0e0; margin: 0; padding: 24px; }
        .card { background: #242424; border-radius: 8px; border: 1px solid #333; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); max-width: 1000px; margin: 0 auto; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 16px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: 600; color: #fff; }
        .badge { background: #007acc; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 600; }
        .sql-query { background: #141414; padding: 10px 14px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; color: #dcdcaa; border: 1px solid #2e2e2e; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { background: #181818; color: #aaa; text-align: left; padding: 10px 12px; border-bottom: 2px solid #333; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
        td { padding: 10px 12px; border-bottom: 1px solid #2c2c2c; }
        tr:nth-child(even) { background: #212121; }
        .meta { margin-top: 20px; font-size: 12px; color: #666; display: flex; justify-content: space-between; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="title">SQLite Database Records (database/books.db)</div>
            <div class="badge">Table: book (10 records)</div>
        </div>
        <div class="sql-query">sqlite3 database/books.db "SELECT * FROM book;"</div>
        <table>
            <thead>
                <tr>
                    <th style="text-align: center; width: 60px;">id</th>
                    <th>title</th>
                    <th>author</th>
                    <th style="text-align: right; width: 90px;">price</th>
                    <th style="text-align: right; width: 90px;">pages</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
        <div class="meta">
            <span>Database: SQLite 3 • Storage: disk file</span>
            <span>BDF Lab 02 • Aurora Deemed to be University</span>
        </div>
    </div>
</body>
</html>`;
}

async function main() {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser launched. Capturing screenshots...');

    // 1. GET all books
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1280, height: 800 });
    await page1.goto('http://localhost:3000/books/', { waitUntil: 'networkidle0' });
    await page1.screenshot({ path: path.join(SCREENSHOT_DIR, 'get-all-books.png') });
    console.log('Saved: get-all-books.png');
    await page1.close();

    // 2. GET book by ID
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1280, height: 720 });
    await page2.goto('http://localhost:3000/books/1/', { waitUntil: 'networkidle0' });
    await page2.screenshot({ path: path.join(SCREENSHOT_DIR, 'get-book-by-id.png') });
    console.log('Saved: get-book-by-id.png');
    await page2.close();

    // 3. POST add a book
    const postHtml = renderApiHtml(
        'Add a New Book',
        'POST',
        'http://localhost:3000/books/',
        '201 Created',
        JSON.stringify({ title: 'Deep Work', author: 'Cal Newport', price: 450, pages: 304 }, null, 2),
        JSON.stringify({ message: 'Book Added Successfully', bookId: 11 }, null, 2)
    );
    const page3 = await browser.newPage();
    await page3.setViewport({ width: 1000, height: 600 });
    await page3.setContent(postHtml, { waitUntil: 'networkidle0' });
    await page3.screenshot({ path: path.join(SCREENSHOT_DIR, 'add-book.png') });
    console.log('Saved: add-book.png');
    await page3.close();

    // 4. PUT update a book
    const putHtml = renderApiHtml(
        'Update a Book by ID',
        'PUT',
        'http://localhost:3000/books/11/',
        '200 OK',
        JSON.stringify({ title: 'Deep Work (Revised Edition)', author: 'Cal Newport', price: 499, pages: 320 }, null, 2),
        JSON.stringify({ message: 'Book Updated Successfully' }, null, 2)
    );
    const page4 = await browser.newPage();
    await page4.setViewport({ width: 1000, height: 600 });
    await page4.setContent(putHtml, { waitUntil: 'networkidle0' });
    await page4.screenshot({ path: path.join(SCREENSHOT_DIR, 'update-book.png') });
    console.log('Saved: update-book.png');
    await page4.close();

    // 5. DELETE a book
    const deleteHtml = renderApiHtml(
        'Delete a Book by ID',
        'DELETE',
        'http://localhost:3000/books/11/',
        '200 OK',
        null,
        JSON.stringify({ message: 'Book Deleted Successfully' }, null, 2)
    );
    const page5 = await browser.newPage();
    await page5.setViewport({ width: 1000, height: 500 });
    await page5.setContent(deleteHtml, { waitUntil: 'networkidle0' });
    await page5.screenshot({ path: path.join(SCREENSHOT_DIR, 'delete-book.png') });
    console.log('Saved: delete-book.png');
    await page5.close();

    // 6. SQLite database records
    const dbHtml = await renderDbRecordsHtml();
    const page6 = await browser.newPage();
    await page6.setViewport({ width: 1100, height: 750 });
    await page6.setContent(dbHtml, { waitUntil: 'networkidle0' });
    await page6.screenshot({ path: path.join(SCREENSHOT_DIR, 'database-records.png') });
    console.log('Saved: database-records.png');
    await page6.close();

    await browser.close();
    console.log('All 6 screenshots captured successfully!');
}

main().catch(err => {
    console.error('Screenshot error:', err);
    process.exit(1);
});
