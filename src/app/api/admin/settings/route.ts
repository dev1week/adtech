import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { DEFAULT_DELAY_MS, getDelayMs, setDelayMs } from "@/lib/settings";

const bodySchema = z.object({
  delayMs: z.number().int().min(0).max(10000),
});

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const delayMs = await getDelayMs();
  return NextResponse.json({ delayMs });
}

export async function PATCH(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid body. delayMs(0~10000) is required." },
      { status: 400 },
    );
  }

  const delayMs = await setDelayMs(parsed.data.delayMs ?? DEFAULT_DELAY_MS);
  return NextResponse.json({ delayMs });
}
