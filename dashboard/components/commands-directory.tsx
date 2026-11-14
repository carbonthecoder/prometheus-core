"use client";

import React, { useState } from "react";
import { 
  Search, 
  Terminal, 
  ShieldCheck, 
  Radio, 
  Coins, 
  Users, 
  Gift, 
  Wrench, 
  Gamepad2,
  ChevronRight,
  Check,
  ExternalLink
} from "lucide-react";

interface CommandItem {
  name: string;
  category: "Security" | "Voice & Music" | "Economy & XP" | "Community" | "Giveaways" | "Utility" | "Fun";
  desc: string;
  permission: string;
  syntax: string;
}

const ALL_COMMANDS: CommandItem[] = [
  // Security & Moderation
  { name: "automod", category: "Security", desc: "Configure anti-spam, link filters, and mention limits", permission: "Manage Guild", syntax: "/automod [rule] [toggle]" },
  { name: "antinuke", category: "Security", desc: "Configure anti-nuke deletion rate limits and guards", permission: "Administrator", syntax: "/antinuke setup" },
  { name: "ban", category: "Security", desc: "Ban a member permanently or temporarily from the server", permission: "Ban Members", syntax: "/ban target:[user] reason:[reason]" },
  { name: "unban", category: "Security", desc: "Revoke an active ban for a user by ID", permission: "Ban Members", syntax: "/unban user_id:[id]" },
  { name: "kick", category: "Security", desc: "Kick a member from the server", permission: "Kick Members", syntax: "/kick target:[user] reason:[reason]" },
  { name: "mute", category: "Security", desc: "Timeout and restrict a user from sending messages", permission: "Moderate Members", syntax: "/mute target:[user] duration:[mins]" },
  { name: "unmute", category: "Security", desc: "Remove timeout restriction from a member", permission: "Moderate Members", syntax: "/unmute target:[user]" },
  { name: "warn", category: "Security", desc: "Issue an official moderation warning to a user", permission: "Moderate Members", syntax: "/warn target:[user] reason:[reason]" },
  { name: "warnings", category: "Security", desc: "View all moderation warnings and active cases for a user", permission: "Moderate Members", syntax: "/warnings target:[user]" },
  { name: "clearwarn", category: "Security", desc: "Clear active warnings from a member's case record", permission: "Manage Guild", syntax: "/clearwarn target:[user]" },
  { name: "purge", category: "Security", desc: "Bulk delete up to 100 recent messages in channel", permission: "Manage Messages", syntax: "/purge amount:[number]" },
  { name: "lock", category: "Security", desc: "Lock down channel permissions to prevent members from chatting", permission: "Manage Channels", syntax: "/lock [channel]" },
  { name: "unlock", category: "Security", desc: "Restore standard channel send permissions", permission: "Manage Channels", syntax: "/unlock [channel]" },
  { name: "slowmode", category: "Security", desc: "Enforce message rate delay in current channel", permission: "Manage Channels", syntax: "/slowmode seconds:[0-21600]" },
  { name: "nuke", category: "Security", desc: "Duplicate channel permissions and purge entire history", permission: "Manage Channels", syntax: "/nuke" },
  { name: "snipe", category: "Security", desc: "Reveal recently deleted message in channel", permission: "Manage Messages", syntax: "/snipe" },
  { name: "role", category: "Security", desc: "Add or remove a server role from a member", permission: "Manage Roles", syntax: "/role target:[user] role:[role]" },
  { name: "nick", category: "Security", desc: "Change or reset a member's guild nickname", permission: "Manage Nicknames", syntax: "/nick target:[user] name:[name]" },
  { name: "whitelist", category: "Security", desc: "Add trusted user or role to anti-nuke bypass list", permission: "Administrator", syntax: "/whitelist add:[user]" },
  { name: "blacklist", category: "Security", desc: "Block malicious users or external domains across server", permission: "Administrator", syntax: "/blacklist add:[domain]" },
  { name: "badwords", category: "Security", desc: "Manage server prohibited words and trigger actions", permission: "Manage Guild", syntax: "/badwords add:[word]" },
  { name: "antilink", category: "Security", desc: "Toggle automatic deletion of unauthorized invite links", permission: "Manage Guild", syntax: "/antilink [toggle]" },
  { name: "antispam", category: "Security", desc: "Toggle message rate spam detection and auto-mute", permission: "Manage Guild", syntax: "/antispam threshold:[5]" },
  { name: "antiraid", category: "Security", desc: "Lock guild entry gates during raid attack alerts", permission: "Administrator", syntax: "/antiraid [on/off]" },
  { name: "report", category: "Security", desc: "Submit user violation report to staff mod logs", permission: "Everyone", syntax: "/report target:[user] reason:[reason]" },

  // Voice & Music
  { name: "play", category: "Voice & Music", desc: "Stream audio from URL or search query into voice channel", permission: "Everyone", syntax: "/play query:[track/url]" },
  { name: "pause", category: "Voice & Music", desc: "Pause current audio track", permission: "Everyone", syntax: "/pause" },
  { name: "resume", category: "Voice & Music", desc: "Resume paused audio track", permission: "Everyone", syntax: "/resume" },
  { name: "stop", category: "Voice & Music", desc: "Stop audio playback and clear server queue", permission: "Everyone", syntax: "/stop" },
  { name: "skip", category: "Voice & Music", desc: "Skip current track or vote to skip", permission: "Everyone", syntax: "/skip" },
  { name: "queue", category: "Voice & Music", desc: "Display current upcoming audio tracks in queue", permission: "Everyone", syntax: "/queue" },
  { name: "nowplaying", category: "Voice & Music", desc: "Display current playing track metadata and duration bar", permission: "Everyone", syntax: "/nowplaying" },
  { name: "volume", category: "Voice & Music", desc: "Adjust playback volume between 1% and 100%", permission: "Everyone", syntax: "/volume percent:[1-100]" },
  { name: "shuffle", category: "Voice & Music", desc: "Randomize all tracks in the current queue", permission: "Everyone", syntax: "/shuffle" },
  { name: "loop", category: "Voice & Music", desc: "Toggle loop mode for current track or entire queue", permission: "Everyone", syntax: "/loop mode:[track/queue/off]" },
  { name: "lyrics", category: "Voice & Music", desc: "Fetch synchronized lyrics for current playing song", permission: "Everyone", syntax: "/lyrics [song]" },
  { name: "radio", category: "Voice & Music", desc: "Stream 24/7 curated lo-fi, chill, or radio station presets", permission: "Everyone", syntax: "/radio station:[lofi/synth]" },
  { name: "join", category: "Voice & Music", desc: "Connect Prometheus voice client to your channel", permission: "Everyone", syntax: "/join" },
  { name: "leave", category: "Voice & Music", desc: "Disconnect bot from voice channel", permission: "Everyone", syntax: "/leave" },

  // Economy & Leveling
  { name: "balance", category: "Economy & XP", desc: "Check wallet cash and bank balances", permission: "Everyone", syntax: "/balance [target]" },
  { name: "daily", category: "Economy & XP", desc: "Claim daily currency stipend with streak bonuses", permission: "Everyone", syntax: "/daily" },
  { name: "beg", category: "Economy & XP", desc: "Earn random small amounts of server currency", permission: "Everyone", syntax: "/beg" },
  { name: "deposit", category: "Economy & XP", desc: "Safely transfer wallet money into protected bank vault", permission: "Everyone", syntax: "/deposit amount:[number/all]" },
  { name: "withdraw", category: "Economy & XP", desc: "Withdraw coins from bank account to wallet", permission: "Everyone", syntax: "/withdraw amount:[number/all]" },
  { name: "pay", category: "Economy & XP", desc: "Transfer coins directly to another member", permission: "Everyone", syntax: "/pay target:[user] amount:[number]" },
  { name: "shop", category: "Economy & XP", desc: "Browse items, roles, and perks in the guild market", permission: "Everyone", syntax: "/shop" },
  { name: "buy", category: "Economy & XP", desc: "Purchase an item or role from the guild market", permission: "Everyone", syntax: "/buy item_id:[id]" },
  { name: "inventory", category: "Economy & XP", desc: "Inspect items, badges, and consumables in your inventory", permission: "Everyone", syntax: "/inventory [target]" },
  { name: "profile", category: "Economy & XP", desc: "Display full user card with economy, rank, and achievements", permission: "Everyone", syntax: "/profile [target]" },
  { name: "eleaderboard", category: "Economy & XP", desc: "View top richest members across the server", permission: "Everyone", syntax: "/eleaderboard" },
  { name: "rank", category: "Economy & XP", desc: "View current XP level, progress bar, and server rank", permission: "Everyone", syntax: "/rank [target]" },
  { name: "leaderboard", category: "Economy & XP", desc: "Display top active chatters and voice leaderboard", permission: "Everyone", syntax: "/leaderboard" },
  { name: "setxp", category: "Economy & XP", desc: "Set or modify a user's XP score manually", permission: "Administrator", syntax: "/setxp target:[user] amount:[xp]" },
  { name: "multiplier", category: "Economy & XP", desc: "Assign custom XP multiplier boosts to specific roles", permission: "Manage Guild", syntax: "/multiplier role:[role] rate:[1.5]" },
  { name: "rewards", category: "Economy & XP", desc: "List all automated level-up role reward milestones", permission: "Everyone", syntax: "/rewards" },
  { name: "levelrole", category: "Economy & XP", desc: "Bind automated role unlocks to target level thresholds", permission: "Manage Roles", syntax: "/levelrole level:[10] role:[role]" },

  // Community & Engagement
  { name: "welcome", category: "Community", desc: "Configure welcome card channel and banner styling", permission: "Manage Guild", syntax: "/welcome channel:[channel]" },
  { name: "goodbye", category: "Community", desc: "Configure leave message alerts and broadcast channel", permission: "Manage Guild", syntax: "/goodbye channel:[channel]" },
  { name: "greet", category: "Community", desc: "Preview and test welcome greeting card delivery", permission: "Manage Guild", syntax: "/greet" },
  { name: "autorole", category: "Community", desc: "Assign roles automatically to new members on join", permission: "Manage Roles", syntax: "/autorole role:[role]" },
  { name: "verify", category: "Community", desc: "Complete verification to unlock server channels", permission: "Everyone", syntax: "/verify" },
  { name: "verification", category: "Community", desc: "Configure verification gate, channel, and target role", permission: "Manage Guild", syntax: "/verification setup" },
  { name: "autoverify", category: "Community", desc: "Toggle automatic captcha or account age verification", permission: "Manage Guild", syntax: "/autoverify [toggle]" },
  { name: "j2c", category: "Community", desc: "Setup Join-to-Create dynamic temporary voice channels", permission: "Manage Channels", syntax: "/j2c setup category:[cat]" },
  { name: "activity", category: "Community", desc: "Track user voice channel hours and chat presence", permission: "Everyone", syntax: "/activity [target]" },
  { name: "invcrole", category: "Community", desc: "Assign temporary role when users enter voice channels", permission: "Manage Roles", syntax: "/invcrole role:[role]" },
  { name: "reactionroles", category: "Community", desc: "Build interactive button and menu role selection panels", permission: "Manage Roles", syntax: "/reactionroles create" },
  { name: "customroles", category: "Community", desc: "Allow boosters/members to create and style vanity roles", permission: "Manage Roles", syntax: "/customroles" },
  { name: "vanityroles", category: "Community", desc: "Reward members who display server invite in their status", permission: "Manage Roles", syntax: "/vanityroles setup" },
  { name: "joindm", category: "Community", desc: "Send private welcoming direct message to newcomers", permission: "Manage Guild", syntax: "/joindm message:[text]" },
  { name: "suggest", category: "Community", desc: "Submit an idea or suggestion for community upvoting", permission: "Everyone", syntax: "/suggest idea:[text]" },
  { name: "setsuggestions", category: "Community", desc: "Designate channel for suggestions and poll reactions", permission: "Manage Channels", syntax: "/setsuggestions channel:[ch]" },
  { name: "feedback", category: "Community", desc: "Send private review or feedback to guild staff", permission: "Everyone", syntax: "/feedback message:[text]" },
  { name: "setfeedback", category: "Community", desc: "Set destination channel for staff feedback logs", permission: "Manage Channels", syntax: "/setfeedback channel:[ch]" },
  { name: "apply", category: "Community", desc: "Submit application for staff, moderator, or builder", permission: "Everyone", syntax: "/apply role:[staff]" },
  { name: "app-admin", category: "Community", desc: "Review, approve, or decline pending staff applications", permission: "Administrator", syntax: "/app-admin" },

  // Giveaways
  { name: "gcreate", category: "Giveaways", desc: "Launch interactive giveaway with duration, prize, and winners", permission: "Manage Events", syntax: "/gcreate duration:[1d] winners:[1] prize:[prize]" },
  { name: "gend", category: "Giveaways", desc: "End giveaway early and pick winners immediately", permission: "Manage Events", syntax: "/gend message_id:[id]" },
  { name: "greroll", category: "Giveaways", desc: "Reroll new random winners for completed giveaway", permission: "Manage Events", syntax: "/greroll message_id:[id]" },
  { name: "gdelete", category: "Giveaways", desc: "Cancel and delete active giveaway panel", permission: "Manage Events", syntax: "/gdelete message_id:[id]" },
  { name: "glist", category: "Giveaways", desc: "Display all currently running giveaways in the server", permission: "Everyone", syntax: "/glist" },

  // Utility & Tools
  { name: "userinfo", category: "Utility", desc: "Inspect user profile, account age, and permissions in cozy card", permission: "Everyone", syntax: "/userinfo [target]" },
  { name: "serverinfo", category: "Utility", desc: "Display guild creation date, boost tier, channel counts", permission: "Everyone", syntax: "/serverinfo" },
  { name: "avatar", category: "Utility", desc: "Fetch high-resolution avatar image and banner", permission: "Everyone", syntax: "/avatar [target]" },
  { name: "invites", category: "Utility", desc: "Check member referral counts and active invite links", permission: "Everyone", syntax: "/invites [target]" },
  { name: "poll", category: "Utility", desc: "Create interactive single or multiple-choice poll embed", permission: "Everyone", syntax: "/poll question:[text] options:[csv]" },
  { name: "embedbuilder", category: "Utility", desc: "Visual interactive embed creator and JSON exporter", permission: "Manage Messages", syntax: "/embedbuilder" },
  { name: "calculate", category: "Utility", desc: "Evaluate complex mathematical equations and expressions", permission: "Everyone", syntax: "/calculate expression:[math]" },
  { name: "countdown", category: "Utility", desc: "Generate live updating Discord timestamp countdown", permission: "Everyone", syntax: "/countdown target:[time]" },
  { name: "weather", category: "Utility", desc: "Fetch real-time weather reports, temperature, and humidity", permission: "Everyone", syntax: "/weather city:[city]" },
  { name: "tldr", category: "Utility", desc: "AI-driven summarization of recent unread channel messages", permission: "Everyone", syntax: "/tldr limit:[50]" },
  { name: "shorten", category: "Utility", desc: "Shorten long URLs with clean redirection link", permission: "Everyone", syntax: "/shorten url:[url]" },
  { name: "time", category: "Utility", desc: "Display current time across major international timezones", permission: "Everyone", syntax: "/time timezone:[tz]" },
  { name: "unixtime", category: "Utility", desc: "Convert timestamp to formatted Discord unix markdown", permission: "Everyone", syntax: "/unixtime date:[date]" },
  { name: "wormhole", category: "Utility", desc: "Link two discord channels together for real-time relay", permission: "Administrator", syntax: "/wormhole link:[channel]" },
  { name: "firstmsg", category: "Utility", desc: "Jump directly to the first message ever posted in channel", permission: "Everyone", syntax: "/firstmsg" },
  { name: "todo", category: "Utility", desc: "Manage personal server task list with checkable items", permission: "Everyone", syntax: "/todo add:[task]" },
  { name: "wipedata", category: "Utility", desc: "Request complete GDPR wipe of stored user records", permission: "Everyone", syntax: "/wipedata" },
  { name: "ping", category: "Utility", desc: "Inspect Discord gateway and REST API roundtrip latency", permission: "Everyone", syntax: "/ping" },
  { name: "uptime", category: "Utility", desc: "View Prometheus continuous running time and node stats", permission: "Everyone", syntax: "/uptime" },
  { name: "stats", category: "Utility", desc: "Display server RAM, CPU, clusters, and Node.js metrics", permission: "Everyone", syntax: "/stats" },
  { name: "help", category: "Utility", desc: "Browse interactive command manual and feature guides", permission: "Everyone", syntax: "/help" },
  { name: "support", category: "Utility", desc: "Receive direct invite to the Prometheus support server", permission: "Everyone", syntax: "/support" },

  // Fun & Extras
  { name: "roll", category: "Fun", desc: "Roll polyhedral dice with custom sides and modifiers", permission: "Everyone", syntax: "/roll sides:[6]" },
  { name: "fight", category: "Fun", desc: "Turn-based combat minigame between two members", permission: "Everyone", syntax: "/fight target:[user]" },
  { name: "feed", category: "Fun", desc: "Feed another member a virtual meal item", permission: "Everyone", syntax: "/feed target:[user]" },
  { name: "hexcolor", category: "Fun", desc: "Render a clean color swatch preview from hex code", permission: "Everyone", syntax: "/hexcolor hex:[#0e0d0d]" },
  { name: "imagine", category: "Fun", desc: "Generate image artworks from prompt using Gemini AI", permission: "Everyone", syntax: "/imagine prompt:[prompt]" },
  { name: "randomuser", category: "Fun", desc: "Pick a random member from the current voice or text channel", permission: "Everyone", syntax: "/randomuser" },
  { name: "reply", category: "Fun", desc: "Send anonymous response through bot channel proxy", permission: "Everyone", syntax: "/reply message:[text]" },
  { name: "review", category: "Fun", desc: "Submit a public rating and review for the server", permission: "Everyone", syntax: "/review rating:[5] text:[text]" }
];

