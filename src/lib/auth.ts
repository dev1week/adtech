import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getDb } from "@/db/client";
import { adminUsers } from "@/db/schema";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        loginId: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const loginId = credentials?.loginId;
        const password = credentials?.password;

        if (!loginId || !password) {
          return null;
        }

        const db = getDb();
        const user = (
          await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.loginId, loginId))
            .limit(1)
        )[0];

        if (!user) {
          return null;
        }

        const isMatched = await bcrypt.compare(password, user.passwordHash);
        if (!isMatched) {
          return null;
        }

        return { id: user.id, name: user.loginId };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function requireAuth() {
  return getServerSession(authOptions);
}
