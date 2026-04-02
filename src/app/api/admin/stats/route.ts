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
  const rows = await db.select().from(apiCallLogs);

  const total = rows.length;
  const success = rows.filter((row) => row.responseStatus === 200).length;
  const fail = total - success;

  const guidStatuses = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.guidStatus] = (acc[row.guidStatus] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    total,
    success,
    fail,
    successRate: total === 0 ? 0 : Math.round((success / total) * 10000) / 100,
    guidStatuses,
  });
}
