import React from "react";
import { SmilePlus } from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

const WelcomeForm = dynamic(() => import("@/components/dashboard/welcome-form").then(mod => mod.WelcomeForm), {
  loading: () => <div className="h-96 w-full animate-pulse bg-neutral-800/20 rounded-xl" />
});

export default async function ({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const [welcomeData, channelsData] = await Promise.all([
    api.getWelcome(guildId),
    api.getChannels(guildId)
  ]);

  if (!welcomeData) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <SmilePlus className="h-6 w-6 text-primary" />
            Welcomer
          </h2>
          <p className="text-neutral-400 mt-1">Greet new members to your server.</p>
        </div>
      </div>

      <WelcomeForm initialConfig={welcomeData} channels={channelsData} guildId={guildId} />
    </div>
  );
}
