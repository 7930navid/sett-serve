const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   PostgreSQL Connection
   ========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* =========================
   INIT DATABASE (AUTO CREATE TABLE)
   ========================= */
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS themes (
        id SERIAL PRIMARY KEY,
        img TEXT NOT NULL
      )
    `);
    console.log("✅ Database initialized (themes table ready)");
  } catch (err) {
    console.error("❌ DB Init Error:", err);
  }
};

/* =========================
   TEST ROUTE
   ========================= */
app.get("/", (req, res) => {
  res.send("🌿 AsirNet Theme Server Running");
});

/* =========================
   ADD IMAGE LINK
   ========================= */
app.post("/add-image", async (req, res) => {
  const { img } = req.body;

  if (!img) {
    return res.status(400).json({ error: "Image link required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO themes (img) VALUES ($1) RETURNING *",
      [img]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =========================
   FETCH ALL IMAGES
   ========================= */
app.get("/themes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, img FROM themes ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =========================
   SERVER START
   ========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initDB(); // 🔥 AUTO INIT DB
});
