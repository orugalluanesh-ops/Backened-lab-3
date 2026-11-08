/**
 * BDF Lab 01 - Plain Node.js HTTP Server
 * Student Name: Orsu Anesh
 * Registration Number: 252U1R8067
 * Section: CSE-QE-2B
 * Institution: Aurora Deemed to be University
 */

const http = require('http');

// Create HTTP server instance
const server = http.createServer((req, res) => {
    // Set response header with HTTP 200 OK and text/plain content type
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });

    // Send the response body
    res.end('Hello');
});

// Start server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

