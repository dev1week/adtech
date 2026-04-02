import { NextRequest, NextResponse } from "next/server";

import { getCorsOrigins } from "@/lib/settings";

const ALLOW_HEADERS = "Content-Type, Authorization";
const ALLOW_METHODS = "POST, GET, PATCH, DELETE, OPTIONS";

export async function withCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");
  const allowedOrigins = await getCorsOrigins();

  response.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  response.headers.set("Vary", "Origin");

  if (!origin) {
    return response;
  }

  const isWildcard = allowedOrigins.includes("*");
  const isAllowedOrigin = allowedOrigins.includes(origin);

  if (isWildcard) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  return response;
}

export async function buildOptionsResponse(request: NextRequest) {
  return withCors(request, new NextResponse(null, { status: 204 }));
}
