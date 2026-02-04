import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@/types";

// Lazy-load db to avoid Edge Runtime issues
async function getDb() {
  const { db } = await import("./db");
  return db;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      organizationId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    organizationId?: string | null;
  }
}

// JWT types are handled in the callbacks

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Lazy-load db to avoid Edge Runtime issues
          const { db } = await import("./db");
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split("@")[0],
            role: user.role,
            organizationId: user.organizationId || undefined,
          } as any;
        } catch (error) {
          console.error("Auth error:", error);
          // Return null on any error to prevent exposing internal errors
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        // Fetch fresh user data from DB to avoid stale organizationId/role across devices
        try {
          const db = await import("./db").then((m) => m.db);
          const user = await db.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, role: true, organizationId: true, name: true, email: true },
          });
          if (user) {
            session.user.id = user.id;
            session.user.role = user.role as UserRole;
            session.user.organizationId = user.organizationId ?? null;
            session.user.name = user.name ?? session.user.name;
            session.user.email = user.email ?? session.user.email;
            return session;
          }
        } catch (error) {
          console.error("Session refresh error, using token data:", error);
        }
        // Fallback to token data if DB fetch fails
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.organizationId = (token.organizationId as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only-change-in-production",
  trustHost: true, // Allow dynamic host in development
});