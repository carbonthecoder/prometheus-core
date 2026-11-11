"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  ShieldCheck, 
  Ticket, 
  BarChart4, 
  FileText, 
  Settings,
  Layers,
  Sword,
  Activity,
  SmilePlus,
  Shield,
  Bot,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Link2,
  Zap,
  Mic,
  Mail,
  Link as LinkIcon,
  Sparkles
} from "lucide-react";

interface Tab {
  name: string;
  href: string;
  icon: any;
}

export function GuildTabs({ guildId }: { guildId: string }) {
  const pathname = usePathname();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const tabs: Tab[] = [
    { name: "Overview", href: `/dashboard/guild/${guildId}`, icon: Layers },
    { name: "Anti-Nuke", href: `/dashboard/guild/${guildId}/antinuke`, icon: Sword },
    { name: "Automod", href: `/dashboard/guild/${guildId}/automod`, icon: ShieldCheck },
    { name: "Tickets", href: `/dashboard/guild/${guildId}/tickets`, icon: Ticket },
    { name: "Verification", href: `/dashboard/guild/${guildId}/verification`, icon: Shield },
    { name: "Welcome", href: `/dashboard/guild/${guildId}/welcome`, icon: SmilePlus },
    { name: "Invites", href: `/dashboard/guild/${guildId}/invites`, icon: LinkIcon },
    { name: "Auto Role", href: `/dashboard/guild/${guildId}/autorole`, icon: Bot },
    { name: "Reaction Roles", href: `/dashboard/guild/${guildId}/reactionroles`, icon: Activity },
    { name: "Join to Create", href: `/dashboard/guild/${guildId}/j2c`, icon: Mic },
    { name: "Voice Role", href: `/dashboard/guild/${guildId}/invcrole`, icon: Volume2 },
    { name: "Vanity Roles", href: `/dashboard/guild/${guildId}/vanityroles`, icon: Link2 },
    { name: "Auto React", href: `/dashboard/guild/${guildId}/autoreact`, icon: Zap },
    { name: "Custom Roles", href: `/dashboard/guild/${guildId}/customroles`, icon: Sparkles },
    { name: "Join DM", href: `/dashboard/guild/${guildId}/joindm`, icon: Mail },
    { name: "Leveling", href: `/dashboard/guild/${guildId}/leveling`, icon: BarChart4 },
    { name: "Logging", href: `/dashboard/guild/${guildId}/logging`, icon: FileText },
    { name: "Settings", href: `/dashboard/guild/${guildId}/settings`, icon: Settings },
  ].filter(tab => tab.href);

  return (
    <div className="relative group/tabs flex items-center w-full mb-8 sticky top-[64px] z-20 transition-all duration-300">
      {/* Scroll Arrows */}
      <button 
        onClick={() => scroll("left")}
        aria-label="Scroll tabs left"
        className="absolute left-[-14px] z-30 p-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-300 shadow-md opacity-0 group-hover/tabs:opacity-100 transition-opacity hover:bg-neutral-800 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Left Fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity" />
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 p-1.5 bg-neutral-950 border border-white/10 rounded-xl overflow-x-auto no-scrollbar w-full scroll-smooth shadow-lg"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="shrink-0"
            >
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-tight transition-all duration-150 whitespace-nowrap",
                isActive 
                  ? "bg-white text-black shadow-sm font-semibold" 
                  : "text-neutral-400 bg-neutral-900/60 border border-white/5 hover:text-white hover:bg-neutral-800/80 hover:border-white/10"
              )}>
                <tab.icon className={cn("h-3.5 w-3.5", isActive ? "text-black" : "text-neutral-400")} />
                {tab.name}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right Fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity" />

      <button 
        onClick={() => scroll("right")}
        aria-label="Scroll tabs right"
        className="absolute right-[-14px] z-30 p-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-300 shadow-md opacity-0 group-hover/tabs:opacity-100 transition-opacity hover:bg-neutral-800 hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
