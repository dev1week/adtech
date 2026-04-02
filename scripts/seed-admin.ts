import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDb } from "../src/db/client";
import { adminUsers } from "../src/db/schema";

async function main() {
  const db = getDb();
  const loginId = process.env.ADMIN_ID || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  const hash = await bcrypt.hash(password, 10);

  const existing = (
    await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.loginId, loginId))
      .limit(1)
  )[0];

  if (existing) {
    await db
      .update(adminUsers)
      .set({ passwordHash: hash })
      .where(eq(adminUsers.loginId, loginId));
    // eslint-disable-next-line no-console
    console.log(`Updated admin user: ${loginId}`);
    return;
  }

  await db.insert(adminUsers).values({
    loginId,
    passwordHash: hash,
  });

  // eslint-disable-next-line no-console
  console.log(`Created admin user: ${loginId}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
