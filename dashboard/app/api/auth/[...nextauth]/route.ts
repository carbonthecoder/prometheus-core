import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://prometheus.is-local.org";
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
