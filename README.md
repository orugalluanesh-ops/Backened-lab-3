# Backend Development Labs

Course repository for **Backend Development Fundamentals (BDF)** at **Aurora Deemed to be University**.

## Student Information
- **Student Name:** Orsu Anesh 
- **Registration Number:** 252U1R8067 
- **Class / Section:** B.Tech CSE(QE) – 2B / S-13 204

---

## Lab Directory Index

| Lab | Title | Directory | Live Deployment URL | Status |
|:---:|---|:---:|:---:|:---:|
| **01** | **Node.js and Express Server** | [`lab-01/`](./lab-01/) | [bdf-lab-01-tv0i.onrender.com](https://bdf-lab-01-tv0i.onrender.com) | **Completed & Live** |
| **02** | **SQLite Database and CRUD Routes** | [`lab-02/`](./lab-02/) | [backend-development-fundamentals-1-fzeu.onrender.com](https://backend-development-fundamentals-1-fzeu.onrender.com) | **Completed & Live** |
| **03** | **RESTful Books API with Filtering & Sorting** | [`Lab3/`](./Lab3/) | [bdf-lab-03-dsxp.onrender.com](https://bdf-lab-03-dsxp.onrender.com) | **Completed & Live** |

---

### Lab Summaries

#### Lab 01: Node.js and Express Server
- Plain Node.js HTTP Server (`http-server.js`) listening on port 3000.
- Production Express.js Server (`server.js`) with GET routes (`/`, `/about`, `/time`) and catch-all 404 handler.
- Full documentation and route screenshots in [`lab-01/`](./lab-01/).

#### Lab 02: SQLite Database and CRUD Routes
- Express.js application connected to SQLite database (`database/books.db`).
- Complete RESTful CRUD routing (`GET /books/`, `GET /books/:bookId/`, `POST /books/`, `PUT /books/:bookId/`, `DELETE /books/:bookId/`).
- Database populated with 10 sample books and full verification screenshots in [`lab-02/`](./lab-02/).

#### Lab 03: RESTful Books API with Filtering, Sorting & Pagination
- Express.js and SQLite RESTful API implementing complete CRUD for `/books`.
- Advanced query parameters: partial title search (`search_q`), column sorting (`order_by`, `order`), pagination (`limit`, `offset`), and price range filtering (`min_price`, `max_price`, `BETWEEN`).
- Strict request validation with JSON errors, parameterized queries, and 18 automated test cases in [`Lab3/`](./Lab3/).
