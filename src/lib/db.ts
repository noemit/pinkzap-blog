import { neon } from "@neondatabase/serverless";

type SearchRecord = {
  query: string;
  source?: string;
  userAgent?: string;
  referrer?: string;
};

let sql: ReturnType<typeof neon> | null = null;
let ensureSchema: Promise<void> | null = null;

function getSql(): ReturnType<typeof neon> | null {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) return null;
    sql = neon(connectionString);
  }
  return sql;
}

function ensureSearchSchema(db: ReturnType<typeof neon>): Promise<void> {
  ensureSchema ??= db`
    CREATE TABLE IF NOT EXISTS search_queries (
      id BIGSERIAL PRIMARY KEY,
      query TEXT NOT NULL,
      source TEXT,
      user_agent TEXT,
      referrer TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `.then(() => undefined);
  return ensureSchema;
}

export async function recordSearchQuery({
  query,
  source,
  userAgent,
  referrer,
}: SearchRecord): Promise<void> {
  const db = getSql();
  if (!db) return;

  try {
    await ensureSearchSchema(db);
    await db`
      INSERT INTO search_queries (query, source, user_agent, referrer)
      VALUES (${query}, ${source ?? null}, ${userAgent ?? null}, ${referrer ?? null})
    `;
  } catch (error) {
    console.error("[track-search] failed to record query:", error);
  }
}
