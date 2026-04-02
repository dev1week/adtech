import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { addCorsOrigin, getCorsOrigins, removeCorsOrigin } from "@/lib/settings";

const bodySchema = z.object({
  origin: z.string().min(1),
});

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const origins = await getCorsOrigins();
  return NextResponse.json({ origins });
}

export async function POST(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: "origin is required" }, { status: 400 });
  }

  const origins = await addCorsOrigin(parsed.data.origin);
  return NextResponse.json({ origins });
}

export async function DELETE(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: "origin is required" }, { status: 400 });
  }

  const origins = await removeCorsOrigin(parsed.data.origin);
  return NextResponse.json({ origins });
}
