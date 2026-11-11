import React from "react";
import { ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

const AutomodForm = dynamic(() => import("@/components/dashboard/automod-form").then(mod => mod.AutomodForm), {
  loading: () => <div className="h-96 w-full animate-pulse bg-neutral-800/20 rounded-xl" />
});

export default async function ({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const config = await api.getAutomod(guildId);

  if (!config) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Auto Moderation
          </h2>
          <p className="text-neutral-400 mt-1">Protect your community with automated filter systems.</p>
        </div>
      </div>

      <AutomodForm initialConfig={config} guildId={guildId} />
    </div>
  );
}
