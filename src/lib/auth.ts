import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { verify } from "otplib";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "TOTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;

        const passwordValid = await compare(password, user.passwordHash);
        if (!passwordValid) return null;

        // If TOTP is enabled, verify the code
        if (user.totpEnabled) {
          const totpCode = credentials.totp as string;
          if (!totpCode) {
            throw new Error("TOTP_REQUIRED");
          }
          try {
            const isValid = verify({ token: totpCode, secret: user.totpSecret || "" });
            if (!isValid) {
              return null; // Invalid TOTP code
            }
          } catch {
            return null; // Verification failed
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          onboarded: user.onboarded,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.onboarded = (user as any).onboarded;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).onboarded = token.onboarded;
      }
      return session;
    },
  },
});