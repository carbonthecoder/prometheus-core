export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 glass-panel m-4 flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--neon-purple)] flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(155,89,182,0.5)]">
            P
          </div>
          <span className="text-xl font-extrabold tracking-wide">Prometheus</span>
        </div>

        <nav className="flex flex-col gap-2">
          <a href="#" className="px-4 py-3 rounded-lg bg-white/5 text-white font-medium border border-white/10">Overview</a>
          <a href="#" className="px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Server Economy</a>
          <a href="#" className="px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Neural Modules</a>
          <a href="#" className="px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Integrations</a>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-3">
          <img src="https://i.pravatar.cc/100" className="w-10 h-10 rounded-full border border-[var(--neon-purple)]" alt="User" />
          <div className="flex flex-col">
            <span className="text-sm font-bold">Ayanimaad</span>
            <span className="text-xs text-[var(--neon-purple)]">Server Admin</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--neon-purple)] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
