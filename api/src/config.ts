import { z } from "zod";

/**
 * Configuration from environment variables, checked at start-up so a missing or wrong
 * setting stops the service instead of failing later. Secrets (database password, session
 * secret, QR key) come from Secret Manager, mounted as environment variables by Cloud Run;
 * they are never logged.
 */
const schema = z.object({
  APP_ENV: z.enum(["local", "ci", "test", "live"]).default("local"),
  PORT: z.coerce.number().int().positive().default(8080),
  // Either a full DATABASE_URL (local, CI) or the parts (Cloud Run with the Cloud SQL socket).
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().optional(),          // e.g. /cloudsql/PROJECT:REGION:INSTANCE
  DB_NAME: z.string().default("ems"),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),
  SESSION_SECRET: z.string().min(32).optional(),
  QR_KEY: z.string().min(16).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Config = z.infer<typeof schema> & { databaseUrl?: string };

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    // Report which settings are wrong, never their values.
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid configuration: ${fields}`);
  }
  const c = parsed.data;
  if (!c.DATABASE_URL && !(c.DB_HOST && c.DB_USER && c.DB_PASSWORD)) {
    throw new Error("Invalid configuration: set DATABASE_URL, or DB_HOST, DB_USER and DB_PASSWORD");
  }
  if ((c.APP_ENV === "test" || c.APP_ENV === "live") && (!c.SESSION_SECRET || !c.QR_KEY)) {
    throw new Error("Invalid configuration: SESSION_SECRET and QR_KEY are required in test and live");
  }
  return c;
}
