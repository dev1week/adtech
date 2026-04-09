import { constants, privateDecrypt } from "crypto";
import forge from "node-forge";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db/client";
import { apiCallLogs } from "@/db/schema";
import { buildOptionsResponse, withCors } from "@/lib/cors";
import {
  buildFailureResponse,
  buildSuccessResponse,
} from "@/lib/coupon-responses";
import { getDelayMs } from "@/lib/settings";

const requestSchema = z.object({
  guid: z.string().optional(),
  countryCode: z.string().default("KR"),
  languageCode: z.string().default("ko"),
});

type GuidStatus = "MISSING_GUID" | "DECRYPT_SUCCESS" | "DECRYPT_FAIL";
type GuidDecryptResult = {
  guidStatus: GuidStatus;
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function decryptGuid(guid?: string): GuidDecryptResult {
  if (!guid) {
    return { guidStatus: "MISSING_GUID" };
  }

  const privateKey = process.env.RSA_PRIVATE_KEY;
  if (!privateKey) {
    return { guidStatus: "DECRYPT_FAIL" };
  }

  try {
    const restoredPrivateKey = privateKey.replace(/\\n/g, "\n");
    const buffer = Buffer.from(guid, "base64");

    // Support OAEP clients using either SHA-1(default) or SHA-256.
    const oaepHashes: Array<"sha1" | "sha256"> = ["sha1", "sha256"];
    for (const oaepHash of oaepHashes) {
      try {
        privateDecrypt(
          {
            key: restoredPrivateKey,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash,
          },
          buffer,
        );
        return { guidStatus: "DECRYPT_SUCCESS" };
      } catch {
        // try next hash
      }
    }

    try {
      const forgePrivateKey = forge.pki.privateKeyFromPem(restoredPrivateKey);
      const encryptedBytes = forge.util.decode64(guid);
      forgePrivateKey.decrypt(encryptedBytes, "RSAES-PKCS1-V1_5");
      return { guidStatus: "DECRYPT_SUCCESS" };
    } catch {
      return { guidStatus: "DECRYPT_FAIL" };
    }
  } catch {
    return { guidStatus: "DECRYPT_FAIL" };
  }
}

export async function OPTIONS(request: NextRequest) {
  return buildOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  const parsedBody = requestSchema.safeParse(
    await request.json().catch(() => ({})),
  );
  const delayMs = await getDelayMs();

  if (!parsedBody.success) {
    await sleep(delayMs);
    const response = NextResponse.json(
      {
        status: "FAIL",
        code: "INVALID_REQUEST",
        message: "요청 바디 형식이 올바르지 않습니다.",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
    return withCors(request, response);
  }

  const { guid, countryCode, languageCode } = parsedBody.data;
  const decryptResult = decryptGuid(guid);

  const isSuccess = Math.random() < 0.5;
  const picked = isSuccess
    ? buildSuccessResponse()
    : buildFailureResponse(countryCode);

  await sleep(delayMs);

  const db = getDb();
  await db.insert(apiCallLogs).values({
    apiPath: "/sec/xhr/coupon/tvCouponDownload",
    method: "POST",
    guidStatus: decryptResult.guidStatus,
    encryptedGuid: guid ?? null,
    countryCode,
    languageCode,
    responseStatus: picked.statusCode,
    responseCode: picked.body.code,
    delayMs,
  });

  const response = NextResponse.json(picked.body, {
    status: picked.statusCode,
  });
  return withCors(request, response);
}
