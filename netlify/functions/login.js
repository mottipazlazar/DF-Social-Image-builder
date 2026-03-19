const jwt     = require("jsonwebtoken");
const { sql, initDb } = require("./db");

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers: CORS, body: "Method not allowed" };

  try {
    await initDb();

    const { username, password } = JSON.parse(event.body || "{}");
    if (!username || !password) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing credentials" }) };
    }

    const rows = await sql(
      "SELECT id, username, role FROM df_users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Invalid username or password" }) };
    }

    const user  = rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "fallback-secret-change-me",
      { expiresIn: "7d" }
    );

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ token, username: user.username, role: user.role }),
    };
  } catch (err) {
    console.error("login error:", err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
