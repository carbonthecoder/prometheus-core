import React from "react";
import { 
  BellRing,
  ChevronRight
} from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

const LoggingForm = dynamic(() => import("@/components/dashboard/logging-form").then(mod => mod.LoggingForm), {
  loading: () => <div className="h-96 w-full animate-pulse bg-neutral-800/20 rounded-[40px]" />
});

export default async function ({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const [loggingData, channelsData] = await Promise.all([
    api.getLogging(guildId),
    api.getChannels(guildId)
  ]);

  if (!loggingData) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <BellRing className="h-6 w-6 text-primary" />
            Audit Logging
          </h2>
          <p className="text-neutral-400 mt-1 font-medium italic">Configure events and dispatch routes for your server.</p>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="outline" className="gap-2 border-white/10 bg-neutral-900/50 rounded-lg">
             Audit History
             <ChevronRight className="h-4 w-4" />
           </Button>
        </div>
      </div>

      <LoggingForm 
        initialConfig={loggingData} 
        channels={channelsData} 
        guildId={guildId} 
      />
    </div>
  );
}
