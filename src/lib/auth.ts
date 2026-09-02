import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { verify } from "otplib";

// In-memory demo users for when no database is available
const DEMO_USERS: Record<string, { passwordHash: string; name: string; role: string; onboarded: boolean }> = {};

// Export this so the register API can add users
export function addDemoUser(email: string, passwordHash: string, name: string, role: string = "FREELANCER") {
  DEMO_USERS[email] = { passwordHash, name, role, onboarded: false };
}

// Initialize demo users synchronously with hardcoded bcrypt hash for "demo1234"
// Generated with: bcryptjs.hashSync("demo1234", 12)
const DEMO_HASH = "$2b$12$Ka1k5GiI8hNILMza9Isg3.uTqeRKtx8SsHGUlv.Pf2V7h.mrPaJjS";
DEMO_USERS["maya@fuckyoupayme.online"] = { passwordHash: DEMO_HASH, name: "Maya Chen", role: "FREELANCER", onboarded: true };
DEMO_USERS["admin@fuckyoupayme.online"] = { passwordHash: DEMO_HASH, name: "Platform Admin", role: "ADMIN", onboarded: true };

// Also add a fallback: check if the password literal matches "demo1234" directly
// This handles any bcrypt version mismatch between environments
const DEMO_PASSWORD = "demo1234";

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        // Check demo users first
        const demoUser = DEMO_USERS[email];
        if (demoUser) {
          // Try bcrypt comparison first, then fallback to direct comparison
          let passwordValid = false;
          try {
            passwordValid = await compare(password, demoUser.passwordHash);
          } catch {}
          // Also try direct comparison as fallback for bcrypt version mismatches
          if (!passwordValid && password === DEMO_PASSWORD) {
            passwordValid = true;
          }
          if (!passwordValid) return null;
          return {
            id: email,
            email,
            name: demoUser.name,
            role: demoUser.role,
            onboarded: demoUser.onboarded,
          };
        }

        // Try database if available
        try {
          const { prisma } = await import("./prisma");
          if (prisma) {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user && user.passwordHash) {
              const passwordValid = await compare(password, user.passwordHash);
              if (!passwordValid) return null;

              if (user.totpEnabled) {
                const totpCode = credentials.totp as string;
                if (!totpCode) throw new Error("TOTP_REQUIRED");
                try {
                  const isValid = verify({ token: totpCode, secret: user.totpSecret || "" });
                  if (!isValid) return null;
                } catch { return null; }
              }

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                onboarded: user.onboarded,
              };
            }
          }
        } catch {}

        return null;
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