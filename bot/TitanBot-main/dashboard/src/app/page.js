export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--neon-purple)] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

      {/* Hero Section */}
      <div className="z-10 flex flex-col items-center text-center px-4 animate-float">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#9B59B6]">
          PROMETHEUS
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl font-light">
          The ultimate neural-driven Discord architecture. 
          Manage your server, vault, and AI modules directly from the Web.
        </p>

        {/* Discord Login Button */}
        <a 
          href="/dashboard"
          className="glass-panel neon-glow px-8 py-4 flex items-center gap-3 text-lg font-bold text-white transition-all duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 127.14 96.36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96,46,95.89,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
          Login with Discord
        </a>
      </div>
    </main>
  );
}
