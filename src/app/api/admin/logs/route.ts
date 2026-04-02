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
  const logs = await db
    .select()
    .from(apiCallLogs)
    .orderBy(desc(apiCallLogs.calledAt))
    .limit(200);

  return NextResponse.json({ logs });
}
