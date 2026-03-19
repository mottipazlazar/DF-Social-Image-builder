const jwt = require("jsonwebtoken");
const { sql, initDb } = require("./db");

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

function verifyAdmin(event) {
  const auth = event.headers.authorization || event.headers.Authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET || "fallback-secret-change-me");
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };

  const admin = verifyAdmin(event);
  if (!admin) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };

  try {
    await initDb();

    if (event.httpMethod === "GET") {
      const rows = await sql("SELECT id, username, role FROM df_users ORDER BY id");
      return { statusCode: 200, headers: CORS, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === "POST") {
      const { username, password, role = "user" } = JSON.parse(event.body || "{}");
      if (!username || !password) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "username and password required" }) };
      }
      await sql(
        "INSERT INTO df_users (username, password, role) VALUES (?, ?, ?)",
        [username.trim(), password, role]
      );
      return { statusCode: 201, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === "PUT") {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "id required" }) };
      const { username, password, role } = JSON.parse(event.body || "{}");
      const fields = [];
      const args   = [];
      if (username) { fields.push("username = ?"); args.push(username.trim()); }
      if (password) { fields.push("password = ?"); args.push(password); }
      if (role)     { fields.push("role = ?");     args.push(role); }
      if (!fields.length) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Nothing to update" }) };
      args.push(id);
      await sql(`UPDATE df_users SET ${fields.join(", ")} WHERE id = ?`, args);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === "DELETE") {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "id required" }) };
      const admins = await sql("SELECT COUNT(*) as count FROM df_users WHERE role = 'admin'");
      const target = await sql("SELECT role FROM df_users WHERE id = ?", [id]);
      if (target[0]?.role === "admin" && Number(admins[0]?.count) <= 1) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Cannot delete the last admin" }) };
      }
      await sql("DELETE FROM df_users WHERE id = ?", [id]);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS, body: "Method not allowed" };
  } catch (err) {
    console.error("users error:", err);
    const isDupe = err.message?.includes("UNIQUE");
    return {
      statusCode: isDupe ? 409 : 500,
      headers: CORS,
      body: JSON.stringify({ error: isDupe ? "Username already exists" : err.message }),
    };
  }
};
