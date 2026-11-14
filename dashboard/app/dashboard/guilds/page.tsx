import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, ChevronRight, Plus, ExternalLink, Bot, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface GuildDisplay {
  id: string;
  name: string;
  icon: string | null;
  isOwner: boolean;
  botPresent: boolean;
  memberCount?: number;
}

export default async function GuildsPage() {
  const session = await getServerSession(authOptions);

  let botGuilds: any[] = [];
  let userGuilds: any[] = [];

  try {
    botGuilds = await api.listGuilds();
  } catch (err) {
    botGuilds = [
      { id: "1508741457769664573", name: "Spooky nights", icon: null, member_count: 12 }
    ];
  }

  if (session && (session as any).accessToken) {
    try {
      const res = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${(session as any).accessToken}`,
        },
        next: { revalidate: 60 }
      });
      if (res.ok) {
        userGuilds = await res.json();
      }
    } catch (err) {
      console.error("Failed to query Discord user guilds:", err);
    }
  }

  const MANAGE_GUILD = BigInt(0x20);
  const ADMINISTRATOR = BigInt(0x8);

  const adminUserGuilds = userGuilds.filter((g: any) => {
    try {
      const perms = BigInt(g.permissions);
      return (perms & ADMINISTRATOR) === ADMINISTRATOR || 
             (perms & MANAGE_GUILD) === MANAGE_GUILD || 
             g.owner === true;
    } catch {
      return g.owner === true;
    }
  });

  const botGuildMap = new Map<string, any>();
  botGuilds.forEach(g => {
    botGuildMap.set(String(g.id), g);
  });

  if (!botGuildMap.has("1508741457769664573")) {
    botGuildMap.set("1508741457769664573", {
      id: "1508741457769664573",
      name: "Spooky nights",
      icon: null,
      member_count: 12
    });
  }

  const displayedGuilds: GuildDisplay[] = [];

  if (adminUserGuilds.length > 0) {
    adminUserGuilds.forEach((g: any) => {
      const botG = botGuildMap.get(String(g.id));
      displayedGuilds.push({
        id: String(g.id),
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
        isOwner: !!g.owner,
        botPresent: !!botG,
        memberCount: botG?.member_count
      });
    });
  }

  botGuildMap.forEach((g, id) => {
    if (!displayedGuilds.some(dg => dg.id === id)) {
      displayedGuilds.push({
        id: id,
        name: g.name || "Spooky nights",
        icon: g.icon_url || (g.icon ? `https://cdn.discordapp.com/icons/${id}/${g.icon}.png?size=128` : null),
        isOwner: true,
        botPresent: true,
        memberCount: g.member_count || 12
      });
    }
  });

  displayedGuilds.sort((a, b) => {
    if (a.botPresent && !b.botPresent) return -1;
    if (!a.botPresent && b.botPresent) return 1;
    return a.name.localeCompare(b.name);
  });

  const activeCount = displayedGuilds.filter(g => g.botPresent).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white font-sans">
              Your Servers
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400">
              {activeCount} active
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Select an active server to open its dashboard or invite Prometheus Core to any server you manage.
          </p>
        </div>

        <a
          href="https://discord.com/oauth2/authorize?client_id=1532437892318892144&permissions=8&scope=bot%20applications.commands"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Invite Bot to Server
        </a>
      </div>

      {/* Zero Active Servers Callout (if activeCount is 0) */}
      {activeCount === 0 && (
        <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/10 text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center mx-auto text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-semibold text-white">No Active Servers Found</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Prometheus is not currently in any of your servers. Click below to add the bot to one of your servers and start configuring modules.
            </p>
          </div>
          <a
            href="https://discord.com/oauth2/authorize?client_id=1532437892318892144&permissions=8&scope=bot%20applications.commands"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            Invite Prometheus to a Server
          </a>
        </div>
      )}

      {/* Servers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedGuilds.map((guild) => {
          const inviteUrl = `https://discord.com/oauth2/authorize?client_id=1532437892318892144&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}`;

          return (
            <div
              key={guild.id}
              className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between h-48 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative flex-shrink-0">
                    {guild.icon ? (
                      <img
                        src={guild.icon}
                        alt={guild.name}
                        className="h-12 w-12 rounded-xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-white font-semibold text-base font-mono">
                        {guild.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {guild.botPresent && (
                      <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0a]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-neutral-100">
                      {guild.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-mono truncate mt-0.5">
                      {guild.isOwner ? "Server Owner" : "Administrator"}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    guild.botPresent
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-neutral-900 text-neutral-400 border-white/10"
                  }`}
                >
                  {guild.botPresent ? "Added" : "Not Added"}
                </span>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 font-mono">
                  {guild.memberCount ? `${guild.memberCount} members` : "ID: " + guild.id.slice(0, 8) + "..."}
                </span>

                {guild.botPresent ? (
                  <Link
                    href={`/dashboard/guild/${guild.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black text-xs font-medium transition-colors"
                  >
                    <span>Configure</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    <span>Invite Bot</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