export function CommandsDirectory() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Security", "Voice & Music", "Economy & XP", "Community", "Giveaways", "Utility", "Fun"];

  const filtered = ALL_COMMANDS.filter((cmd) => {
    const matchesCategory = selectedCategory === "All" || cmd.category === selectedCategory;
    const matchesSearch = cmd.name.toLowerCase().includes(search.toLowerCase()) || 
                          cmd.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-white text-black font-semibold"
                  : "bg-[#0a0a0a] text-neutral-400 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search 111 commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30 font-mono transition-colors"
          />
        </div>
      </div>

      {/* Commands Table / Cards */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/10 text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
          <div className="col-span-3">Command</div>
          <div className="col-span-5">Description</div>
          <div className="col-span-2 hidden sm:block">Category</div>
          <div className="col-span-2 text-right">Permission</div>
        </div>

        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500 font-mono">
              No commands found matching &quot;{search}&quot;
            </div>
          ) : (
            filtered.map((cmd) => (
              <div
                key={cmd.name}
                className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors text-xs group"
              >
                <div className="col-span-3 flex items-center gap-2">
                  <span className="font-mono text-white font-medium">/{cmd.name}</span>
                </div>
                <div className="col-span-5 text-neutral-400 text-xs pr-4 truncate">
                  {cmd.desc}
                </div>
                <div className="col-span-2 hidden sm:block">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-white/10 text-neutral-400">
                    {cmd.category}
                  </span>
                </div>
                <div className="col-span-4 sm:col-span-2 text-right text-[11px] font-mono text-neutral-500 truncate">
                  {cmd.permission}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-500 font-mono pt-2">
        <span>Showing {filtered.length} of {ALL_COMMANDS.length} commands</span>
        <span>Obsidian Noir Aesthetic · Accent #0e0d0d</span>
      </div>
    </div>
  );
}
