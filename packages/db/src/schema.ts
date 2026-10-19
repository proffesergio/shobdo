import { sql } from "drizzle-orm";
import { pgTable, pgEnum, uuid, text, timestamp, integer, jsonb, check, unique, foreignKey } from "drizzle-orm/pg-core";

export const generationStatus = pgEnum("generation_status", ["queued", "running", "completed", "failed"]);
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  authSubject: text("auth_subject").notNull().unique(),
  createdAt: createdAt(),
});

export const scripts = pgTable("scripts", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: createdAt(),
}, (t) => [unique("scripts_id_owner_unique").on(t.id, t.ownerId)]);

export const voiceConsents = pgTable("voice_consents", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  policyVersion: text("policy_version").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (t) => [unique("consents_id_owner_unique").on(t.id, t.ownerId)]);

export const voices = pgTable("voices", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  consentId: uuid("consent_id").notNull(),
  name: text("name").notNull(),
  createdAt: createdAt(),
}, (t) => [
  unique("voices_id_owner_unique").on(t.id, t.ownerId),
  foreignKey({ columns: [t.consentId, t.ownerId], foreignColumns: [voiceConsents.id, voiceConsents.ownerId] }),
]);

export const generations = pgTable("generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scriptId: uuid("script_id").notNull(),
  voiceId: uuid("voice_id"),
  status: generationStatus("status").default("queued").notNull(),
  controls: jsonb("controls").$type<{ speed: number; volume: number; emotion: string }>().notNull(),
  audioObjectKey: text("audio_object_key"),
  durationMs: integer("duration_ms"),
  createdAt: createdAt(),
}, (t) => [
  foreignKey({ columns: [t.scriptId, t.ownerId], foreignColumns: [scripts.id, scripts.ownerId] }),
  foreignKey({ columns: [t.voiceId, t.ownerId], foreignColumns: [voices.id, voices.ownerId] }),
  check("duration_nonnegative", sql`${t.durationMs} is null or ${t.durationMs} >= 0`),
]);
