import type { NextAuthConfig } from "next-auth";
import Email from "next-auth/providers/email";
import GitHub from "next-auth/providers/github";

const providers: NonNullable<NextAuthConfig["providers"]> = [
  Email({
    server: process.env.EMAIL_SERVER ?? "smtp://user:pass@localhost:1025",
    from: process.env.EMAIL_FROM ?? "no-reply@example.com",
  }),
];

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  );
}

export const authConfig = {
  providers,
  callbacks: {
    authorized({ auth, request }) {
      const isOnChat = request.nextUrl.pathname.startsWith("/chat");
      if (!isOnChat) return true;
      return Boolean(auth?.user);
    },
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token?.sub ?? session.user.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
