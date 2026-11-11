import React from "react";
import { Mic } from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

export const revalidate = 0; // Never cache this page


const J2CForm = dynamic(() => import("@/components/dashboard/j2c-form").then(mod => mod.J2CForm), {
  loading: () => <div className="h-96 w-full animate-pulse bg-neutral-800/20 rounded-xl" />
});

export default async function ({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const [config, channels] = await Promise.all([
    api.getJ2C(guildId),
    api.getChannels(guildId),
  ]);

  if (!config) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            Join to Create
          </h2>
          <p className="text-neutral-400 mt-1">Set up temporary voice channels that are created automatically when a member joins a specific channel.</p>
        </div>
      </div>

      <J2CForm initialConfig={config} channels={channels} guildId={guildId} />
    </div>
  );
}
