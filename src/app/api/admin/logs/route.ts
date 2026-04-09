import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { apiCallLogs } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(apiCallLogs)
    .orderBy(desc(apiCallLogs.calledAt))
    .limit(200);

  const logs = rows.map((row) => ({
    id: row.id,
    apiPath: row.apiPath,
    method: row.method,
    calledAt: row.calledAt,
    guidStatus: row.guidStatus,
    encryptedGuid: row.encryptedGuid,
    countryCode: row.countryCode,
    languageCode: row.languageCode,
    responseStatus: row.responseStatus,
    responseCode: row.responseCode,
    delayMs: row.delayMs,
  }));

  return NextResponse.json({ logs });
}
