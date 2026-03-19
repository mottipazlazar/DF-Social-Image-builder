const { createClient } = require("@libsql/client/http");

let _db;

function getDb() {
  if (!_db) {
    // Force HTTP transport for serverless compatibility (libsql:// → https://)
    const rawUrl = process.env.TURSO_DATABASE_URL || "";
    const url = rawUrl.replace(/^libsql:\/\//, "https://");
    _db = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _db;
}

async function initDb() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS df_users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role     TEXT NOT NULL DEFAULT 'user'
    )
  `);
  // Seed default admin if table is empty
  const existing = await db.execute("SELECT COUNT(*) as count FROM df_users");
  if (existing.rows[0].count === 0) {
    await db.execute({
      sql: "INSERT INTO df_users (username, password, role) VALUES (?, ?, ?)",
      args: ["admin", "dealflow2024", "admin"],
    });
  }
}

module.exports = { getDb, initDb };
