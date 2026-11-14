import DiscordProvider from "next-auth/providers/discord";
import { AuthOptions } from "next-auth";

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://prometheus.is-local.org";
}

const CLIENT_ID = (process.env.DISCORD_CLIENT_ID || "1532437892318892144").trim().replace(/^["']|["']$/g, "");
const CLIENT_SECRET = (process.env.DISCORD_CLIENT_SECRET || "o3sDdlHAvBKTmJLga4L-rWApJVST21O6").trim().replace(/^["']|["']$/g, "");

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "prometheus_secret_vault_development_token_2026",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    DiscordProvider({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: { 
        params: { 
          scope: "identify email guilds",
          prompt: "consent",
        },
      },
      profile(profile) {
        let avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
        if (profile.avatar) {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          avatarUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}?size=256`;
        }
        return {
          id: profile.id,
          name: profile.global_name || profile.username,
          email: profile.email || `${profile.id}@discord.prometheus`,
          image: avatarUrl,
        };
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 900,
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 900,
      },
    },
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url && (url.includes("/dashboard/guilds") || url.includes("/dashboard/guild/"))) {
        return url.startsWith("http") ? url : `${baseUrl}${url}`;
      }
      return `${baseUrl}/dashboard/guilds`;
    },
    async jwt({ token, account, user, profile }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.email = user.email;
      }
      if (profile) {
        token.id = profile.id || token.id;
        token.name = profile.global_name || profile.username || token.name;
        if (profile.avatar) {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          token.picture = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}?size=256`;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id || token.sub;
        session.user.name = token.name || session.user.name;
        session.user.image = token.picture || session.user.image;
        session.user.email = token.email || session.user.email;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    error: "/dashboard/guilds",
  },
};
