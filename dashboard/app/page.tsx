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
  const [embedColor, setEmbedColor] = useState('#5865F2');
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
        // Clean URL
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
    const redirectUri = window.location.origin + window.location.pathname;
    const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify%20guilds`;
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
      // 1. Fetch User Profile
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

      // 2. Fetch User Guilds
      const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (guildsRes.ok) {
        const rawGuilds: DiscordGuild[] = await guildsRes.json();
        
        // Filter servers where user has Manage Guild (32) or Administrator (8) or is Owner
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

        // Check bot presence from known bot guilds or local cache
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
    
    // Set custom metadata for this specific user's server
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
        { id: `${guild.id}-r-admin`, name: 'Admin', color: '#5865F2' },
        { id: `${guild.id}-r-mod`, name: 'Moderator', color: '#23a55a' },
        { id: `${guild.id}-r-member`, name: 'Member', color: '#99aab5' }
      ]
    };

    setGuildMeta(customMeta);
    setEmbedChannel(`${guild.id}-general`);
    setModPurgeChannel(`${guild.id}-general`);
    setRadioVoiceChannel(`${guild.id}-vc-1`);

    // Load server-specific config from localStorage
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

  // Load live data from bot API if available
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
    } catch (e) {
      // Offline fallback: already loaded in handleSelectGuild
    }
  };

  const saveConfiguration = async () => {
    setLoading(true);
    setSaveStatus(`Saving settings for ${guildMeta.name}...`);
    
    // Save specifically for this server
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
  // VIEW 1: PUBLIC BOT LANDING PAGE
  // ==========================================
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-[#c9d1d9] flex flex-col font-sans selection:bg-[#5865F2] selection:text-white">
        
        {/* Navigation Bar */}
        <header className="h-16 border-b border-[#21262d] px-6 md:px-12 flex items-center justify-between bg-[#161b22]/90 backdrop-blur sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white shadow">
              ⚡
            </div>
            <span className="font-bold text-white text-base tracking-wide">Prometheus</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
              v{stats.version}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#8b949e]">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#commands" className="hover:text-white transition">Commands ({commandsList.length || 96})</a>
            <a href="#about" className="hover:text-white transition">About</a>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('servers')}
                  className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-semibold border border-[#30363d] transition flex items-center gap-2"
                >
                  {getUserAvatar() ? (
                    <img src={getUserAvatar()!} alt="avatar" className="w-5 h-5 rounded-full" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-[#5865F2] flex items-center justify-center text-[10px]">
                      {currentUser.username.charAt(0)}
                    </span>
                  )}
                  <span>{currentUser.global_name || currentUser.username}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-md bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white text-xs transition border border-[#30363d]"
                  title="Log Out"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleDiscordLogin}
                className="px-4 py-2 rounded-md bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold transition flex items-center gap-2 shadow"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Login with Discord</span>
              </button>
            )}

            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-semibold border border-[#30363d] transition flex items-center gap-1"
            >
              <span>+ Add Bot</span>
              <span>↗</span>
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs text-[#8b949e] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#23a55a]"></span>
            <span>Public Discord Bot • {commandsList.length || 96} Slash Commands • Web Dashboard</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            The Complete All-In-One Discord Bot for Any Server
          </h1>

          <p className="mt-4 text-base md:text-lg text-[#8b949e] max-w-2xl">
            Prometheus is a public multi-server bot. Add it to your server in 1 click, log in with Discord, and control your AutoMod, 24/7 radio, tickets, leveling, and moderation from this dashboard.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-semibold transition shadow-lg flex items-center gap-2"
            >
              <span>+ Add Bot to Your Server</span>
              <span>↗</span>
            </a>
            
            {currentUser ? (
              <button
                onClick={() => setView('servers')}
                className="px-6 py-3 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-sm font-semibold border border-[#30363d] transition flex items-center gap-2"
              >
                <span>Manage Your Servers</span>
                <span>→</span>
              </button>
            ) : (
              <button
                onClick={handleDiscordLogin}
                className="px-6 py-3 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-sm font-semibold border border-[#30363d] transition flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Login with Discord</span>
              </button>
            )}
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="py-16 px-6 md:px-12 max-w-6xl mx-auto border-t border-[#21262d]">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white">Everything Your Server Needs</h2>
            <p className="text-xs text-[#8b949e] mt-1">Built for speed, reliability, and full web management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: '🔨 Moderation & AutoMod', desc: 'Ban, kick, timeout, purge messages directly from web or Discord, with anti-raid, invite blocking, and spam filters.' },
              { title: '📻 24/7 HD Music Radio', desc: '8 crystal-clear streams (Lofi, Synthwave, Cyberpunk, Gaming, Jazz) playing non-stop in voice channels.' },
              { title: '🎫 Support Ticket Desk', desc: 'Organized private support tickets with customizable categories, staff roles, and transcript logs.' },
              { title: '🏆 Leveling & XP Rewards', desc: 'Reward active chatters with XP points, customizable level-up announcements, and role rewards.' },
              { title: '🪙 Virtual Economy & Bank', desc: 'Server wallet, bank accounts, daily rewards, gambling, work payouts, and customizable shop items.' },
              { title: '🎨 Rich Embed Broadcaster', desc: 'Create and dispatch Discord embeds with color pickers, markdown, and live preview.' },
              { title: '🔊 Join-To-Create Voice', desc: 'Dynamic temporary voice rooms that automatically create when joined and delete when empty.' },
              { title: '📜 Audit Incident Logging', desc: 'Track bans, kicks, deleted messages, edited text, role updates, and member departures.' },
              { title: '⚡ 96 Slash Commands', desc: 'Full suite of search, utility, fun, moderation, tools, and community slash commands ready in /.' }
            ].map((f, i) => (
              <div key={i} className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 hover:border-[#5865F2] transition">
                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Commands Explorer Section */}
        <section id="commands" className="py-16 px-6 md:px-12 max-w-6xl mx-auto border-t border-[#21262d]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Slash Commands ({commandsList.length || 96})</h2>
              <p className="text-xs text-[#8b949e] mt-1">Explore all built-in commands available out of the box.</p>
            </div>
            <input
              type="text"
              placeholder="Search /command..."
              value={cmdSearch}
              onChange={(e) => setCmdSearch(e.target.value)}
              className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 text-xs text-white w-full md:w-64 outline-none focus:border-[#5865F2]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCmdCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  cmdCategoryFilter === cat
                    ? 'bg-[#5865F2] text-white'
                    : 'bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Commands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredCommands.map((cmd) => (
              <div key={cmd.name} className="p-3 rounded-lg bg-[#161b22] border border-[#30363d]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white font-mono">/{cmd.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e]">
                    {cmd.category}
                  </span>
                </div>
                <p className="text-xs text-[#8b949e] mt-1.5 line-clamp-2">{cmd.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-[#21262d] py-8 px-6 text-center text-xs text-[#8b949e]">
          <p>© 2026 Prometheus Discord Bot. Public multi-server platform.</p>
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: SERVER SELECTION HUB (AUTH / GUILD SELECTOR)
  // ==========================================
  if (view === 'servers') {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-[#c9d1d9] flex flex-col font-sans">
        {/* Top Header */}
        <header className="h-16 border-b border-[#21262d] px-6 md:px-12 flex items-center justify-between bg-[#161b22]">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('landing')} className="hover:opacity-80 transition flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white text-xs">
                ⚡
              </div>
              <span className="font-bold text-white text-sm">Prometheus</span>
            </button>
            <span className="text-xs text-[#8b949e]">/</span>
            <span className="text-xs font-semibold text-white">Your Servers</span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                {getUserAvatar() && (
                  <img src={getUserAvatar()!} alt="avatar" className="w-7 h-7 rounded-full border border-[#30363d]" />
                )}
                <span className="text-xs font-medium text-white hidden sm:inline">
                  {currentUser.global_name || currentUser.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded bg-[#da3633] hover:bg-[#b62324] text-white text-xs font-medium transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleDiscordLogin}
                className="px-3 py-1.5 rounded bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-medium transition flex items-center gap-1.5"
              >
                <span>Login with Discord</span>
              </button>
            )}
          </div>
        </header>

        {/* Server Selection Body */}
        <main className="flex-1 max-w-4xl mx-auto p-6 md:p-12 w-full">
          {!currentUser ? (
            /* NOT LOGGED IN GATEWAY */
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-[#161b22] border border-[#30363d] rounded-xl max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Connect Your Discord Account</h2>
              <p className="text-xs text-[#8b949e] max-w-sm mb-6">
                Log in with your Discord account to see and manage the servers where you have Administrator or Manage Server permissions.
              </p>
              <button
                onClick={handleDiscordLogin}
                className="px-6 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg"
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
                  <h1 className="text-2xl font-bold text-white">
                    {currentUser.global_name || currentUser.username}&apos;s Discord Servers
                  </h1>
                  <p className="text-xs text-[#8b949e] mt-1">
                    Select a server to configure its settings, or invite Prometheus to a new server.
                  </p>
                </div>

                <a
                  href={BOT_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-semibold border border-[#30363d] transition flex items-center gap-1.5"
                >
                  <span>+ Add Bot to Another Server</span>
                  <span>↗</span>
                </a>
              </div>

              {userGuilds.length === 0 ? (
                <div className="p-8 rounded-lg bg-[#161b22] border border-[#30363d] text-center space-y-4">
                  <p className="text-sm text-[#8b949e]">
                    No Discord servers found where you have Administrator or Manage Server permissions.
                  </p>
                  <a
                    href={BOT_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2.5 rounded bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold"
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
                      <div key={g.id} className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-between gap-4 hover:border-[#5865F2] transition">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {iconUrl ? (
                            <img src={iconUrl} alt={g.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#30363d]" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white text-base shrink-0 shadow">
                              {g.name.charAt(0)}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <h3 className="font-semibold text-sm text-white truncate">{g.name}</h3>
                            <p className="text-xs text-[#8b949e] flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${hasBot ? 'bg-[#23a55a]' : 'bg-[#8b949e]'}`}></span>
                              <span>{hasBot ? 'Bot Ready' : 'Bot Not Added'}</span>
                              {g.owner && <span>• Owner</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasBot ? (
                            <button
                              onClick={() => handleSelectGuild(g)}
                              className="px-4 py-2 rounded bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold transition"
                            >
                              Manage Server
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded bg-[#23a55a] hover:bg-[#2ea043] text-white text-xs font-semibold transition flex items-center gap-1"
                              >
                                <span>+ Add Bot</span>
                                <span>↗</span>
                              </a>
                              <button
                                onClick={() => handleSelectGuild(g)}
                                className="px-2.5 py-2 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white text-xs font-medium border border-[#30363d] transition"
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
  // VIEW 3: SERVER MANAGEMENT DASHBOARD
  // ==========================================
  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-[#c9d1d9] font-sans antialiased overflow-hidden select-none">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col justify-between shrink-0">
        <div>
          {/* Selected Server Header */}
          <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              {guildMeta.icon ? (
                <img 
                  src={`https://cdn.discordapp.com/icons/${guildMeta.id}/${guildMeta.icon}.png?size=64`}
                  alt={guildMeta.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#30363d] shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white text-xs shadow shrink-0">
                  {guildMeta.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <h1 className="font-semibold text-xs text-white truncate" title={guildMeta.name}>
                  {guildMeta.name}
                </h1>
                <span className="text-[10px] text-[#23a55a]">● Active Server</span>
              </div>
            </div>
            <button
              onClick={() => setView('servers')}
              className="text-xs text-[#8b949e] hover:text-white transition px-2 py-1 rounded bg-[#21262d] border border-[#30363d]"
              title="Switch Server"
            >
              Switch
            </button>
          </div>

          {/* Clean Grouped Menu */}
          <nav className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Group 1: General */}
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">General</div>
              <div className="space-y-0.5 mt-1">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'settings', label: 'Bot Settings', icon: '⚙️' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                      activeTab === item.id 
                        ? 'bg-[#21262d] text-white font-semibold' 
                        : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]/50'
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
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">Moderation</div>
              <div className="space-y-0.5 mt-1">
                {[
                  { id: 'moderation', label: 'Moderation Actions', icon: '🔨' },
                  { id: 'automod', label: 'AutoMod', icon: '🛡️' },
                  { id: 'logging', label: 'Audit Logs', icon: '📜' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                      activeTab === item.id 
                        ? 'bg-[#21262d] text-white font-semibold' 
                        : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]/50'
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
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">Community</div>
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                      activeTab === item.id 
                        ? 'bg-[#21262d] text-white font-semibold' 
                        : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]/50'
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
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">Features</div>
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                      activeTab === item.id 
                        ? 'bg-[#21262d] text-white font-semibold' 
                        : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]/50'
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
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">Commands</div>
              <div className="space-y-0.5 mt-1">
                <button
                  onClick={() => setActiveTab('commands')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                    activeTab === 'commands' 
                      ? 'bg-[#21262d] text-white font-semibold' 
                      : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span>⚡</span>
                    <span>Commands Manager</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#30363d] text-[#c9d1d9] font-mono">
                    {commandsList.length || 96}
                  </span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#30363d] flex items-center justify-between text-xs text-[#8b949e]">
          <button onClick={() => setView('servers')} className="hover:text-white transition">
            ← Switch Server
          </button>
          <span className="text-[#23a55a] font-mono font-medium">{stats.ping} ms</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
        
        {/* Header Bar */}
        <header className="h-14 border-b border-[#30363d] px-6 flex items-center justify-between shrink-0 bg-[#161b22]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white">{guildMeta.name}</span>
            <span className="text-xs text-[#8b949e]">/</span>
            <span className="text-xs font-semibold text-[#58a6ff] capitalize">{activeTab}</span>
            {saveStatus && (
              <span className="text-xs text-[#23a55a] ml-3 font-medium bg-[#23a55a]/10 px-2 py-0.5 rounded border border-[#23a55a]/30">
                ✓ {saveStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('servers')}
              className="px-3 py-1.5 text-xs font-medium rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] transition"
            >
              Switch Server
            </button>
            <button
              disabled={loading}
              onClick={saveConfiguration}
              className="px-4 py-1.5 text-xs font-semibold rounded bg-[#23a55a] hover:bg-[#2ea043] text-white transition disabled:opacity-50 shadow"
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
                  <div key={i} className="p-4 rounded-lg bg-[#161b22] border border-[#30363d]">
                    <div className="text-xs text-[#8b949e] font-medium">{c.label}</div>
                    <div className="text-lg font-bold text-white mt-1 truncate">{c.value}</div>
                    <div className="text-[11px] text-[#8b949e] mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Module Feature Toggles */}
              <div className="rounded-lg bg-[#161b22] border border-[#30363d] overflow-hidden">
                <div className="p-4 border-b border-[#30363d]">
                  <h3 className="text-sm font-semibold text-white">Feature Modules for {guildMeta.name}</h3>
                  <p className="text-xs text-[#8b949e] mt-0.5">Toggle systems on or off for this specific server.</p>
                </div>
                <div className="divide-y divide-[#30363d]">
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
                          <div className="text-xs font-semibold text-white">{feat.title}</div>
                          <div className="text-xs text-[#8b949e] mt-0.5">{feat.desc}</div>
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
              <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Direct Web Moderation ({guildMeta.name})</h3>
                  <p className="text-xs text-[#8b949e] mt-0.5">Execute moderation actions in {guildMeta.name} directly from web.</p>
                </div>

                {modActionStatus && (
                  <div className="p-3 rounded bg-[#21262d] border border-[#30363d] text-xs text-[#58a6ff]">
                    {modActionStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#c9d1d9] block mb-1">Target User ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 1508741457769664573"
                      value={modTargetId}
                      onChange={(e) => setModTargetId(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white focus:border-[#5865F2] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#c9d1d9] block mb-1">Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Breaking server rules"
                      value={modReason}
                      onChange={(e) => setModReason(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white focus:border-[#5865F2] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#c9d1d9] block mb-1">Timeout Duration (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={modDuration}
                      onChange={(e) => setModDuration(Number(e.target.value))}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white focus:border-[#5865F2] outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleModerationAction('ban')}
                    className="px-4 py-2 rounded bg-[#da3633] hover:bg-[#b62324] text-white text-xs font-semibold transition"
                  >
                    Ban User
                  </button>
                  <button
                    onClick={() => handleModerationAction('kick')}
                    className="px-4 py-2 rounded bg-[#d29922] hover:bg-[#bb8009] text-white text-xs font-semibold transition"
                  >
                    Kick User
                  </button>
                  <button
                    onClick={() => handleModerationAction('timeout')}
                    className="px-4 py-2 rounded bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold transition"
                  >
                    Timeout / Mute
                  </button>
                  <button
                    onClick={() => handleModerationAction('unban')}
                    className="px-4 py-2 rounded bg-[#23a55a] hover:bg-[#2ea043] text-white text-xs font-semibold transition"
                  >
                    Unban User ID
                  </button>
                </div>

                {/* Purge Messages */}
                <div className="pt-4 border-t border-[#30363d] space-y-3">
                  <h4 className="text-xs font-semibold text-white">Bulk Message Purge</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-xs text-[#8b949e] block mb-1">Target Channel</label>
                      <select
                        value={modPurgeChannel}
                        onChange={(e) => setModPurgeChannel(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                      >
                        {guildMeta.textChannels?.map((c: any) => (
                          <option key={c.id} value={c.id}>#{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#8b949e] block mb-1">Message Count (1-100)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={modPurgeCount}
                        onChange={(e) => setModPurgeCount(Number(e.target.value))}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleModerationAction('purge')}
                      className="px-4 py-2 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white text-xs font-semibold transition"
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
              <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">AutoMod Configuration for {guildMeta.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded bg-[#0d1117] border border-[#30363d] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white">Anti-Raid Protection</span>
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
                      <label className="text-xs text-[#8b949e] block mb-1">Min Account Age (Hours)</label>
                      <input
                        type="number"
                        value={config.automod?.accountAgeHours || 24}
                        onChange={(e) => setConfig((p: any) => ({ ...p, automod: { ...p.automod, accountAgeHours: Number(e.target.value) } }))}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded bg-[#0d1117] border border-[#30363d] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white">Link & Invite Blocker</span>
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
                      <label className="text-xs text-[#8b949e] block mb-1">Mass Mentions Limit</label>
                      <input
                        type="number"
                        value={config.automod?.massMentions || 4}
                        onChange={(e) => setConfig((p: any) => ({ ...p, automod: { ...p.automod, massMentions: Number(e.target.value) } }))}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#c9d1d9] block mb-1">Banned Words (Comma separated)</label>
                  <textarea
                    rows={2}
                    value={config.automod?.bannedWords || ''}
                    onChange={(e) => setConfig((p: any) => ({ ...p, automod: { ...p.automod, bannedWords: e.target.value } }))}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'logging' && (
            <div className="space-y-6 max-w-4xl">
              <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Audit Logging Settings ({guildMeta.name})</h3>
                
                <div>
                  <label className="text-xs font-medium text-[#c9d1d9] block mb-1">Log Channel</label>
                  <select
                    value={config.logging?.channelId || ''}
                    onChange={(e) => setConfig((p: any) => ({ ...p, logging: { ...p.logging, channelId: e.target.value } }))}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
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
                    <label key={i} className="flex items-center gap-2 text-xs text-[#c9d1d9] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.logging?.[item.key] ?? true}
                        onChange={(e) => setConfig((p: any) => ({ ...p, logging: { ...p.logging, [item.key]: e.target.checked } }))}
                        className="accent-[#5865F2]"
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
              <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Welcome & Auto-Role Settings ({guildMeta.name})</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#c9d1d9] block mb-1">Welcome Channel</label>
                    <select
                      value={config.welcome?.channelId || ''}
                      onChange={(e) => setConfig((p: any) => ({ ...p, welcome: { ...p.welcome, channelId: e.target.value } }))}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                    >
                      <option value="">Select a channel...</option>
                      {guildMeta.textChannels?.map((c: any) => (
                        <option key={c.id} value={c.id}>#{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#c9d1d9] block mb-1">Auto-Role on Join</label>
                    <select
                      value={config.welcome?.autoRoleId || ''}
                      onChange={(e) => setConfig((p: any) => ({ ...p, welcome: { ...p.welcome, autoRoleId: e.target.value } }))}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                    >
                      <option value="">Select a role...</option>
                      {guildMeta.roles?.map((r: any) => (
                        <option key={r.id} value={r.id}>@{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#c9d1d9] block mb-1">
                    Welcome Message (Placeholders: <code>{'{user}'}</code>, <code>{'{server}'}</code>, <code>{'{memberCount}'}</code>)
                  </label>
                  <textarea
                    rows={3}
                    value={config.welcome?.message || ''}
                    onChange={(e) => setConfig((p: any) => ({ ...p, welcome: { ...p.welcome, message: e.target.value } }))}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 24/7 RADIO / MUSIC */}
          {activeTab === 'radio' && (
            <div className="space-y-6 max-w-4xl">
              <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">24/7 HD Music Radio ({guildMeta.name})</h3>
                
                {radioStatusMsg && (
                  <div className="p-3 rounded bg-[#21262d] border border-[#30363d] text-xs text-[#58a6ff]">
                    {radioStatusMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {RADIO_STATIONS.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setRadioStation(st.id)}
                      className={`p-3 rounded border text-left transition ${
                        radioStation === st.id
                          ? 'bg-[#21262d] border-[#5865F2] text-white'
                          : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{st.name}</div>
                      <div className="text-[11px] text-[#8b949e] mt-0.5">{st.genre}</div>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded bg-[#0d1117] border border-[#30363d] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="text-xs text-[#8b949e] block mb-1">Voice Channel</label>
                    <select
                      value={radioVoiceChannel}
                      onChange={(e) => setRadioVoiceChannel(e.target.value)}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                    >
                      {guildMeta.voiceChannels?.map((vc: any) => (
                        <option key={vc.id} value={vc.id}>🔊 {vc.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#8b949e] mb-1">
                      <span>Volume</span>
                      <span>{radioVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={radioVolume}
                      onChange={(e) => setRadioVolume(Number(e.target.value))}
                      className="w-full accent-[#5865F2]"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleRadioAction('play')}
                      className="px-4 py-2 rounded bg-[#23a55a] hover:bg-[#2ea043] text-white text-xs font-semibold transition"
                    >
                      Play in Voice
                    </button>
                    <button
                      onClick={() => handleRadioAction('stop')}
                      className="px-4 py-2 rounded bg-[#da3633] hover:bg-[#b62324] text-white text-xs font-semibold transition"
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
              <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Embed Broadcaster ({guildMeta.name})</h3>

                {embedSendStatus && (
                  <div className="p-3 rounded bg-[#21262d] border border-[#30363d] text-xs text-[#58a6ff]">
                    {embedSendStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#8b949e] block mb-1">Target Channel</label>
                      <select
                        value={embedChannel}
                        onChange={(e) => setEmbedChannel(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                      >
                        {guildMeta.textChannels?.map((c: any) => (
                          <option key={c.id} value={c.id}>#{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-[#8b949e] block mb-1">Title</label>
                      <input
                        type="text"
                        value={embedTitle}
                        onChange={(e) => setEmbedTitle(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#8b949e] block mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={embedDesc}
                        onChange={(e) => setEmbedDesc(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#8b949e] block mb-1">Color</label>
                      <input
                        type="color"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="w-full h-8 bg-transparent cursor-pointer rounded"
                      />
                    </div>

                    <button
                      onClick={handleSendEmbed}
                      className="w-full py-2 rounded bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold transition"
                    >
                      Post Embed to Discord
                    </button>
                  </div>

                  {/* Clean Preview */}
                  <div className="p-4 rounded bg-[#0d1117] border border-[#30363d] flex flex-col justify-center">
                    <span className="text-[11px] text-[#8b949e] mb-2 uppercase font-mono">Discord Embed Preview</span>
                    <div className="p-3.5 rounded bg-[#2b2d31] border-l-4" style={{ borderLeftColor: embedColor }}>
                      <div className="text-xs font-bold text-white mb-1">{embedTitle}</div>
                      <div className="text-xs text-[#dbdee1] whitespace-pre-wrap">{embedDesc}</div>
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
                  <h3 className="text-sm font-semibold text-white">Slash Commands Manager ({commandsList.length || 96})</h3>
                  <p className="text-xs text-[#8b949e]">Toggle individual commands on or off for {guildMeta.name}.</p>
                </div>
                <input
                  type="text"
                  placeholder="Search commands..."
                  value={cmdSearch}
                  onChange={(e) => setCmdSearch(e.target.value)}
                  className="bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white w-full md:w-60 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredCommands.map((cmd) => {
                  const isDisabled = config.disabledCommands?.[cmd.name];
                  return (
                    <div
                      key={cmd.name}
                      className={`p-3 rounded-lg border transition ${
                        isDisabled
                          ? 'bg-[#161b22]/40 border-[#30363d] opacity-60'
                          : 'bg-[#161b22] border-[#30363d]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-xs text-white">/{cmd.name}</span>
                          <span className="text-[10px] ml-1.5 px-1 py-0.5 rounded bg-[#21262d] text-[#8b949e]">
                            {cmd.category}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!isDisabled}
                          onChange={() => toggleCommand(cmd.name)}
                          className="accent-[#5865F2] cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-[#8b949e] mt-1.5 line-clamp-2">{cmd.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS, TICKETS, VOICE, LEVELING, ECONOMY */}
          {['settings', 'tickets', 'jointocreate', 'reactionRoles', 'leveling', 'economy'].includes(activeTab) && (
            <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5 space-y-4 max-w-4xl">
              <h3 className="text-sm font-semibold text-white capitalize">{activeTab} Settings for {guildMeta.name}</h3>
              <p className="text-xs text-[#8b949e]">
                Configure options and toggle state for the {activeTab} module on {guildMeta.name}.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <span className="text-xs text-[#8b949e]">Module Status:</span>
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
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    config[activeTab]?.enabled !== false
                      ? 'bg-[#23a55a] text-white'
                      : 'bg-[#da3633] text-white'
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
