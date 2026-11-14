import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://prometheus.is-local.org",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "prometheus_secret_vault_development_token_2026",
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "1532437892318892144",
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "o3sDdlHAvBKTmJLga4L-rWApJVST21O6",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

export default nextConfig;
