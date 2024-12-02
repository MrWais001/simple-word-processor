const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = 3000;

// Set up SQLite database
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) console.error("Error opening database:", err);
  else console.log("Connected to SQLite database.");
});

// Initialize documents table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT
    )
`);

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Serve the index.html file at the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to retrieve saved document content
app.get("/document", (req, res) => {
  db.get("SELECT content FROM documents WHERE id = 1", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ content: row ? row.content : "" });
  });
});

// Route to save document content
app.post("/document", (req, res) => {
  const content = req.body.content;
  db.run(
    "INSERT OR REPLACE INTO documents (id, content) VALUES (1, ?)",
    content,
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Document saved successfully" });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
