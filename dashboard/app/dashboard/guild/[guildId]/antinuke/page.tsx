import React from "react";
import { ShieldAlert } from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

const AntiNukeForm = dynamic(() => import("@/components/dashboard/antinuke-form").then(mod => mod.AntiNukeForm), {
  loading: () => <div className="h-96 w-full animate-pulse bg-neutral-800/20 rounded-xl" />
});

export default async function ({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const config = await api.getAntiNuke(guildId);

  if (!config) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            Anti-Nuke Protection
          </h2>
          <p className="text-neutral-400 mt-1">Protect your server from malicious mass-deletion, mass-banning, and other destructive actions.</p>
        </div>
      </div>

      <AntiNukeForm initialConfig={config} guildId={guildId} />
    </div>
  );
}
