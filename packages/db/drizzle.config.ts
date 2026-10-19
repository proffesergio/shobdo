import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: "../../.env" });
// Generation is offline; only the migrate command needs DATABASE_URL.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  ...(process.env.DATABASE_URL ? { dbCredentials: { url: process.env.DATABASE_URL } } : {}),
});
