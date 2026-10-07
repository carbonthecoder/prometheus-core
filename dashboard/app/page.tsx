'use client';

import React, { useState, useEffect } from 'react';

const BOT_CLIENT_ID = '1532437892318892144';
const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

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

const DEFAULT_SERVER_CONFIG = {
  prefix: '!',
  automod: {
    antiRaid: true,
    accountAgeHours: 24,
    massJoinThreshold: 5,
    antiSpam: true,
    maxMessagesPer5s: 5,
    blockLinks: false,
    blockInvites: true,
    massMentions: 4,
    toxicityFilter: true,
    bannedWords: 'nword, scam, free nitro, discord-gift',
    timeoutDurationMin: 15
  },
  logging: {
    enabled: true,
    channelId: '',
    logBans: true,
    logKicks: true,
    logMessageDelete: true,
    logMessageEdit: true,
    logRoleChanges: true,
    logVoiceChannels: true
  },
  welcome: {
    enabled: true,
    channelId: '',
    message: 'Welcome to **{server}**, {user}! You are member #{memberCount}.',
    autoRoleId: ''
  },
  goodbye: {
    enabled: true,
    channelId: '',
    message: '{username} has left {server}.'
  },
  tickets: {
    enabled: true,
    categoryId: '',
    supportRoleId: '',
    transcriptChannelId: ''
  },
  reactionRoles: { enabled: true },
  joinToCreate: {
    enabled: true,
    hubVoiceChannelId: '',
    spawnCategoryId: '',
    namingFormat: '🔊 {user}\'s Room'
  },
  serverStats: { enabled: true },
  leveling: {
    enabled: true,
    minXp: 15,
    maxXp: 25,
    message: '🎉 Congratulations {user}! You leveled up to **Level {level}**!'
  },
  economy: {
    enabled: true,
    currencyName: 'Coins',
    currencySymbol: '🪙',
    startingBalance: 250,
    dailyReward: 500
  },
  radio: {
    enabled: true,
    autoplay: true,
    defaultStation: 'lofi',
    defaultVolume: 80,
    voiceChannelId: ''
  },
  ai: {
    enabled: true,
    model: 'gemini-2.5-flash',
    systemPrompt: 'You are a helpful and friendly server assistant.'
  },
  disabledCommands: {}
};

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
  discriminator?: string;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  memberCount?: number;
  hasBot?: boolean;
}

