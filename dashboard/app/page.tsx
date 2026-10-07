'use client';

import React, { useState } from 'react';
import { COMMANDS_DATA, BotCommand } from '../data/commands';

const GITHUB_REPO_URL = 'https://github.com/carbonthecoder/prometheus-core';

const RADIO_STATIONS = [
  { id: 'lofi', name: 'Lofi Girl', genre: 'Chill Beats' },
  { id: 'chillhop', name: 'ChillHop', genre: 'Jazz & Beats' },
  { id: 'synthwave', name: 'Synthwave', genre: '80s Retro' },
  { id: 'cyberpunk', name: 'Cyberpunk', genre: 'Electro' },
  { id: 'anime', name: 'Anime Lofi', genre: 'Japanese Lofi' },
  { id: 'gaming', name: 'Gaming Beats', genre: 'EDM / Bass' },
  { id: 'jazz', name: 'Jazz Club', genre: 'Smooth Jazz' },
  { id: 'classical', name: 'Classical', genre: 'Orchestral' }
];

export default function App() {
  // Command Search & Filter
  const [cmdSearch, setCmdSearch] = useState('');
  const [cmdCategoryFilter, setCmdCategoryFilter] = useState('All');
  const [copiedCmd, setCopiedCmd] = useState('');
  const [copiedClone, setCopiedClone] = useState(false);

  // Interactive Demo Simulator State (Pure Client-side, No Network calls)
  const [demoStation, setDemoStation] = useState('lofi');
  const [demoVolume, setDemoVolume] = useState(80);
  const [demoEmbedTitle, setDemoEmbedTitle] = useState('Welcome to Prometheus Core');
  const [demoEmbedDesc, setDemoEmbedDesc] = useState('Fully customizable open-source Discord bot hosted on your own server.');
  const [demoEmbedColor, setDemoEmbedColor] = useState('#ffffff');
  
  const [demoToggles, setDemoToggles] = useState({
    antiRaid: true,
    blockInvites: true,
    tickets: true,
    leveling: true,
    economy: true,
    auditLogging: true,
    joinToCreate: true,
    aiAssistant: true
  });

  const categories = ['All', ...Array.from(new Set(COMMANDS_DATA.map(c => c.category)))];

  const filteredCommands = COMMANDS_DATA.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(cmdSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(cmdSearch.toLowerCase());
    const matchesCategory = cmdCategoryFilter === 'All' || c.category === cmdCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string, isCommand = true) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      if (isCommand) {
        setCopiedCmd(text);
        setTimeout(() => setCopiedCmd(''), 2000);
      } else {
        setCopiedClone(true);
        setTimeout(() => setCopiedClone(false), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* 1. Vercel Top Navigation Bar */}
      <header className="h-16 border-b border-white/10 px-6 md:px-12 flex items-center justify-between bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-white text-black flex items-center justify-center font-bold text-sm tracking-tighter">
            ▲
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm tracking-tight">Prometheus</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-white/10">
              v2.0.0 • Open Source
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-normal text-neutral-400">
          <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
          <a href="#commands" className="hover:text-white transition-colors duration-150">
            Commands <span className="font-mono text-[10px] text-neutral-500">({COMMANDS_DATA.length})</span>
          </a>
          <a href="#self-host" className="hover:text-white transition-colors duration-150">Self-Hosting</a>
          <a href="#preview" className="hover:text-white transition-colors duration-150">System Demo</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>GitHub</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative py-24 px-6 text-center max-w-4xl mx-auto flex flex-col items-center vercel-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 border border-white/10 text-xs text-neutral-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span className="font-mono text-[11px] tracking-tight">SELF-HOSTED DISCORD BOT • 93 SLASH COMMANDS • OFFLINE FIRST</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-medium text-white tracking-tight leading-[1.15]">
          Your private Discord bot. <br />
          Built for self-hosted precision.
        </h1>

        <p className="mt-6 text-base md:text-lg text-neutral-400 max-w-2xl font-light leading-relaxed">
          Prometheus Core is a fully open-source Discord bot platform. Clone the codebase, host it privately on your own hardware or VPS, and keep your data, tokens, and community completely under your control.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <span>Clone Repository on GitHub</span>
            <span>↗</span>
          </a>
          
          <a
            href="#self-host"
            className="px-6 py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-2"
          >
            <span>Self-Hosting Guide</span>
            <span>↓</span>
          </a>
        </div>

        {/* 1-Click Terminal Snippet */}
        <div className="mt-10 w-full max-w-xl text-left">
          <div className="rounded-lg bg-neutral-950 border border-white/10 p-3.5 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2 text-neutral-300 overflow-x-auto whitespace-nowrap">
              <span className="text-neutral-500 select-none">$</span>
              <span>git clone https://github.com/carbonthecoder/prometheus-core.git</span>
            </div>
            <button
              onClick={() => copyToClipboard('git clone https://github.com/carbonthecoder/prometheus-core.git', false)}
              className="ml-3 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-white transition-colors shrink-0 text-[11px]"
              title="Copy clone command"
            >
              {copiedClone ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Realtime Telemetry & Spec Strip */}
      <section className="border-y border-white/10 bg-neutral-950/60 py-6 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 text-center font-mono">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">Slash Commands</div>
            <div className="text-base font-semibold text-white mt-1">{COMMANDS_DATA.length} Commands</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">Architecture</div>
            <div className="text-base font-semibold text-neutral-300 mt-1">Modular Handlers</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">Radio Audio</div>
            <div className="text-base font-semibold text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>8 HD Streams</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">Deployment</div>
            <div className="text-base font-semibold text-white mt-1">Docker / Node.js</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">License</div>
            <div className="text-base font-semibold text-neutral-300 mt-1">Open Source</div>
          </div>
        </div>
      </section>

      {/* 4. Feature Matrix */}
      <section id="features" className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight">Enterprise Infrastructure for Your Discord Server</h2>
          <p className="text-xs text-neutral-400 mt-2 font-mono">Every system runs directly in your private bot instance without third-party paywalls.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tag: 'SECURITY', title: 'AutoMod & Anti-Raid', desc: 'Instant raid mitigation, mass invite filters, spam caps, and automated timeout penalties.' },
            { tag: 'AUDIO', title: '24/7 HD Music Radio', desc: '8 crystal-clear non-stop audio streams including Lofi Girl, Cyberpunk, Synthwave, and Jazz.' },
            { tag: 'SUPPORT', title: 'Support Ticket System', desc: 'Private ticketing channels with category triage, staff permissions, and transcript logs.' },
            { tag: 'ENGAGEMENT', title: 'Leveling & XP Rewards', desc: 'Dynamic XP points awarded per message, customizable tier roles, and rank cards.' },
            { tag: 'ECONOMY', title: 'Virtual Economy System', desc: 'Server wallets, bank deposits, daily payouts, gambling mini-games, and custom items.' },
            { tag: 'BROADCAST', title: 'Rich Embed Builder', desc: 'Create and dispatch Discord embeds with color pickers, markdown preview, and channel dispatch.' },
            { tag: 'VOICE', title: 'Dynamic Join-To-Create', desc: 'Auto-generating voice hubs that spawn temporary private channels and clean up on exit.' },
            { tag: 'AUDIT', title: 'Audit Incident Logging', desc: 'Real-time telemetry for deleted messages, role assignments, kicks, bans, and voice logs.' },
            { tag: 'AI & TOOLS', title: 'Neural AI & Utility', desc: 'Built-in Gemini AI conversation, image generation, math solver, and 93 slash commands.' }
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-lg bg-neutral-950 border border-white/10 hover:border-white/20 transition-all group">
              <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-2 group-hover:text-neutral-300 transition-colors">
                {f.tag}
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">{f.title}</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Slash Commands Explorer */}
      <section id="commands" className="py-20 px-6 md:px-12 max-w-6xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-medium text-white tracking-tight">Slash Commands Registry</h2>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Showing {filteredCommands.length} of {COMMANDS_DATA.length} commands. Click any command to copy.
            </p>
          </div>
          <input
            type="text"
            placeholder="Search /command or keyword..."
            value={cmdSearch}
            onChange={(e) => setCmdSearch(e.target.value)}
            className="bg-neutral-950 border border-white/10 rounded-md px-3.5 py-2 text-xs text-white w-full md:w-72 outline-none focus:border-white/30 transition-colors placeholder:text-neutral-600 font-mono"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCmdCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                cmdCategoryFilter === cat
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Commands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
          {filteredCommands.map((cmd) => {
            const isJustCopied = copiedCmd === `/${cmd.name}`;
            return (
              <div 
                key={cmd.name} 
                onClick={() => copyToClipboard(`/${cmd.name}`)}
                className="p-3.5 rounded-md bg-neutral-950 border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
                title="Click to copy command"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white font-mono group-hover:text-emerald-400 transition-colors">
                    /{cmd.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono border border-white/5">
                      {cmd.category}
                    </span>
                    {isJustCopied && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-2 font-light line-clamp-2 leading-relaxed">
                  {cmd.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Self-Hosting Guide */}
      <section id="self-host" className="py-20 px-6 md:px-12 max-w-5xl mx-auto border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight">How to Self-Host Prometheus</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Run your bot in under 3 minutes on any Linux VPS, Docker container, or local machine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg bg-neutral-950 border border-white/10 space-y-3">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">STEP 1</div>
            <h3 className="text-sm font-semibold text-white">Clone the Repository</h3>
            <p className="text-xs text-neutral-400 font-light">
              Clone the core repository and navigate to the bot directory:
            </p>
            <pre className="p-3 rounded bg-black border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto">
              <code>git clone https://github.com/carbonthecoder/prometheus-core.git<br/>cd prometheus-core/bot/TitanBot-main</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg bg-neutral-950 border border-white/10 space-y-3">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">STEP 2</div>
            <h3 className="text-sm font-semibold text-white">Install Node.js Dependencies</h3>
            <p className="text-xs text-neutral-400 font-light">
              Install required libraries with npm (requires Node.js 18 or higher):
            </p>
            <pre className="p-3 rounded bg-black border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto">
              <code>npm install</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg bg-neutral-950 border border-white/10 space-y-3">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">STEP 3</div>
            <h3 className="text-sm font-semibold text-white">Configure Environment (.env)</h3>
            <p className="text-xs text-neutral-400 font-light">
              Provide your Discord Developer Bot Token and Client ID:
            </p>
            <pre className="p-3 rounded bg-black border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto">
              <code>TOKEN=your_bot_token_here<br/>CLIENT_ID=your_client_id_here<br/>MONGO_URI=mongodb://...</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg bg-neutral-950 border border-white/10 space-y-3">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">STEP 4</div>
            <h3 className="text-sm font-semibold text-white">Launch the Bot</h3>
            <p className="text-xs text-neutral-400 font-light">
              Start the bot with PM2 or node directly:
            </p>
            <pre className="p-3 rounded bg-black border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto">
              <code>npm start<br/># Or run with PM2 for 24/7 background:<br/>pm2 start src/index.js --name prometheus</code>
            </pre>
          </div>
        </div>
      </section>

      {/* 7. Interactive Feature Playground / Simulator */}
      <section id="preview" className="py-20 px-6 md:px-12 max-w-5xl mx-auto border-t border-white/10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-medium text-white tracking-tight">Interactive Bot Feature Preview</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Test and preview bot modules right here in your browser.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card A: 24/7 HD Radio Station Selector */}
          <div className="p-6 rounded-lg bg-neutral-950 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">24/7 HD Radio Streams</h3>
                <p className="text-xs text-neutral-400 font-mono">8 streams playing continuously in voice</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                ● Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {RADIO_STATIONS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setDemoStation(st.id)}
                  className={`p-2.5 rounded text-left transition-colors text-xs font-mono border ${
                    demoStation === st.id
                      ? 'bg-neutral-900 border-white text-white'
                      : 'bg-black border-white/10 text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-white">{st.name}</div>
                  <div className="text-[10px] text-neutral-500">{st.genre}</div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded bg-black border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Volume: {demoVolume}%</span>
              <input
                type="range"
                min="10"
                max="100"
                value={demoVolume}
                onChange={(e) => setDemoVolume(Number(e.target.value))}
                className="accent-white cursor-pointer w-32"
              />
            </div>
          </div>

          {/* Card B: Discord Embed Broadcaster */}
          <div className="p-6 rounded-lg bg-neutral-950 border border-white/10 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Rich Embed Generator</h3>
              <p className="text-xs text-neutral-400 font-mono">Dispatched by /embedbuilder</p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={demoEmbedTitle}
                onChange={(e) => setDemoEmbedTitle(e.target.value)}
                placeholder="Embed title..."
                className="w-full bg-black border border-white/10 rounded p-2 text-xs text-white outline-none font-mono"
              />
              <textarea
                rows={2}
                value={demoEmbedDesc}
                onChange={(e) => setDemoEmbedDesc(e.target.value)}
                placeholder="Embed description..."
                className="w-full bg-black border border-white/10 rounded p-2 text-xs text-white outline-none font-mono"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400">Color:</span>
                <input
                  type="color"
                  value={demoEmbedColor}
                  onChange={(e) => setDemoEmbedColor(e.target.value)}
                  className="w-8 h-6 bg-transparent cursor-pointer rounded"
                />
              </div>
            </div>

            {/* Embed Preview */}
            <div className="p-3.5 rounded bg-neutral-900/90 border-l-4" style={{ borderLeftColor: demoEmbedColor }}>
              <div className="text-xs font-semibold text-white">{demoEmbedTitle || 'Title'}</div>
              <div className="text-xs text-neutral-300 font-light mt-1 whitespace-pre-wrap">{demoEmbedDesc || 'Description'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Vercel Style Footer */}
      <footer className="mt-auto border-t border-white/10 py-12 px-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white">▲</span>
            <span className="text-neutral-300 font-sans font-semibold">Prometheus Core</span>
            <span>—</span>
            <span>Self-Hosted Discord Bot Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub Repository ↗
            </a>
            <a href="#commands" className="hover:text-white transition-colors">
              Commands
            </a>
            <a href="#self-host" className="hover:text-white transition-colors">
              Self-Host
            </a>
          </div>
        </div>
        <div className="mt-6 text-[11px] text-neutral-600">
          Designed with the Vercel design system. Open source under MIT license.
        </div>
      </footer>
    </div>
  );
}
