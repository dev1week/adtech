import { NextRequest, NextResponse } from "next/server";

import { getCorsOrigins } from "@/lib/settings";

const ALLOW_HEADERS = "Content-Type, Authorization";
const ALLOW_METHODS = "POST, GET, PATCH, DELETE, OPTIONS";

export async function withCors(request: NextRequest, response: NextResponse) {
  response.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");


  return response;
}

export async function buildOptionsResponse(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
response.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");


  return response;
}
