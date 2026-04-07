const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

const db = new sqlite3.Database("./flower.db");

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      total REAL,
      final REAL,
      commission REAL DEFAULT 10
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER,
      day INTEGER,
      kgs REAL,
      price REAL,
      amount REAL
    )
  `);
});

// Save entry
app.post("/entries", (req, res) => {
  const { items, total, final, commission } = req.body;

  const date = new Date().toISOString();

  db.run(
    `INSERT INTO entries (date, total, final, commission) VALUES (?, ?, ?, ?)`,
    [date, total, final, commission || 10],
    function (err) {
      if (err) return res.status(500).send(err);

      const entryId = this.lastID;

      items.forEach((item, index) => {
        const kgs = item.kgs || 0;
        const price = item.price || 0;
        const amount = kgs > 0 && price > 0 ? kgs * price : 0;

        db.run(
          `INSERT INTO items (entry_id, day, kgs, price, amount)
          VALUES (?, ?, ?, ?, ?)`,
          [
            entryId,
            index + 1,
            kgs,
            price,
            amount,
          ]
        );
      });

      res.send({ message: "Saved", entryId });
    }
  );
});

// Get all
app.get("/", (req, res) => {
  res.send("Flower Calculator API is running");
});

app.get("/entries", (req, res) => {
  db.all(`SELECT * FROM entries ORDER BY id DESC`, [], (err, rows) => {
    res.send(rows);
  });
});

// Get details
app.get("/entries/:id", (req, res) => {
  const id = req.params.id;

  db.all(
    `SELECT * FROM items WHERE entry_id = ? ORDER BY day ASC`,
    [id],
    (err, items) => {
      if (err) return res.status(500).send(err);
      res.send(items);
    }
  );
});

// UPDATE entry items (price update)
app.put("/entries/:id", (req, res) => {
  const id = req.params.id;
  const { items, commission } = req.body;

  let total = 0;

  items.forEach((item) => {
    const kgs = item.kgs || 0;
    const price = item.price || 0;
    const amount = kgs > 0 && price > 0 ? kgs * price : 0;

    total += amount;

    db.run(
      `UPDATE items 
       SET kgs = ?, price = ?, amount = ?
       WHERE entry_id = ? AND day = ?`,
      [kgs, price, amount, id, item.day]
    );
  });

  const commissionPercent = commission || 10;
  const commissionValue = total * (commissionPercent / 100);
  const final = Math.round(total - commissionValue);

  db.run(
    `UPDATE entries 
     SET total = ?, final = ?, commission = ?
     WHERE id = ?`,
    [total, final, commissionPercent, id],
    (err) => {
      if (err) return res.status(500).send(err);

      res.send({ message: "Updated successfully" });
    }
  );
});

// Delete
app.delete("/entries/:id", (req, res) => {
  const id = req.params.id;

  db.run(`DELETE FROM entries WHERE id = ?`, [id]);
  db.run(`DELETE FROM items WHERE entry_id = ?`, [id]);

  res.send({ message: "Deleted" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});