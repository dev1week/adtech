import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const guidStatusEnum = pgEnum("guid_status", [
  "MISSING_GUID",
  "DECRYPT_SUCCESS",
  "DECRYPT_FAIL",
]);

export const apiCallLogs = pgTable("api_call_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  apiPath: text("api_path").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  calledAt: timestamp("called_at", { withTimezone: true }).defaultNow().notNull(),
  guidStatus: guidStatusEnum("guid_status").notNull(),
  encryptedGuid: text("encrypted_guid"),
  countryCode: varchar("country_code", { length: 8 }),
  languageCode: varchar("language_code", { length: 8 }),
  responseStatus: integer("response_status").notNull(),
  responseCode: varchar("response_code", { length: 100 }).notNull(),
  delayMs: integer("delay_ms").notNull(),
});

export const systemSettings = pgTable("system_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  loginId: varchar("login_id", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
