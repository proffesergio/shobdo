import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Explicit initialization keeps builds independent of credentials.
export function createDatabase(databaseUrl: string) {
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  return drizzle(neon(databaseUrl), { schema });
}
