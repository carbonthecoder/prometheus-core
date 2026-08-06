export default function DashboardPage() {
  // In a real production app, we would fetch these from our Postgres/Redis database 
  // via an API route authenticated by the Discord OAuth token.
  const stats = {
    wallet: 45200,
    bank: 1250000,
    level: 42,
    xp: "14.2k / 15k",
    serverCount: 14,
    messagesScanned: 1245902
  };

  return (
    <div className="flex flex-col gap-8 z-10 relative">
      <header>
        <h1 className="text-4xl font-extrabold mb-2">Control Panel</h1>
        <p className="text-gray-400">Welcome back. The Neural Engine is operating at 100% efficiency.</p>
      </header>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Wallet Balance Card */}
        <div className="glass-panel p-6 flex flex-col gap-2 neon-glow">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-sm">Wallet Balance</span>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path></svg>
          </div>
          <span className="text-4xl font-extrabold text-white">${stats.wallet.toLocaleString()}</span>
          <span className="text-sm text-green-400">+12% from yesterday</span>
        </div>

        {/* Bank Balance Card */}
        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-sm">Bank Vault</span>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
          </div>
          <span className="text-4xl font-extrabold text-[var(--neon-purple)]">${stats.bank.toLocaleString()}</span>
          <span className="text-sm text-gray-500">Secured by Fort Knox Protocol</span>
        </div>

        {/* Level Card */}
        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-sm">Current Rank</span>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <span className="text-4xl font-extrabold text-white">Level {stats.level}</span>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
            <div className="bg-[var(--neon-purple)] h-2 rounded-full w-[94%] shadow-[0_0_10px_rgba(155,89,182,0.8)]"></div>
          </div>
          <span className="text-xs text-gray-400 text-right mt-1">{stats.xp} XP</span>
        </div>
      </div>

      {/* Bottom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module Toggles */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--neon-purple)] shadow-[0_0_8px_rgba(155,89,182,1)]"></span>
            Active Neural Modules
          </h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <h3 className="font-bold text-white">Fort Knox Anti-Raid</h3>
                <p className="text-sm text-gray-400">Automatic lockdown on 5+ joins/sec.</p>
              </div>
              <div className="w-12 h-6 bg-[var(--neon-purple)] rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(155,89,182,0.4)]">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <h3 className="font-bold text-white">AI Predictive Moderation</h3>
                <p className="text-sm text-gray-400">Gemini-Vision powered OCR and Toxicity scanning.</p>
              </div>
              <div className="w-12 h-6 bg-[var(--neon-purple)] rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(155,89,182,0.4)]">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <h3 className="font-bold text-white">Wormhole Network</h3>
                <p className="text-sm text-gray-400">Cross-server global chat bridging.</p>
              </div>
              <div className="w-12 h-6 bg-[var(--neon-purple)] rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(155,89,182,0.4)]">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="glass-panel p-6 flex flex-col justify-center items-center text-center">
            <svg className="w-24 h-24 text-gray-700 mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zM21 12a9 9 0 01-9 9v0M3 12a9 9 0 009 9v0M12 3v18"></path></svg>
            <h3 className="text-2xl font-bold text-white mb-2">Network Status</h3>
            <p className="text-gray-400 mb-6">Prometheus is currently monitoring {stats.serverCount} shards globally.</p>
            
            <div className="bg-white/5 px-6 py-3 rounded-lg border border-white/10">
              <span className="text-[var(--neon-purple)] font-bold">{stats.messagesScanned.toLocaleString()}</span>
              <span className="text-gray-400 ml-2">messages scanned safely.</span>
            </div>
        </div>

      </div>
    </div>
  );
}
