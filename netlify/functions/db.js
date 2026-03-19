// Direct Turso HTTP API — no @libsql/client dependency needed
const TURSO_URL   = process.env.TURSO_DATABASE_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN   || "";

// Convert libsql:// → https:// for HTTP API
const baseUrl = TURSO_URL.replace(/^libsql:\/\//, "https://");

async function sql(query, args = []) {
  const res = await fetch(`${baseUrl}/v2/pipeline`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TURSO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          type: "execute",
          stmt: {
            sql: query,
            args: args.map(a => {
              if (a === null)             return { type: "null" };
              if (typeof a === "number")  return { type: "integer", value: String(a) };
              return { type: "text", value: String(a) };
            }),
          },
        },
        { type: "close" },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Turso error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const result = data.results?.[0];
  if (result?.type === "error") throw new Error(result.error?.message || "Query error");

  const cols  = result?.response?.result?.cols?.map(c => c.name) || [];
  const rawRows = result?.response?.result?.rows || [];
  return rawRows.map(row =>
    Object.fromEntries(cols.map((col, i) => [col, row[i]?.value ?? null]))
  );
}

async function initDb() {
  await sql(`
    CREATE TABLE IF NOT EXISTS df_users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role     TEXT NOT NULL DEFAULT 'user'
    )
  `);
  const rows = await sql("SELECT COUNT(*) as count FROM df_users");
  if (!rows[0] || Number(rows[0].count) === 0) {
    await sql(
      "INSERT INTO df_users (username, password, role) VALUES (?, ?, ?)",
      ["admin", "dealflow2024", "admin"]
    );
  }
}

module.exports = { sql, initDb };