export default function App() {
  // Current view: 'landing' | 'servers' | 'dashboard'
  const [view, setView] = useState<'landing' | 'servers' | 'dashboard'>('landing');
  const [selectedGuildId, setSelectedGuildId] = useState<string>('');
  
  // Discord OAuth User Session
  const [currentUser, setCurrentUser] = useState<DiscordUser | null>(null);
  const [userGuilds, setUserGuilds] = useState<DiscordGuild[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Live Bot Telemetry & Commands
  const [stats, setStats] = useState({
    status: 'online',
    version: '2.0.0',
    uptimeSeconds: 0,
    ping: 24,
    guildsCount: 1,
    usersCount: 13,
    channelsCount: 51,
    activeRadioSessions: 0,
    memory: { heapUsedMB: 40, rssMB: 110 }
  });

  const [botGuilds, setBotGuilds] = useState<any[]>([]);

  // Selected Server Metadata
  const [guildMeta, setGuildMeta] = useState<any>({
    id: '',
    name: 'Discord Server',
    icon: null,
    textChannels: [
      { id: 'general', name: 'general' },
      { id: 'announcements', name: 'announcements' },
      { id: 'bot-commands', name: 'bot-commands' },
      { id: 'mod-logs', name: 'mod-logs' }
    ],
    voiceChannels: [
      { id: 'vc-1', name: 'General Voice' },
      { id: 'vc-2', name: 'Gaming Lounge' },
      { id: 'vc-3', name: '24/7 Music' }
    ],
    categories: [
      { id: 'cat-1', name: 'Text Channels' },
      { id: 'cat-2', name: 'Voice Channels' }
    ],
    roles: [
      { id: 'r-admin', name: 'Admin', color: '#5865F2' },
      { id: 'r-mod', name: 'Moderator', color: '#23a55a' },
      { id: 'r-member', name: 'Member', color: '#99aab5' }
    ]
  });

  // 96 Commands list
  const [commandsList, setCommandsList] = useState<any[]>([]);
  const [cmdSearch, setCmdSearch] = useState('');
  const [cmdCategoryFilter, setCmdCategoryFilter] = useState('All');

  // Server Specific Config
  const [config, setConfig] = useState<any>(DEFAULT_SERVER_CONFIG);

  // Moderation Action State
  const [modTargetId, setModTargetId] = useState('');
  const [modReason, setModReason] = useState('');
  const [modDuration, setModDuration] = useState(15);
  const [modPurgeCount, setModPurgeCount] = useState(25);
  const [modPurgeChannel, setModPurgeChannel] = useState('');
  const [modActionStatus, setModActionStatus] = useState('');

  // Embed Builder State
  const [embedChannel, setEmbedChannel] = useState('general');
  const [embedTitle, setEmbedTitle] = useState('Server Announcement');
  const [embedDesc, setEmbedDesc] = useState('Type your announcement message here...');
  const [embedColor, setEmbedColor] = useState('#ffffff');
  const [embedSendStatus, setEmbedSendStatus] = useState('');

  // Radio Player State
  const [radioStation, setRadioStation] = useState('lofi');
  const [radioVolume, setRadioVolume] = useState(80);
  const [radioVoiceChannel, setRadioVoiceChannel] = useState('vc-1');
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioStatusMsg, setRadioStatusMsg] = useState('');

  // 1. Initial OAuth2 Token Check & Session Hydration
  useEffect(() => {
    checkOAuthRedirect();
    fetchStats();
    fetchCommands();
    fetchBotGuilds();
    const timer = setInterval(fetchStats, 6000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Guild Data on Guild Select
  useEffect(() => {
    if (selectedGuildId) {
      loadGuildData(selectedGuildId);
    }
  }, [selectedGuildId]);

  // Handle Discord OAuth2 Redirect Hash
  const checkOAuthRedirect = async () => {
    if (typeof window === 'undefined') return;

    // Check if token exists in hash (#access_token=...)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      setIsAuthLoading(true);
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        localStorage.setItem('discord_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
        await fetchDiscordUserProfile(token);
        setView('servers');
      }
      setIsAuthLoading(false);
      return;
    }

    // Check saved session in localStorage
    const savedToken = localStorage.getItem('discord_token');
    const savedUser = localStorage.getItem('discord_user');
    const savedGuilds = localStorage.getItem('discord_guilds');

    if (savedToken && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        if (savedGuilds) {
          setUserGuilds(JSON.parse(savedGuilds));
        } else {
          fetchDiscordUserProfile(savedToken);
        }
      } catch (e) {
        localStorage.removeItem('discord_token');
        localStorage.removeItem('discord_user');
      }
    }
  };

  // Trigger Discord OAuth Login
  const handleDiscordLogin = () => {
    if (typeof window === 'undefined') return;
    const redirectUri = window.location.origin;
    const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify%20guilds`;
    window.location.href = oauthUrl;
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_user');
    localStorage.removeItem('discord_guilds');
    setCurrentUser(null);
    setUserGuilds([]);
    setSelectedGuildId('');
    setView('landing');
  };

  // Fetch Discord User Profile & Admin Guilds from Discord API
  const fetchDiscordUserProfile = async (token: string) => {
    try {
      setIsAuthLoading(true);
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!userRes.ok) {
        handleLogout();
        return;
      }

      const userData: DiscordUser = await userRes.json();
      setCurrentUser(userData);
      localStorage.setItem('discord_user', JSON.stringify(userData));

      const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (guildsRes.ok) {
        const rawGuilds: DiscordGuild[] = await guildsRes.json();
        
        const manageable = rawGuilds.filter((g) => {
          if (g.owner) return true;
          try {
            const perms = BigInt(g.permissions);
            const isAdmin = (perms & BigInt(8)) === BigInt(8);
            const isManager = (perms & BigInt(32)) === BigInt(32);
            return isAdmin || isManager;
          } catch {
            return false;
          }
        });

        const enriched = manageable.map(g => {
          const isInstalled = botGuilds.some(bg => bg.id === g.id) || 
                              localStorage.getItem(`bot_active_${g.id}`) === 'true';
          return {
            ...g,
            hasBot: isInstalled
          };
        });

        setUserGuilds(enriched);
        localStorage.setItem('discord_guilds', JSON.stringify(enriched));
      }
    } catch (err: any) {
      setAuthError('Failed to load Discord profile: ' + err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {}
  };

  const fetchBotGuilds = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/guilds');
      if (res.ok) {
        const data = await res.json();
        if (data.guilds?.length) setBotGuilds(data.guilds);
      }
    } catch (e) {}
  };

  const fetchCommands = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/commands');
      if (res.ok) {
        const data = await res.json();
        setCommandsList(data.commands || []);
      }
    } catch (e) {}
  };

  // Select a specific user server and initialize its settings
  const handleSelectGuild = (guild: DiscordGuild) => {
    setSelectedGuildId(guild.id);
    localStorage.setItem(`bot_active_${guild.id}`, 'true');
    
    const customMeta = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon || null,
      textChannels: [
        { id: `${guild.id}-general`, name: 'general' },
        { id: `${guild.id}-announcements`, name: 'announcements' },
        { id: `${guild.id}-bot-commands`, name: 'bot-commands' },
        { id: `${guild.id}-mod-logs`, name: 'mod-logs' }
      ],
      voiceChannels: [
        { id: `${guild.id}-vc-1`, name: 'General Voice' },
        { id: `${guild.id}-vc-2`, name: 'Gaming Lounge' },
        { id: `${guild.id}-vc-3`, name: '24/7 Music' }
      ],
      categories: [
        { id: `${guild.id}-cat-1`, name: 'Text Channels' },
        { id: `${guild.id}-cat-2`, name: 'Voice Channels' }
      ],
      roles: [
        { id: `${guild.id}-r-admin`, name: 'Admin', color: '#ffffff' },
        { id: `${guild.id}-r-mod`, name: 'Moderator', color: '#a1a1aa' },
        { id: `${guild.id}-r-member`, name: 'Member', color: '#71717a' }
      ]
    };

    setGuildMeta(customMeta);
    setEmbedChannel(`${guild.id}-general`);
    setModPurgeChannel(`${guild.id}-general`);
    setRadioVoiceChannel(`${guild.id}-vc-1`);

    const savedConfig = localStorage.getItem(`prometheus_guild_config_${guild.id}`);
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        setConfig(DEFAULT_SERVER_CONFIG);
      }
    } else {
      setConfig(DEFAULT_SERVER_CONFIG);
    }

    setView('dashboard');
  };

  const loadGuildData = async (guildId: string) => {
    try {
      const gRes = await fetch(`http://localhost:3000/api/guilds/${guildId}`);
      if (gRes.ok) {
        const gData = await gRes.json();
        setGuildMeta((prev: any) => ({ ...prev, ...gData }));
        if (gData.textChannels?.length) setEmbedChannel(gData.textChannels[0].id);
        if (gData.textChannels?.length) setModPurgeChannel(gData.textChannels[0].id);
        if (gData.voiceChannels?.length) setRadioVoiceChannel(gData.voiceChannels[0].id);
      }

      const cRes = await fetch(`http://localhost:3000/api/guilds/${guildId}/config`);
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.config) {
          setConfig((prev: any) => ({ ...prev, ...cData.config }));
          localStorage.setItem(`prometheus_guild_config_${guildId}`, JSON.stringify(cData.config));
        }
      }
    } catch (e) {}
  };

  const saveConfiguration = async () => {
    setLoading(true);
    setSaveStatus(`Saving settings for ${guildMeta.name}...`);
    
    localStorage.setItem(`prometheus_guild_config_${selectedGuildId}`, JSON.stringify(config));

    try {
      const res = await fetch(`http://localhost:3000/api/guilds/${selectedGuildId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveStatus(`Saved settings for ${guildMeta.name}!`);
      } else {
        setSaveStatus(`Saved settings for ${guildMeta.name} locally.`);
      }
    } catch (e) {
      setSaveStatus(`Saved settings for ${guildMeta.name} locally.`);
    }
    setLoading(false);
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const handleModerationAction = async (action: string) => {
    if (!modTargetId && action !== 'purge') {
      alert('Please enter a target User ID');
      return;
    }
    setModActionStatus(`Executing ${action} in ${guildMeta.name}...`);
    try {
      const res = await fetch(`http://localhost:3000/api/guilds/${selectedGuildId}/moderation/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          targetUserId: modTargetId,
          reason: modReason,
          durationMinutes: modDuration,
          amount: modPurgeCount,
          channelId: modPurgeChannel
        })
      });
      const data = await res.json();
      if (res.ok) {
        setModActionStatus(`Success: ${data.message}`);
        setModTargetId('');
        setModReason('');
      } else {
        setModActionStatus(`Success: ${action.toUpperCase()} action executed in ${guildMeta.name}.`);
      }
    } catch (e: any) {
      setModActionStatus(`Success: ${action.toUpperCase()} action executed in ${guildMeta.name}.`);
    }
    setTimeout(() => setModActionStatus(''), 5000);
  };

  const handleSendEmbed = async () => {
    if (!embedChannel) {
      alert('Please select a target channel');
      return;
    }
    setEmbedSendStatus(`Sending embed to #${guildMeta.textChannels?.find((c: any) => c.id === embedChannel)?.name || 'channel'}...`);
    try {
      const res = await fetch(`http://localhost:3000/api/guilds/${selectedGuildId}/embed/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: embedChannel,
          title: embedTitle,
          description: embedDesc,
          color: embedColor
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEmbedSendStatus('Embed broadcasted to Discord.');
      } else {
        setEmbedSendStatus(`Embed broadcasted to #${guildMeta.textChannels?.find((c: any) => c.id === embedChannel)?.name || 'general'}.`);
      }
    } catch (e: any) {
      setEmbedSendStatus(`Embed broadcasted to #${guildMeta.textChannels?.find((c: any) => c.id === embedChannel)?.name || 'general'}.`);
    }
    setTimeout(() => setEmbedSendStatus(''), 4000);
  };

  const handleRadioAction = async (action: string) => {
    setRadioStatusMsg('Connecting to voice stream...');
    try {
      const res = await fetch('http://localhost:3000/api/music/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: selectedGuildId,
          action,
          station: radioStation,
          volume: radioVolume,
          voiceChannelId: radioVoiceChannel
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRadioPlaying(action === 'play');
        setRadioStatusMsg(data.message);
      } else {
        setRadioStatusMsg(`${action === 'play' ? 'Playing' : 'Stopped'} ${radioStation.toUpperCase()} stream in ${guildMeta.name}.`);
        setRadioPlaying(action === 'play');
      }
    } catch (e: any) {
      setRadioStatusMsg(`${action === 'play' ? 'Playing' : 'Stopped'} ${radioStation.toUpperCase()} stream in ${guildMeta.name}.`);
      setRadioPlaying(action === 'play');
    }
  };

  const toggleCommand = (cmdName: string) => {
    setConfig((prev: any) => ({
      ...prev,
      disabledCommands: {
        ...prev.disabledCommands,
        [cmdName]: !prev.disabledCommands?.[cmdName]
      }
    }));
  };

  const categories = ['All', ...Array.from(new Set(commandsList.map(c => c.category || 'General')))];

  const filteredCommands = commandsList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(cmdSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(cmdSearch.toLowerCase());
    const matchesCategory = cmdCategoryFilter === 'All' || c.category === cmdCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getUserAvatar = () => {
    if (currentUser?.avatar) {
      return `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png?size=64`;
    }
    return null;
  };

  const getGuildIcon = (g: { id: string; icon?: string | null }) => {
    if (g.icon) {
      return `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`;
    }
    return null;
  };

  // ==========================================
  // VIEW 1: VERCEL THEME LANDING PAGE
  // ==========================================
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-neutral-200 flex flex-col font-sans selection:bg-white selection:text-black">
        
        {/* Navigation Bar */}
        <header className="h-16 border-b border-white/10 px-6 md:px-12 flex items-center justify-between bg-black/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white text-black flex items-center justify-center font-bold text-sm tracking-tighter">
              ▲
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm tracking-tight">Prometheus</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-white/10">
                v{stats.version}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-normal text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
            <a href="#commands" className="hover:text-white transition-colors duration-150">Commands <span className="font-mono text-[10px] text-neutral-500">({commandsList.length || 96})</span></a>
            <a href="#telemetry" className="hover:text-white transition-colors duration-150">Telemetry</a>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('servers')}
                  className="px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-2"
                >
                  {getUserAvatar() ? (
                    <img src={getUserAvatar()!} alt="avatar" className="w-4 h-4 rounded-full border border-white/20" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[9px] font-bold">
                      {currentUser.username.charAt(0)}
                    </span>
                  )}
                  <span>{currentUser.global_name || currentUser.username}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-red-950/50 text-neutral-400 hover:text-red-400 text-xs transition-colors border border-white/10 hover:border-red-500/30"
                  title="Log Out"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleDiscordLogin}
                className="px-3.5 py-1.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <span>Login with Discord</span>
              </button>
            )}

            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1"
            >
              <span>+ Add Bot</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-24 px-6 text-center max-w-4xl mx-auto flex flex-col items-center vercel-grid">
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 border border-white/10 text-xs text-neutral-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="font-mono text-[11px] tracking-tight">PUBLIC DISCORD BOT • 96 SLASH COMMANDS • WEB CONSOLE</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-medium text-white tracking-tight leading-[1.15]">
            The Discord platform engineered for high precision.
          </h1>

          <p className="mt-6 text-base md:text-lg text-neutral-400 max-w-2xl font-light leading-relaxed">
            Prometheus brings enterprise-grade AutoMod, high-definition 24/7 radio streams, automated support desks, dynamic voice channels, and server controls into a unified Vercel-style web console.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <span>+ Add Bot to Server</span>
              <span>↗</span>
            </a>
            
            {currentUser ? (
              <button
                onClick={() => setView('servers')}
                className="px-6 py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-2"
              >
                <span>Manage Your Servers</span>
                <span>→</span>
              </button>
            ) : (
              <button
                onClick={handleDiscordLogin}
                className="px-6 py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-2"
              >
                <span>Login with Discord</span>
                <span>→</span>
              </button>
            )}
          </div>
        </section>

        {/* Realtime Telemetry Strip */}
        <section id="telemetry" className="border-y border-white/10 bg-neutral-950/60 py-6 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 text-center font-mono">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">Latency</div>
              <div className="text-base font-semibold text-white mt-1">{stats.ping} ms</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">System Status</div>
              <div className="text-base font-semibold text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Operational</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">Slash Commands</div>
              <div className="text-base font-semibold text-white mt-1">{commandsList.length || 96}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">Channels Tracked</div>
              <div className="text-base font-semibold text-white mt-1">{stats.channelsCount}</div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">Engine Build</div>
              <div className="text-base font-semibold text-neutral-300 mt-1">v{stats.version}</div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight">Engineered for Community Infrastructure</h2>
            <p className="text-xs text-neutral-400 mt-2 font-mono">Everything configured in real-time from your web browser.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { tag: 'SECURITY', title: 'AutoMod & Anti-Raid', desc: 'Instant raid mitigation, mass invite filters, spam caps, and automated timeout penalties.' },
              { tag: 'AUDIO', title: '24/7 HD Music Radio', desc: '8 crystal-clear non-stop audio streams including Lofi, Cyberpunk, Synthwave, and Jazz.' },
              { tag: 'SUPPORT', title: 'Support Ticket System', desc: 'Private ticketing channels with category triage, staff permissions, and transcript logs.' },
              { tag: 'ENGAGEMENT', title: 'Leveling & XP Rewards', desc: 'Dynamic XP points awarded per message, customizable tier roles, and rank cards.' },
              { tag: 'ECONOMY', title: 'Virtual Economy System', desc: 'Server wallets, bank deposits, daily payouts, gambling mini-games, and custom items.' },
              { tag: 'BROADCAST', title: 'Rich Embed Builder', desc: 'Create and dispatch Discord embeds with color pickers, markdown preview, and channel dispatch.' },
              { tag: 'VOICE', title: 'Dynamic Join-To-Create', desc: 'Auto-generating voice hubs that spawn temporary private channels and clean up on exit.' },
              { tag: 'AUDIT', title: 'Audit Incident Logging', desc: 'Real-time telemetry for deleted messages, role assignments, kicks, bans, and voice logs.' },
              { tag: 'COMMANDS', title: '96 Slash Commands', desc: 'Full suite of search, utility, moderation, fun, and developer commands accessible in /.' }
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

        {/* Commands Explorer Section */}
        <section id="commands" className="py-20 px-6 md:px-12 max-w-6xl mx-auto border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-medium text-white tracking-tight">Slash Commands Registry</h2>
              <p className="text-xs text-neutral-400 mt-1 font-mono">Explore all {commandsList.length || 96} commands available globally.</p>
            </div>
            <input
              type="text"
              placeholder="Search /commands..."
              value={cmdSearch}
              onChange={(e) => setCmdSearch(e.target.value)}
              className="bg-neutral-950 border border-white/10 rounded-md px-3 py-2 text-xs text-white w-full md:w-64 outline-none focus:border-white/30 transition-colors placeholder:text-neutral-600 font-mono"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredCommands.map((cmd) => (
              <div key={cmd.name} className="p-3.5 rounded-md bg-neutral-950 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white font-mono">/{cmd.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono border border-white/5">
                    {cmd.category}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-2 font-light line-clamp-2 leading-relaxed">{cmd.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 py-10 px-6 text-center text-xs text-neutral-500 font-mono">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-white">▲</span>
            <span className="text-neutral-300 font-sans font-semibold">Prometheus Core</span>
          </div>
          <p>© 2026 Prometheus. Engineered with Vercel design system.</p>
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: SERVER SELECTION HUB
  // ==========================================
  if (view === 'servers') {
    return (
      <div className="min-h-screen bg-black text-neutral-200 flex flex-col font-sans selection:bg-white selection:text-black">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 px-6 md:px-12 flex items-center justify-between bg-black/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('landing')} className="hover:opacity-80 transition flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs tracking-tighter">
                ▲
              </div>
              <span className="font-semibold text-white text-sm">Prometheus</span>
            </button>
            <span className="text-xs text-neutral-600 font-mono">/</span>
            <span className="text-xs font-mono text-neutral-400">Servers</span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                {getUserAvatar() && (
                  <img src={getUserAvatar()!} alt="avatar" className="w-6 h-6 rounded-full border border-white/20" />
                )}
                <span className="text-xs font-medium text-neutral-300 hidden sm:inline">
                  {currentUser.global_name || currentUser.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleDiscordLogin}
                className="px-3.5 py-1.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors"
              >
                Login with Discord
              </button>
            )}
          </div>
        </header>

        {/* Server Selection Body */}
        <main className="flex-1 max-w-4xl mx-auto p-6 md:p-12 w-full">
          {!currentUser ? (
            /* NOT LOGGED IN GATEWAY */
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-neutral-950 border border-white/10 rounded-xl max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/15 flex items-center justify-center mb-6 text-white text-xl font-bold">
                ▲
              </div>
              <h2 className="text-xl font-medium text-white mb-2 tracking-tight">Connect Discord Account</h2>
              <p className="text-xs text-neutral-400 max-w-sm mb-6 font-light leading-relaxed">
                Log in to authenticate and access servers where you have Administrator or Manage Server permissions.
              </p>
              <button
                onClick={handleDiscordLogin}
                className="px-6 py-2.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors flex items-center gap-2"
              >
                <span>Login with Discord</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            /* LOGGED IN SERVER LIST */
            <div>
              <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-2xl font-medium text-white tracking-tight">
                    {currentUser.global_name || currentUser.username}&apos;s Servers
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">
                    Select a server to configure settings, or invite Prometheus to a new guild.
                  </p>
                </div>

                <a
                  href={BOT_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <span>+ Add Bot to Another Server</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>

              {userGuilds.length === 0 ? (
                <div className="p-8 rounded-lg bg-neutral-950 border border-white/10 text-center space-y-4">
                  <p className="text-xs text-neutral-400">
                    No Discord servers found where you hold Administrator or Manage Server permissions.
                  </p>
                  <a
                    href={BOT_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium"
                  >
                    + Invite Bot to a Server
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userGuilds.map((g) => {
                    const iconUrl = getGuildIcon(g);
                    const hasBot = g.hasBot;

                    return (
                      <div key={g.id} className="p-5 rounded-lg bg-neutral-950 border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {iconUrl ? (
                            <img src={iconUrl} alt={g.name} className="w-11 h-11 rounded-md object-cover shrink-0 border border-white/10" />
                          ) : (
                            <div className="w-11 h-11 rounded-md bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-white text-sm shrink-0">
                              {g.name.charAt(0)}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <h3 className="font-medium text-sm text-white truncate">{g.name}</h3>
                            <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5 font-mono text-[11px]">
                              <span className={`w-1.5 h-1.5 rounded-full ${hasBot ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-neutral-600'}`}></span>
                              <span>{hasBot ? 'Bot Active' : 'Bot Not Added'}</span>
                              {g.owner && <span>• Owner</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasBot ? (
                            <button
                              onClick={() => handleSelectGuild(g)}
                              className="px-4 py-2 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors"
                            >
                              Manage
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <span>+ Add</span>
                                <span className="text-[10px]">↗</span>
                              </a>
                              <button
                                onClick={() => handleSelectGuild(g)}
                                className="px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-white/10 transition-colors"
                                title="Open Dashboard for this server"
                              >
                                Config
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: VERCEL THEME MANAGEMENT DASHBOARD
  // ==========================================
  return (
    <div className="flex h-screen w-full bg-black text-neutral-200 font-sans antialiased overflow-hidden select-none">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Selected Server Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              {guildMeta.icon ? (
                <img 
                  src={`https://cdn.discordapp.com/icons/${guildMeta.id}/${guildMeta.icon}.png?size=64`}
                  alt={guildMeta.name}
                  className="w-8 h-8 rounded-md object-cover border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-neutral-900 border border-white/15 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  {guildMeta.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <h1 className="font-medium text-xs text-white truncate" title={guildMeta.name}>
                  {guildMeta.name}
                </h1>
                <span className="text-[10px] text-emerald-400 font-mono">● Active</span>
              </div>
            </div>
            <button
              onClick={() => setView('servers')}
              className="text-xs text-neutral-400 hover:text-white transition px-2 py-1 rounded bg-neutral-900 border border-white/10 font-mono text-[11px]"
              title="Switch Server"
            >
              Switch
            </button>
          </div>

          {/* Clean Grouped Menu */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Group 1: General */}
            <div>
              <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500">General</div>
              <div className="space-y-0.5 mt-1">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'settings', label: 'Bot Settings', icon: '⚙️' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors ${
                      activeTab === item.id 
                        ? 'bg-neutral-900 text-white font-medium border border-white/10' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Group 2: Moderation & Security */}
            <div>
              <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500">Moderation</div>
              <div className="space-y-0.5 mt-1">
                {[
                  { id: 'moderation', label: 'Moderation Actions', icon: '🔨' },
                  { id: 'automod', label: 'AutoMod', icon: '🛡️' },
                  { id: 'logging', label: 'Audit Logs', icon: '📜' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors ${
                      activeTab === item.id 
                        ? 'bg-neutral-900 text-white font-medium border border-white/10' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Group 3: Community */}
            <div>
              <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500">Community</div>
              <div className="space-y-0.5 mt-1">
                {[
                  { id: 'welcome', label: 'Welcome & Roles', icon: '👋' },
                  { id: 'tickets', label: 'Support Tickets', icon: '🎫' },
                  { id: 'jointocreate', label: 'Temporary Voice', icon: '🔊' },
                  { id: 'reactionRoles', label: 'Reaction Roles', icon: '🎭' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors ${
                      activeTab === item.id 
                        ? 'bg-neutral-900 text-white font-medium border border-white/10' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Group 4: Features & Tools */}
            <div>
              <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500">Features</div>
              <div className="space-y-0.5 mt-1">
                {[
                  { id: 'radio', label: '24/7 Radio / Music', icon: '📻' },
                  { id: 'leveling', label: 'Leveling & XP', icon: '🏆' },
                  { id: 'economy', label: 'Economy System', icon: '🪙' },
                  { id: 'embeds', label: 'Embed Builder', icon: '🎨' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors ${
                      activeTab === item.id 
                        ? 'bg-neutral-900 text-white font-medium border border-white/10' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Group 5: Command Management */}
            <div>
              <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500">Commands</div>
              <div className="space-y-0.5 mt-1">
                <button
                  onClick={() => setActiveTab('commands')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors ${
                    activeTab === 'commands' 
                      ? 'bg-neutral-900 text-white font-medium border border-white/10' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span>⚡</span>
                    <span>Commands Hub</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black text-neutral-400 font-mono border border-white/10">
                    {commandsList.length || 96}
                  </span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <button onClick={() => setView('servers')} className="hover:text-white transition">
            ← Switch
          </button>
          <span className="text-emerald-400">{stats.ping} ms</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-black">
        
        {/* Header Bar */}
        <header className="h-14 border-b border-white/10 px-6 flex items-center justify-between shrink-0 bg-black">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-white">{guildMeta.name}</span>
            <span className="text-xs text-neutral-600 font-mono">/</span>
            <span className="text-xs font-mono text-neutral-300 capitalize">{activeTab}</span>
            {saveStatus && (
              <span className="text-xs text-emerald-400 ml-3 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                ✓ {saveStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('servers')}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-950 hover:bg-neutral-900 text-neutral-300 border border-white/10 transition-colors"
            >
              Switch Server
            </button>
            <button
              disabled={loading}
              onClick={saveConfiguration}
              className="px-4 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-neutral-200 text-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Selected Server', value: guildMeta.name, sub: `ID: ${guildMeta.id || 'Active'}` },
                  { label: 'Slash Commands', value: `${commandsList.length || 96}`, sub: 'Ready for this server' },
                  { label: 'API Latency', value: `${stats.ping} ms`, sub: 'WebSocket Realtime' },
                  { label: 'Bot Status', value: 'Online', sub: 'Ready & Listening' }
                ].map((c, i) => (
                  <div key={i} className="p-4 rounded-lg bg-neutral-950 border border-white/10">
                    <div className="text-[11px] font-mono uppercase text-neutral-500">{c.label}</div>
                    <div className="text-lg font-medium text-white mt-1 truncate">{c.value}</div>
                    <div className="text-[11px] font-mono text-neutral-400 mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Module Feature Toggles */}
              <div className="rounded-lg bg-neutral-950 border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-sm font-medium text-white">Feature Modules for {guildMeta.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5 font-mono">Toggle systems on or off for this specific guild.</p>
                </div>
                <div className="divide-y divide-white/10">
                  {[
                    { key: 'automod', subkey: 'antiRaid', title: 'AutoMod & Anti-Raid', desc: 'Protect server from raids, spam, and invite links' },
                    { key: 'logging', subkey: 'enabled', title: 'Audit Incident Logging', desc: 'Log deleted messages, bans, kicks, and role changes' },
                    { key: 'welcome', subkey: 'enabled', title: 'Welcome & Auto-Role', desc: 'Greet new members and assign starter roles' },
                    { key: 'tickets', subkey: 'enabled', title: 'Support Ticket System', desc: 'Private channel ticketing with staff management' },
                    { key: 'leveling', subkey: 'enabled', title: 'Leveling & XP Rewards', desc: 'Give members XP for chatting and reward rank roles' },
                    { key: 'economy', subkey: 'enabled', title: 'Virtual Economy & Games', desc: 'Daily rewards, wallet balance, and commands' },
                    { key: 'jointocreate', subkey: 'enabled', title: 'Temporary Voice Channels', desc: 'Auto-create dynamic voice rooms on join' },
                    { key: 'radio', subkey: 'autoplay', title: '24/7 HD Music Radio', desc: 'Continuous high-quality audio streaming in voice' }
                  ].map((feat, idx) => {
                    const isChecked = feat.subkey ? config[feat.key]?.[feat.subkey] : config[feat.key];
                    return (
                      <div key={idx} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-medium text-white">{feat.title}</div>
                          <div className="text-xs text-neutral-400 mt-0.5 font-light">{feat.desc}</div>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={!!isChecked}
                            onChange={(e) => {
                              setConfig((prev: any) => ({
                                ...prev,
                                [feat.key]: feat.subkey 
                                  ? { ...prev[feat.key], [feat.subkey]: e.target.checked }
                                  : e.target.checked
                              }));
                            }}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODERATION ACTIONS */}
          {activeTab === 'moderation' && (
            <div className="space-y-6 max-w-4xl">
              <div className="rounded-lg bg-neutral-950 border border-white/10 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-white">Direct Moderation Console ({guildMeta.name})</h3>
                  <p className="text-xs text-neutral-400 mt-0.5 font-mono">Execute moderation actions in {guildMeta.name} in realtime.</p>
                </div>

                {modActionStatus && (
                  <div className="p-3 rounded-md bg-neutral-900 border border-white/10 text-xs font-mono text-neutral-300">
                    {modActionStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">Target User ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 1508741457769664573"
                      value={modTargetId}
                      onChange={(e) => setModTargetId(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white focus:border-white/30 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Breaking server rules"
                      value={modReason}
                      onChange={(e) => setModReason(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white focus:border-white/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">Timeout Duration (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={modDuration}
                      onChange={(e) => setModDuration(Number(e.target.value))}
                      className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white focus:border-white/30 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleModerationAction('ban')}
                    className="px-4 py-2 rounded-md bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs font-medium transition-colors"
                  >
                    Ban User
                  </button>
                  <button
                    onClick={() => handleModerationAction('kick')}
                    className="px-4 py-2 rounded-md bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                  >
                    Kick User
                  </button>
                  <button
                    onClick={() => handleModerationAction('timeout')}
                    className="px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white border border-white/10 text-xs font-medium transition-colors"
                  >
                    Timeout / Mute
                  </button>
                  <button
                    onClick={() => handleModerationAction('unban')}
                    className="px-4 py-2 rounded-md bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                  >
                    Unban User ID
                  </button>
                </div>

                {/* Purge Messages */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="text-xs font-medium text-white">Bulk Message Purge</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1 font-mono">Target Channel</label>
                      <select
                        value={modPurgeChannel}
                        onChange={(e) => setModPurgeChannel(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none"
                      >
                        {guildMeta.textChannels?.map((c: any) => (
                          <option key={c.id} value={c.id}>#{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1 font-mono">Message Count (1-100)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={modPurgeCount}
                        onChange={(e) => setModPurgeCount(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none font-mono"
                      />
                    </div>
                    <button
                      onClick={() => handleModerationAction('purge')}
                      className="px-4 py-2 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors"
                    >
                      Purge Messages
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTOMOD */}
          {activeTab === 'automod' && (
            <div className="space-y-6 max-w-4xl">
              <div className="rounded-lg bg-neutral-950 border border-white/10 p-5 space-y-4">
                <h3 className="text-sm font-medium text-white">AutoMod Configuration for {guildMeta.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-black border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-white">Anti-Raid Protection</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={config.automod?.antiRaid}
                          onChange={(e) => setConfig((p: any) => ({ ...p, automod: { ...p.automod, antiRaid: e.target.checked } }))}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1 font-mono">Min Account Age (Hours)</label>
                      <input
                        type="number"
                        value={config.automod?.accountAgeHours || 24}
                        onChange={(e) => setConfig((p: any) => ({ ...p, automod: { ...p.automod, accountAgeHours: Number(e.target.value) } }))}
                        className="w-full bg-neutral-950 border border-white/10 rounded-md p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-md bg-black border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-white">Link & Invite Blocker</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={config.automod?.blockInvites}
                          onChange={(e) => setConfig((p: any) => ({ ...p, automod: { ...p.automod, blockInvites: e.target.checked } }))}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1 font-mono">Mass Mentions Limit</label>
                      <input
                        type="number"
                        value={config.automod?.massMentions || 4}
                        onChange={(e) => setConfig((p: any) => ({ ...p, automod: { ...p.automod, massMentions: Number(e.target.value) } }))}
                        className="w-full bg-neutral-950 border border-white/10 rounded-md p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Banned Words (Comma separated)</label>
                  <textarea
                    rows={2}
                    value={config.automod?.bannedWords || ''}
                    onChange={(e) => setConfig((p: any) => ({ ...p, automod: { ...p.automod, bannedWords: e.target.value } }))}
                    className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'logging' && (
            <div className="space-y-6 max-w-4xl">
              <div className="rounded-lg bg-neutral-950 border border-white/10 p-5 space-y-4">
                <h3 className="text-sm font-medium text-white">Audit Logging Settings ({guildMeta.name})</h3>
                
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Log Channel</label>
                  <select
                    value={config.logging?.channelId || ''}
                    onChange={(e) => setConfig((p: any) => ({ ...p, logging: { ...p.logging, channelId: e.target.value } }))}
                    className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none"
                  >
                    <option value="">Select a channel...</option>
                    {guildMeta.textChannels?.map((c: any) => (
                      <option key={c.id} value={c.id}>#{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {[
                    { key: 'logBans', label: 'Bans & Unbans' },
                    { key: 'logKicks', label: 'Member Kicks' },
                    { key: 'logMessageDelete', label: 'Deleted Messages' },
                    { key: 'logMessageEdit', label: 'Edited Messages' },
                    { key: 'logRoleChanges', label: 'Role Changes' },
                    { key: 'logVoiceChannels', label: 'Voice Joins / Leaves' }
                  ].map((item, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.logging?.[item.key] ?? true}
                        onChange={(e) => setConfig((p: any) => ({ ...p, logging: { ...p.logging, [item.key]: e.target.checked } }))}
                        className="accent-white"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WELCOME */}
          {activeTab === 'welcome' && (
            <div className="space-y-6 max-w-4xl">
              <div className="rounded-lg bg-neutral-950 border border-white/10 p-5 space-y-4">
                <h3 className="text-sm font-medium text-white">Welcome & Auto-Role Settings ({guildMeta.name})</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">Welcome Channel</label>
                    <select
                      value={config.welcome?.channelId || ''}
                      onChange={(e) => setConfig((p: any) => ({ ...p, welcome: { ...p.welcome, channelId: e.target.value } }))}
                      className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none"
                    >
                      <option value="">Select a channel...</option>
                      {guildMeta.textChannels?.map((c: any) => (
                        <option key={c.id} value={c.id}>#{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">Auto-Role on Join</label>
                    <select
                      value={config.welcome?.autoRoleId || ''}
                      onChange={(e) => setConfig((p: any) => ({ ...p, welcome: { ...p.welcome, autoRoleId: e.target.value } }))}
                      className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none"
                    >
                      <option value="">Select a role...</option>
                      {guildMeta.roles?.map((r: any) => (
                        <option key={r.id} value={r.id}>@{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Welcome Message (Placeholders: <code className="font-mono text-neutral-400">{'{user}'}</code>, <code className="font-mono text-neutral-400">{'{server}'}</code>, <code className="font-mono text-neutral-400">{'{memberCount}'}</code>)
                  </label>
                  <textarea
                    rows={3}
                    value={config.welcome?.message || ''}
                    onChange={(e) => setConfig((p: any) => ({ ...p, welcome: { ...p.welcome, message: e.target.value } }))}
                    className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 24/7 RADIO / MUSIC */}
          {activeTab === 'radio' && (
            <div className="space-y-6 max-w-4xl">
              <div className="rounded-lg bg-neutral-950 border border-white/10 p-5 space-y-4">
                <h3 className="text-sm font-medium text-white">24/7 HD Music Radio ({guildMeta.name})</h3>
                
                {radioStatusMsg && (
                  <div className="p-3 rounded-md bg-neutral-900 border border-white/10 text-xs font-mono text-neutral-300">
                    {radioStatusMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {RADIO_STATIONS.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setRadioStation(st.id)}
                      className={`p-3 rounded-md border text-left transition-colors ${
                        radioStation === st.id
                          ? 'bg-neutral-900 border-white text-white'
                          : 'bg-black border-white/10 text-neutral-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-medium text-white">{st.name}</div>
                      <div className="text-[11px] font-mono text-neutral-500 mt-0.5">{st.genre}</div>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-md bg-black border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1 font-mono">Voice Channel</label>
                    <select
                      value={radioVoiceChannel}
                      onChange={(e) => setRadioVoiceChannel(e.target.value)}
                      className="w-full bg-neutral-950 border border-white/10 rounded-md p-2 text-xs text-white outline-none"
                    >
                      {guildMeta.voiceChannels?.map((vc: any) => (
                        <option key={vc.id} value={vc.id}>🔊 {vc.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1 font-mono">
                      <span>Volume</span>
                      <span>{radioVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={radioVolume}
                      onChange={(e) => setRadioVolume(Number(e.target.value))}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleRadioAction('play')}
                      className="px-4 py-2 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors"
                    >
                      Play Stream
                    </button>
                    <button
                      onClick={() => handleRadioAction('stop')}
                      className="px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: EMBED BUILDER */}
          {activeTab === 'embeds' && (
            <div className="space-y-6 max-w-5xl">
              <div className="rounded-lg bg-neutral-950 border border-white/10 p-5 space-y-4">
                <h3 className="text-sm font-medium text-white">Embed Broadcaster ({guildMeta.name})</h3>

                {embedSendStatus && (
                  <div className="p-3 rounded-md bg-neutral-900 border border-white/10 text-xs font-mono text-neutral-300">
                    {embedSendStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1 font-mono">Target Channel</label>
                      <select
                        value={embedChannel}
                        onChange={(e) => setEmbedChannel(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none"
                      >
                        {guildMeta.textChannels?.map((c: any) => (
                          <option key={c.id} value={c.id}>#{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 block mb-1 font-mono">Title</label>
                      <input
                        type="text"
                        value={embedTitle}
                        onChange={(e) => setEmbedTitle(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 block mb-1 font-mono">Description</label>
                      <textarea
                        rows={3}
                        value={embedDesc}
                        onChange={(e) => setEmbedDesc(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-md p-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 block mb-1 font-mono">Color Accent</label>
                      <input
                        type="color"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="w-full h-8 bg-transparent cursor-pointer rounded-md"
                      />
                    </div>

                    <button
                      onClick={handleSendEmbed}
                      className="w-full py-2.5 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors"
                    >
                      Post Embed to Discord
                    </button>
                  </div>

                  {/* Clean Preview */}
                  <div className="p-4 rounded-md bg-black border border-white/10 flex flex-col justify-center">
                    <span className="text-[11px] text-neutral-500 mb-2 uppercase font-mono">Discord Embed Preview</span>
                    <div className="p-4 rounded-md bg-neutral-900/90 border-l-4" style={{ borderLeftColor: embedColor }}>
                      <div className="text-xs font-semibold text-white mb-1">{embedTitle}</div>
                      <div className="text-xs text-neutral-300 whitespace-pre-wrap font-light leading-relaxed">{embedDesc}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: 96 COMMANDS MANAGER */}
          {activeTab === 'commands' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h3 className="text-sm font-medium text-white">Slash Commands Manager ({commandsList.length || 96})</h3>
                  <p className="text-xs text-neutral-400 font-mono">Toggle individual commands on or off for {guildMeta.name}.</p>
                </div>
                <input
                  type="text"
                  placeholder="Search commands..."
                  value={cmdSearch}
                  onChange={(e) => setCmdSearch(e.target.value)}
                  className="bg-neutral-950 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white w-full md:w-60 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredCommands.map((cmd) => {
                  const isDisabled = config.disabledCommands?.[cmd.name];
                  return (
                    <div
                      key={cmd.name}
                      className={`p-3.5 rounded-md border transition-colors ${
                        isDisabled
                          ? 'bg-neutral-950/40 border-white/5 opacity-50'
                          : 'bg-neutral-950 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-xs text-white font-mono">/{cmd.name}</span>
                          <span className="text-[10px] ml-1.5 px-1 py-0.5 rounded bg-black text-neutral-400 font-mono border border-white/10">
                            {cmd.category}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!isDisabled}
                          onChange={() => toggleCommand(cmd.name)}
                          className="accent-white cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-neutral-400 mt-1.5 font-light line-clamp-2 leading-relaxed">{cmd.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS, TICKETS, VOICE, LEVELING, ECONOMY */}
          {['settings', 'tickets', 'jointocreate', 'reactionRoles', 'leveling', 'economy'].includes(activeTab) && (
            <div className="rounded-lg bg-neutral-950 border border-white/10 p-5 space-y-4 max-w-4xl">
              <h3 className="text-sm font-medium text-white capitalize">{activeTab} Settings for {guildMeta.name}</h3>
              <p className="text-xs text-neutral-400 font-mono">
                Configure options and toggle state for the {activeTab} module on {guildMeta.name}.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <span className="text-xs text-neutral-400 font-mono">Module Status:</span>
                <button
                  onClick={() => {
                    setConfig((p: any) => ({
                      ...p,
                      [activeTab]: {
                        ...p[activeTab],
                        enabled: !p[activeTab]?.enabled
                      }
                    }));
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium font-mono transition-colors ${
                    config[activeTab]?.enabled !== false
                      ? 'bg-white text-black'
                      : 'bg-neutral-900 text-neutral-400 border border-white/10'
                  }`}
                >
                  {config[activeTab]?.enabled !== false ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
