const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = process.env.DATABASE_FILE || path.join(__dirname, 'data.sqlite');

const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS rfps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    budget REAL,
    delivery_deadline TEXT,
    payment_terms TEXT,
    warranty TEXT,
    items_json TEXT,
    raw_input TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rfp_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    price_total REAL,
    currency TEXT,
    delivery_time TEXT,
    payment_terms TEXT,
    warranty TEXT,
    items_json TEXT,
    notes TEXT,
    raw_text TEXT,
    score REAL,
    ai_summary TEXT,
    email_message_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(rfp_id) REFERENCES rfps(id),
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
  )`);
});

module.exports = db;
