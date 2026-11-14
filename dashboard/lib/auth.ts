import DiscordProvider from "next-auth/providers/discord";
import { AuthOptions } from "next-auth";

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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub;
        // @ts-ignore
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/dashboard",
  },
};
