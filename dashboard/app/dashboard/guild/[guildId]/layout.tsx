import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  Shield, 
  Hash, 
  ArrowLeft,
  ShieldAlert
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GuildTabs } from "@/components/guild-tabs";

export const revalidate = 0; // Never cache any guild dashboard page

interface GuildLayoutProps {
  children: React.ReactNode;
  params: Promise<{ guildId: string }>;
}

export default async function GuildLayout({
  children,
  params,
}: GuildLayoutProps) {
  const { guildId } = await params;
  let guild;
  let error = null;

  try {
    guild = await api.getGuildDetails(guildId);
  } catch (err: any) {
    console.error("Failed to fetch guild details:", err);
    error = err.message || "Failed to load guild data.";
  }

  if (error || !guild) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-white/10 rounded-xl bg-neutral-950 p-12 text-center">
        <ShieldAlert className="h-16 w-16 text-red-400 mb-6 opacity-60" />
        <h2 className="text-xl font-semibold text-white">Access Denied</h2>
        <p className="text-neutral-400 mt-2 max-w-md text-sm">{error || "This guild does not exist or you do not have permission to manage it."}</p>
        <Link href="/dashboard/guilds" className="mt-6">
          <Button variant="outline">Back to Servers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back button */}
      <Link href="/dashboard/guilds" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-medium group">
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        Back to servers
      </Link>

      {/* Guild Header */}
      <div className="bg-neutral-950 border border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="relative">
            {guild.icon ? (
              <Image 
                src={guild.icon} 
                alt={guild.name}
                width={80}
                height={80}
                className="rounded-xl border border-white/10"
              />
            ) : (
              <div className="h-20 w-20 bg-neutral-900 rounded-xl flex items-center justify-center text-2xl font-bold text-white border border-white/10">
                {guild.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full border-2 border-black" title="Active">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-white tracking-tight">{guild.name}</h1>
                <span className="px-2 py-0.5 bg-neutral-900 rounded text-[11px] font-mono text-neutral-400 border border-white/10">
                  ID: {guildId}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">Server Infrastructure Controls</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { label: "Members", value: guild.member_count, icon: Users },
                { label: "Roles", value: guild.role_count, icon: Shield },
                { label: "Channels", value: guild.channel_count, icon: Hash },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 bg-neutral-900/60 px-3.5 py-2 rounded-lg border border-white/5">
                  <item.icon className="h-4 w-4 text-neutral-400" />
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-500 mr-2">{item.label}</span>
                    <span className="text-xs font-semibold text-white font-mono">{item.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/dashboard/guild/${guildId}/settings`}>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <GuildTabs guildId={guildId} />

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {children}
      </div>
    </div>
  );
}
