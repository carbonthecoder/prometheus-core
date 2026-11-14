import DiscordProvider from "next-auth/providers/discord";
import { AuthOptions } from "next-auth";

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://prometheus.is-local.org";
}

const CLIENT_ID = (process.env.DISCORD_CLIENT_ID || "1532437892318892144").trim().replace(/^["']|["']$/g, "");
const CLIENT_SECRET = (process.env.DISCORD_CLIENT_SECRET || "o3sDdlHAvBKTmJLga4L-rWApJVST21O6").trim().replace(/^["']|["']$/g, "");

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "prometheus_secret_vault_development_token_2026",
  providers: [
    DiscordProvider({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      authorization: { 
        params: { 
          scope: "identify guilds",
          prompt: "consent"
        } 
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url && (url.includes("/dashboard/guilds") || url.includes("/dashboard/guild/"))) {
        return url.startsWith("http") ? url : `${baseUrl}${url}`;
      }
      return `${baseUrl}/dashboard/guilds`;
    },
    async jwt({ token, account, profile }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.id = profile.id;
        token.name = profile.global_name || profile.username;
        if (profile.avatar) {
          token.picture = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=256`;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id || token.sub;
        session.user.name = token.name || session.user.name;
        session.user.image = token.picture || session.user.image;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    error: "/dashboard/guilds",
  },
};
