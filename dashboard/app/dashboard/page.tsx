import React from "react";
import Link from "next/link";
import { 
  Server as ServerIcon, 
  Users, 
  Activity, 
  Terminal, 
  ShieldCheck, 
  Ticket, 
  BarChart4, 
  Radio, 
  ExternalLink,
  ChevronRight,
  Shield,
  Bot
} from "lucide-react";
import { api } from "@/lib/api";

export const revalidate = 0;

export default async function DashboardPage() {
  let botInfo;
  let error = null;

  try {
    botInfo = await api.getBotInfo();
  } catch (err: any) {
    error = err.message || "Failed to connect to the bot API.";
    botInfo = {
      name: "Prometheus",
      guilds: 1,
      users: 12,
      commands: 111,
      latency: "24ms"
    };
  }

  const stats = [
    { name: "Active Servers", value: botInfo.guilds.toLocaleString(), detail: "1 connected", icon: ServerIcon },
    { name: "Indexed Users", value: botInfo.users.toLocaleString(), detail: "Live cache", icon: Users },
    { name: "Slash Commands", value: "111", detail: "Synchronized", icon: Terminal },
    { name: "Host Environment", value: "Self-hosted VPS", detail: "Ubuntu 24.04 (EPYC)", icon: Activity },
  ];

  const modules = [
    { title: "Auto Moderation", desc: "Anti-spam, invite filters, and mention limits.", icon: ShieldCheck, href: "/dashboard/guild/1508741457769664573/automod" },
    { title: "Anti-Nuke Defense", desc: "Role, channel, and webhook deletion guards.", icon: Shield, href: "/dashboard/guild/1508741457769664573/antinuke" },
    { title: "Verification Gate", desc: "One-click button verification system.", icon: Bot, href: "/dashboard/guild/1508741457769664573/verification" },
    { title: "Leveling & XP", desc: "Gamify chat activity with automated role rewards.", icon: BarChart4, href: "/dashboard/guild/1508741457769664573/leveling" },
    { title: "Support Tickets", desc: "Private channel ticketing with HTML transcripts.", icon: Ticket, href: "/dashboard/guild/1508741457769664573/tickets" },
    { title: "Music & 24/7 Voice", desc: "High-fidelity audio streaming and radio presets.", icon: Radio, href: "/dashboard/guild/1508741457769664573" },
  ];

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white font-sans">
            Overview
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time telemetry and management for Prometheus Core.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/guild/1508741457769664573"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors"
          >
            Manage Spooky nights
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-medium">{stat.name}</span>
              <stat.icon className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="text-2xl font-semibold text-white tracking-tight font-mono">
              {stat.value}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 font-mono">
              {stat.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Primary Server Card */}
      <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-white font-semibold text-base font-mono">
              SN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Spooky nights</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                ID: 1508741457769664573 · Guild Owner
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/guild/1508741457769664573"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Configure
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Core Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-[11px]">
            Server Modules
          </h2>
          <span className="text-xs text-neutral-500 font-mono">18 modules total</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-colors group flex flex-col justify-between h-36"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <mod.icon className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                </div>
                <h4 className="text-sm font-medium text-white group-hover:underline">
                  {mod.title}
                </h4>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Utility Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#050505] border border-white/5 text-xs text-neutral-500 font-mono">
        <span>Prometheus Core · 111 slash commands loaded</span>
        <div className="flex items-center gap-4">
          <a
            href="https://discord.com/oauth2/authorize?client_id=1532437892318892144&permissions=8&scope=bot%20applications.commands"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1"
          >
            Invite Bot <ExternalLink className="h-3 w-3" />
          </a>
          <Link href="/dashboard/guilds" className="hover:text-white transition-colors">
            All Servers
          </Link>
        </div>
      </div>
    </div>
  );
}
