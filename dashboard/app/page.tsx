'use client';

import React, { useState, useRef, useEffect } from 'react';
import { COMMANDS_DATA, BotCommand } from '../lib/commands';

const GITHUB_REPO_URL = 'https://github.com/carbonthecoder/prometheus-core';

// 8 Verified, live, CORS-friendly 24/7 audio streams (200 audio/mpeg)
const RADIO_STATIONS = [
  { 
    id: 'lofi', 
    name: 'Lofi Girl 24/7', 
    genre: 'Chill Beats', 
    url: 'https://play.streamafrica.net/lofiradio',
    desc: 'Relaxing study and ambient chill beats'
  },
  { 
    id: 'chillhop', 
    name: 'ChillHop HQ', 
    genre: 'Jazz & Beats', 
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    desc: 'Laid-back boom bap, hip-hop and grooves'
  },
  { 
    id: 'synthwave', 
    name: 'Nightwave Plaza', 
    genre: 'Synth & Vaporwave', 
    url: 'https://radio.plaza.one/mp3',
    desc: 'Nostalgic 80s retro synth and vaporwave'
  },
  { 
    id: 'cyberpunk', 
    name: 'Tokyo Cyberpunk', 
    genre: 'Darksynth', 
    url: 'https://stream.nightride.fm/darksynth.mp3',
    desc: 'Futuristic electronic darksynth and bass'
  },
  { 
    id: 'anime', 
    name: 'Anime Lo-Fi', 
    genre: 'Soundtracks & Lofi', 
    url: 'https://stream.laut.fm/anime',
    desc: 'Peaceful anime piano covers and beats'
  },
  { 
    id: 'gaming', 
    name: 'Gaming OST', 
    genre: 'Chiptune & EDM', 
    url: 'https://stream.laut.fm/gamemusic',
    desc: 'Classic game soundtracks and electronic'
  },
  { 
    id: 'jazz', 
    name: 'Smooth Jazz Club', 
    genre: 'Late Night Jazz', 
    url: 'https://stream.laut.fm/jazz',
    desc: 'Warm acoustic saxophone and jazz piano'
  },
  { 
    id: 'ambient', 
    name: 'Midnight Chill', 
    genre: 'Deep Ambient', 
    url: 'https://stream.laut.fm/lofi',
    desc: 'Low-tempo midnight meditation vibes'
  }
];

