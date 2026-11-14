import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Ticket, 
  BarChart4, 
  FileText, 
  Sword,
  Bot,
  Bell,
  Mic,
  Star,
  Zap,
  Settings,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { CommandsDirectory } from "@/components/commands-directory";

export default async function GuildOverviewPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;

  const quickModules = [
    { title: "Anti-Nuke Defense", desc: "Role, channel, and webhook deletion protection", icon: Sword, href: `/dashboard/guild/${guildId}/antinuke`, badge: "Strict" },
    { title: "Auto Moderation", desc: "Anti-spam, bad words, and invite links filtering", icon: ShieldCheck, href: `/dashboard/guild/${guildId}/automod`, badge: "Active" },
    { title: "Verification Gate", desc: "Interactive button verification for new members", icon: Bot, href: `/dashboard/guild/${guildId}/verification`, badge: "Ready" },
    { title: "Tickets & Support", desc: "Private channel ticketing system with transcripts", icon: Ticket, href: `/dashboard/guild/${guildId}/tickets`, badge: "Ready" },
    { title: "Leveling & XP", desc: "Chat and voice XP tracking with automatic roles", icon: BarChart4, href: `/dashboard/guild/${guildId}/leveling`, badge: "Active" },
    { title: "Welcome Cards", desc: "Automated custom canvas greetings and leave alerts", icon: Bell, href: `/dashboard/guild/${guildId}/welcome`, badge: "Ready" },
    { title: "Join to Create", desc: "Dynamic temporary voice channels for community", icon: Mic, href: `/dashboard/guild/${guildId}/j2c`, badge: "Ready" },
    { title: "Reaction Roles", desc: "Self-assignable roles via buttons and select menus", icon: Star, href: `/dashboard/guild/${guildId}/reactionroles`, badge: "Ready" },
    { title: "Audit Logging", desc: "Granular server event logging and moderation history", icon: FileText, href: `/dashboard/guild/${guildId}/logging`, badge: "Logging" },
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Top Banner / Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white font-sans">
            Server Modules & Commands
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Configure security, moderation, community automation, and browse all 111 slash commands for this guild.
          </p>
        </div>

        <Link
          href={`/dashboard/guild/${guildId}/settings`}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
          Guild Settings
        </Link>
      </div>

      {/* Module Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
            Core Modules
          </h2>
          <span className="text-[11px] font-mono text-neutral-500">18 total modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickModules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-all group flex flex-col justify-between h-36"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <mod.icon className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400">
                    {mod.badge}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white group-hover:underline">
                  {mod.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All 111 Commands Directory */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
              Command Catalog
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Every slash command registered and available on this server.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-white/10 px-2.5 py-1 rounded-full">
            111 commands
          </span>
        </div>

        <CommandsDirectory />
      </div>
    </div>
  );
}
