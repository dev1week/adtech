import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { systemSettings } from "@/db/schema";

const DELAY_KEY = "coupon_api_delay_ms";
const CORS_KEY = "cors_allowed_origins";

export const DEFAULT_DELAY_MS = 2000;
export const MAX_DELAY_MS = 10000;

export async function getDelayMs() {
  const db = getDb();
  const row = (
    await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, DELAY_KEY))
      .limit(1)
  )[0];

  if (!row) {
    return DEFAULT_DELAY_MS;
  }

  const parsed = Number(row.value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_DELAY_MS;
  }

  return Math.max(0, Math.min(MAX_DELAY_MS, parsed));
}

export async function setDelayMs(delayMs: number) {
  const db = getDb();
  const clamped = Math.max(0, Math.min(MAX_DELAY_MS, delayMs));

  await db
    .insert(systemSettings)
    .values({
      key: DELAY_KEY,
      value: String(clamped),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: { value: String(clamped), updatedAt: new Date() },
    });

  return clamped;
}

export async function getCorsOrigins() {
  const db = getDb();
  const row = (
    await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, CORS_KEY))
      .limit(1)
  )[0];

  if (!row) {
    return ["*"];
  }

  try {
    const parsed = JSON.parse(row.value);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      return parsed;
    }
    return ["*"];
  } catch {
    return ["*"];
  }
}

export async function setCorsOrigins(origins: string[]) {
  const db = getDb();
  const normalized = normalizeCorsOrigins(origins);

  await db
    .insert(systemSettings)
    .values({
      key: CORS_KEY,
      value: JSON.stringify(normalized),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: { value: JSON.stringify(normalized), updatedAt: new Date() },
    });

  return normalized;
}

export async function addCorsOrigin(origin: string) {
  const origins = await getCorsOrigins();
  const merged = normalizeCorsOrigins([...origins, origin]);
  await setCorsOrigins(merged);
  return merged;
}

export async function removeCorsOrigin(origin: string) {
  const origins = await getCorsOrigins();
  const filtered = origins.filter((item) => item !== origin);
  const normalized = filtered.length ? normalizeCorsOrigins(filtered) : [];
  await setCorsOrigins(normalized);
  return normalized;
}

function normalizeCorsOrigins(origins: string[]) {
  const cleaned = origins.map((item) => item.trim()).filter(Boolean);
  const unique = Array.from(new Set(cleaned));
  if (unique.includes("*")) {
    return ["*"];
  }
  return unique;
}
