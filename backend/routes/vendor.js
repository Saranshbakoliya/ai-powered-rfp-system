

const express = require("express");
const db = require("../db");

const router = express.Router();


router.post("/", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const sql = `
    INSERT INTO vendors (name, email)
    VALUES (?, ?)
  `;

  db.run(sql, [name, email], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add vendor" });
    }

    res.json({
      vendor: {
        id: this.lastID,
        name,
        email,
      },
    });
  });
});


router.get("/", (req, res) => {
  const sql = `
    SELECT id, name, email, created_at
    FROM vendors
    ORDER BY created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to list vendors" });
    }

    res.json({
      vendors: rows,
    });
  });
});

module.exports = router;