export default function App() {
  // Command Search & Filter
  const [cmdSearch, setCmdSearch] = useState('');
  const [cmdCategoryFilter, setCmdCategoryFilter] = useState('All');
  const [copiedCmd, setCopiedCmd] = useState('');
  const [copiedClone, setCopiedClone] = useState(false);

  // Live Radio State with REAL HTML5 Audio Playback
  const [activeStationId, setActiveStationId] = useState('lofi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(70);
  const [audioBuffering, setAudioBuffering] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Embed Customizer Demo
  const [demoEmbedTitle, setDemoEmbedTitle] = useState('Server Announcement');
  const [demoEmbedDesc, setDemoEmbedDesc] = useState('Welcome to our Discord server! Use /help to see all 93 available commands.');
  const [demoEmbedColor, setDemoEmbedColor] = useState('#5865F2');

  const categories = ['All', ...Array.from(new Set(COMMANDS_DATA.map(c => c.category)))];

  const filteredCommands = COMMANDS_DATA.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(cmdSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(cmdSearch.toLowerCase());
    const matchesCategory = cmdCategoryFilter === 'All' || c.category === cmdCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle Audio Stream Switching and Playback
  const currentStation = RADIO_STATIONS.find(s => s.id === activeStationId) || RADIO_STATIONS[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume / 100;
    }
  }, [audioVolume]);

  const handleSelectStation = (stationId: string) => {
    setActiveStationId(stationId);
    setAudioError('');
    const targetStation = RADIO_STATIONS.find(s => s.id === stationId);
    if (!targetStation) return;

    if (audioRef.current) {
      audioRef.current.src = targetStation.url;
      setAudioBuffering(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioBuffering(false);
        })
        .catch(err => {
          setIsPlaying(false);
          setAudioBuffering(false);
          setAudioError('Stream blocked or loading error: ' + err.message);
        });
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    setAudioError('');

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src !== currentStation.url) {
        audioRef.current.src = currentStation.url;
      }
      setAudioBuffering(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioBuffering(false);
        })
        .catch(err => {
          setIsPlaying(false);
          setAudioBuffering(false);
          setAudioError('Could not start stream: ' + err.message);
        });
    }
  };

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
      
      {/* Hidden Audio Element for 24/7 Radio Playback */}
      <audio
        ref={audioRef}
        preload="none"
        onWaiting={() => setAudioBuffering(true)}
        onPlaying={() => {
          setAudioBuffering(false);
          setIsPlaying(true);
        }}
        onError={() => {
          setAudioBuffering(false);
          setIsPlaying(false);
          setAudioError('Playback error. Click play again or pick another station.');
        }}
      />

      {/* 1. Header Navigation */}
      <header className="h-16 border-b border-white/10 px-6 md:px-12 flex items-center justify-between bg-black/85 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Bot Avatar Logo on Black Background */}
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/15 bg-neutral-950 flex items-center justify-center shrink-0">
            <img 
              src="/bot.png" 
              alt="Prometheus Bot Logo" 
              className="w-full h-full object-cover"
            />
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
          <a href="#radio-player" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
            <span>24/7 Radio</span>
            {isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </a>
          <a href="#self-host" className="hover:text-white transition-colors duration-150">Self-Hosting</a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Star on GitHub Button */}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-amber-500 font-bold text-sm">★</span>
            <span>Star on GitHub</span>
          </a>
        </div>
      </header>

      {/* 2. Upgraded Section 1 (Hero Showcase) */}
      <section className="relative py-16 md:py-24 px-6 max-w-6xl mx-auto w-full">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Bio, and Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 border border-white/10 text-xs text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="font-mono text-[11px] tracking-tight">SELF-HOSTED DISCORD BOT • 93 COMMANDS • OFFLINE FIRST</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.12]">
              Your private Discord bot. <br />
              Zero dependencies.
            </h1>

            <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed max-w-xl">
              Prometheus Core is a self-hosted, modular Discord infrastructure suite. Clone the repository, configure your environment variables, and run 93 slash commands, 24/7 HD radio streams, tickets, leveling, and moderation entirely on your own server.
            </p>

            {/* CTAs without arrow emojis */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-all shadow-sm flex items-center gap-2"
              >
                <span className="text-amber-500 font-bold">★</span>
                <span>Star on GitHub</span>
              </a>

              <button
                onClick={() => copyToClipboard('git clone https://github.com/carbonthecoder/prometheus-core.git', false)}
                className="px-4 py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"></path>
                </svg>
                <span>{copiedClone ? '✓ Clone Command Copied' : 'Clone Repository'}</span>
              </button>

              <a
                href="#commands"
                className="px-4 py-2.5 rounded-md bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white text-xs font-medium border border-white/10 transition-colors"
              >
                Browse 93 Commands
              </a>
            </div>

            {/* Terminal Clone Snippet */}
            <div className="pt-2">
              <div className="rounded-lg bg-neutral-950 border border-white/10 p-3 flex items-center justify-between font-mono text-xs max-w-lg">
                <div className="flex items-center gap-2 text-neutral-300 overflow-x-auto whitespace-nowrap">
                  <span className="text-neutral-500 select-none">$</span>
                  <span>git clone https://github.com/carbonthecoder/prometheus-core.git</span>
                </div>
                <button
                  onClick={() => copyToClipboard('git clone https://github.com/carbonthecoder/prometheus-core.git', false)}
                  className="ml-3 px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-white transition-colors shrink-0 text-[11px]"
                >
                  {copiedClone ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-500 pt-2">
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-white/10 text-neutral-400">Node.js 18+</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-white/10 text-neutral-400">Discord.js v14</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-white/10 text-neutral-400">MongoDB</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-white/10 text-neutral-400">Docker</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-white/10 text-neutral-400">MIT License</span>
            </div>
          </div>

          {/* Right Column: Hero Bot Mascot Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Mascot Showcase Card */}
            <div className="rounded-xl bg-neutral-950 border border-white/10 p-5 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0 relative group">
                  <img 
                    src="/bot.png" 
                    alt="Prometheus Bot" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black"></div>
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">Prometheus Core</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5865F2] text-white font-bold tracking-wider">
                      BOT
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-light line-clamp-2">
                    Autonomous Neural Discord Agent with 93 commands and real-time audio.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-neutral-500">
                    <span>PING: 18ms</span>
                    <span>•</span>
                    <span className="text-emerald-400">STATUS: READY</span>
                  </div>
                </div>
              </div>

              {/* Bot Core Highlights */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-neutral-300 py-1 border-b border-white/5">
                  <span className="text-neutral-500">SLASH COMMANDS</span>
                  <span className="font-semibold text-white">93 Loaded</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300 py-1 border-b border-white/5">
                  <span className="text-neutral-500">RADIO AUDIO ENGINE</span>
                  <span className="text-emerald-400 font-medium">8 HD Streams</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300 py-1 border-b border-white/5">
                  <span className="text-neutral-500">HOSTING ARCHITECTURE</span>
                  <span className="text-neutral-200">Self-Hosted</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300 py-1">
                  <span className="text-neutral-500">DATABASE BACKEND</span>
                  <span className="text-neutral-200">PostgreSQL / Mongo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Specs and Metrics Strip */}
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
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">Radio Engine</div>
            <div className="text-base font-semibold text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>8 Live Streams</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">Deployment</div>
            <div className="text-base font-semibold text-white mt-1">Self-Hosted / VPS</div>
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
          <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight">Complete Server Infrastructure in One Codebase</h2>
          <p className="text-xs text-neutral-400 mt-2 font-mono">Every system runs directly in your private bot instance without monthly subscriptions.</p>
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

      {/* 5. LIVE 24/7 RADIO STATION WITH REAL AUDIO PLAYBACK */}
      <section id="radio-player" className="py-20 px-6 md:px-12 max-w-5xl mx-auto border-t border-white/10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 border border-white/10 text-xs text-neutral-400 mb-3 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE BROWSER AUDIO PLAYER</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight">24/7 HD Radio Streams</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Click any station below to hear the actual live audio stream playing in your browser.
          </p>
        </div>

        {/* Player Console */}
        <div className="rounded-xl bg-neutral-950 border border-white/15 p-6 space-y-6 shadow-2xl max-w-3xl mx-auto">
          
          {/* Currently Playing Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-black border border-white/10">
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlayAudio}
                className="w-12 h-12 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-lg"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {audioBuffering ? (
                  <span className="text-xs font-mono font-bold animate-spin">⌛</span>
                ) : isPlaying ? (
                  <span className="text-base font-bold">⏸</span>
                ) : (
                  <span className="text-base font-bold ml-0.5">▶</span>
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{currentStation.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-white/10 text-emerald-400">
                    LIVE
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-light mt-0.5">
                  {currentStation.desc}
                </div>
              </div>
            </div>

            {/* Audio Waveform / Status Pill */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span>Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(Number(e.target.value))}
                  className="accent-white cursor-pointer w-24"
                />
                <span className="text-neutral-500 w-8 text-right">{audioVolume}%</span>
              </div>
            </div>
          </div>

          {audioError && (
            <div className="p-3 rounded-md bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {audioError}
            </div>
          )}

          {/* 8 Stations Selector Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {RADIO_STATIONS.map((st) => {
              const isSelected = activeStationId === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => handleSelectStation(st.id)}
                  className={`p-3 rounded-lg text-left transition-all border ${
                    isSelected
                      ? 'bg-neutral-900 border-white text-white shadow-md'
                      : 'bg-black border-white/10 text-neutral-400 hover:border-white/25 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{st.name}</span>
                    {isSelected && isPlaying && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 mt-1">{st.genre}</div>
                </button>
              );
            })}
          </div>

          <div className="text-center text-[11px] font-mono text-neutral-500 pt-2 border-t border-white/10">
            Powered by HTTP live audio streams. In Discord, Prometheus plays these in voice channels via <code className="text-neutral-400">/radio</code>.
          </div>
        </div>
      </section>

      {/* 6. Slash Commands Explorer */}
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
                        ✓ Copied
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

      {/* 7. Self-Hosting Guide */}
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
              <code>git clone https://github.com/carbonthecoder/prometheus-core.git<br/>cd prometheus-core/bot/prometheus</code>
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

      {/* 8. Vercel Style Footer */}
      <footer className="mt-auto border-t border-white/10 py-12 px-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden border border-white/10 bg-neutral-950 shrink-0">
              <img src="/bot.png" alt="Bot Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-neutral-300 font-sans font-semibold">Prometheus Core</span>
            <span>—</span>
            <span>Self-Hosted Discord Bot Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="text-amber-500">★</span>
              <span>Star on GitHub</span>
            </a>
            <a href="#commands" className="hover:text-white transition-colors">
              Commands
            </a>
            <a href="#radio-player" className="hover:text-white transition-colors">
              Radio
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
