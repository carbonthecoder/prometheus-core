<div align="center">

# ⚡ Prometheus Discord Bot & Web Dashboard Suite

**A production-ready, feature-complete Discord bot system with 96 slash commands, 24/7 HD music streaming, Fort Knox AutoMod, support tickets, virtual economy, leveling, and a Discord-style web dashboard.**

[![Discord.js v14](https://img.shields.io/badge/Discord.js-v14.15.3-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Optional-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Invite Bot](https://discord.com/oauth2/authorize?client_id=1532437892318892144&permissions=8&scope=bot%20applications.commands) • [Web Dashboard](http://localhost:3001) • [Commands List](#-96-slash-commands-matrix) • [Free Hosting Guide](#-free-247-hosting-guide) • [Paid VPS Hosting Guide](#-paid-247-production-hosting-guide)

</div>

-----


## 🌟 Key Features

- **🌐 Public Landing Page & Web Dashboard:** Full web interface modeled after modern Discord / SaaS control panels with live telemetry, module switches, and server selection more.
- **🔨 Web & Discord Moderation:** Ban, kick, timeout, unban, and message purge directly from web or Discord with automatic audit logging.
- **🛡️ Fort Knox AutoMod:** Anti-Raid shield, invite/link suppression, spam detection, mass mention protection, and toxicity word filters.
- **📻 24/7 HD Music Radio (8 Stations):** Crystal-clear streams (Lofi Girl, ChillHop, Synthwave, Cyberpunk, Anime Lofi, Gaming Beats, Jazz Club, Classical) in voice channels.
- **🎫 Support Ticket Desk:** Private channel ticket creation with staff claiming, role permissions, and transcript logging.
- **🏆 Leveling & XP Rewards:** Real-time chat XP rewards, rank cards, level-up announcements, and customizable role unlocks.
- **🪙 Virtual Economy & Bank:** Wallet balance, bank vaults, daily rewards, coin flips, blackjack, work jobs, and server shops.
- **🔊 Join-to-Create Temporary Voice:** Dynamic private voice channels that automatically spawn on join and delete when empty.
- **🎨 Discord Embed Broadcaster:** Live WYSIWYG embed creator with markdown support, color picker, and 1-click broadcast to any channel.
- **⚡ 96 Slash Commands:** 100% modular command architecture categorized into Moderation, Economy, Music, Tickets, Utilities, Fun, and AI.
- **💾 Dual Storage Architecture:** Automatic fallback to high-speed in-memory caching if PostgreSQL is not configured, ensuring zero bot crashes.

---

## 📁 Project Structure

```
├── bot/TitanBot-main/        # Discord.js Bot & Express REST API Backend
│   ├── src/
│   │   ├── api/routes.js     # REST API bridge for Dashboard
│   │   ├── commands/         # 96 Modular Slash Commands
│   │   │   ├── core/         # Bot status, help, ping, uptime
│   │   │   ├── economy/      # Balance, bank, daily, gamble, shop
│   │   │   ├── fun/          # 8ball, coinflip, dice, fight, meme
│   │   │   ├── giveaway/     # Giveaway create, reroll, end
│   │   │   ├── leveling/     # Rank, leaderboard, setlevel
│   │   │   ├── moderation/   # Ban, kick, timeout, purge, warn
│   │   │   ├── radio/        # 24/7 HD Radio controller
│   │   │   ├── tickets/      # Ticket create, claim, close
│   │   │   └── utility/      # Embed, poll, avatar, weather, tldr
│   │   ├── database/         # PostgreSQL & Memory Fallback Engine
│   │   ├── events/           # InteractionCreate, GuildMemberAdd, etc.
│   │   ├── services/         # Gemini AI, Radio Streamer, AutoMod
│   │   └── app.js            # Main Discord Client & API Entry
│   ├── .env.example          # Bot environment template
│   └── package.json
├── dashboard/                # Next.js 16 Web Dashboard & Landing Page
│   ├── app/
│   │   ├── page.tsx          # Landing Page, Server Selector & Dashboard
│   │   ├── layout.tsx        # Clean native layout
│   │   └── globals.css       # Discord dark theme design tokens
│   ├── .env.example          # Dashboard environment template
│   └── package.json
├── docker-compose.yml        # Multi-container Docker deployment
├── ecosystem.config.js       # PM2 process manager configuration
├── .gitignore                # Production GitHub gitignore
└── README.md                 # Complete documentation
```

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v20.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Git**: Installed on your system
- **Discord Bot Token**: From [Discord Developer Portal](https://discord.com/developers/applications)

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/prometheus-discord-bot.git
cd prometheus-discord-bot

# Install bot dependencies
cd bot/TitanBot-main
npm install

# Install dashboard dependencies
cd ../../dashboard
npm install
``

### 3. Configure Environment Variables
Create `.env` in `bot/TitanBot-main/`:
```env
DISCORD_TOKEN=your_discord_bot_token_here
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_ID=1532437892318892144
GUILD_ID=your_primary_discord_guild_id
PORT=3000
NODE_ENV=development
```

### 4. Run Locally
**Terminal 1 (Start Discord Bot & API):**
```bash
cd bot/TitanBot-main
npm start
```

**Terminal 2 (Start Next.js Web Dashboard):**
```bash
cd dashboard
npm run dev -- -p 3001
```

Open **[http://localhost:3001](http://localhost:3001)** in your browser!

---

## 📤 How to Upload to GitHub

Follow these steps to upload this project directly to your GitHub account:

```bash
# 1. Initialize git repository in root directory
git init

# 2. Add all project files (.gitignore will automatically protect your .env secrets)
git add .

# 3. Commit the code
git commit -m "feat: Initial commit of Prometheus Discord Bot and Dashboard suite"

# 4. Set default branch to main
git branch -M main

# 5. Connect your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/prometheus-discord-bot.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🆓 FREE 24/7 Hosting Guide

Here are the best ways to host both the Discord Bot and Web Dashboard 100% for free:

---

### Option 1: Oracle Cloud Free Tier (⭐ RECOMMENDED - Best Free Option)
Oracle Cloud offers an **Always Free ARM VPS** that never shuts down and has enterprise specs:
- **Specs:** 4 OCPU (Ampere ARM), 24 GB RAM, 200 GB Storage, 100% Free Forever.

#### Setup Steps:
1. Create a free account at [Oracle Cloud](https://www.oracle.com/cloud/free/).
2. Create an **Ampere A1 Compute Instance** (Ubuntu 22.04 / 24.04).
3. Connect to your instance via SSH:
   ```bash
   ssh ubuntu@YOUR_INSTANCE_IP
   ```
4. Install Node.js 20, Git, and PM2:
   ```bash
   sudo apt update && sudo apt install -y curl git ffmpeg
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pm2
   ```
5. Clone your GitHub repository and set up `.env`:
   ```bash
   git clone https://github.com/YOUR_USERNAME/prometheus-discord-bot.git
   cd prometheus-discord-bot
   cd bot/TitanBot-main && cp .env.example .env && nano .env
   npm install
   cd ../../dashboard && cp .env.example .env && npm install && npm run build
   cd ..
   ```
6. Start both Bot and Dashboard with PM2:
   ```bash
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```
*Your bot and dashboard will now run 24/7 continuously with automatic reboot recovery!*

---

### Option 2: Render.com (Free Web Service)
1. Sign up at [Render.com](https://render.com/).
2. Click **New +** -> **Web Service** -> Connect your GitHub repo.
3. Configure the Bot service:
   - **Root Directory:** `bot/TitanBot-main`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/app.js`
   - **Environment Variables:** Add `DISCORD_TOKEN`, `GEMINI_API_KEY`, `CLIENT_ID`, `PORT=3000`.
4. Create a second Web Service for the Dashboard:
   - **Root Directory:** `dashboard`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start -- -p 3001`
   - **Environment Variables:** Set `NEXT_PUBLIC_API_URL` to your bot's render.com URL.

---

### Option 3: Railway.app (Free Trial / Starter)
1. Sign up at [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Railway automatically detects `docker-compose.yml` or Node.js services.
4. Add your `.env` variables under the **Variables** tab.

---

### Option 4: Fly.io (Free Tier Allowance)
1. Install Flyctl: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in `bot/TitanBot-main/` and deploy with `fly deploy`.
3. Set secrets: `fly secrets set DISCORD_TOKEN=your_token GEMINI_API_KEY=your_key`.

---

## 💎 PAID 24/7 Production Hosting Guide

For large communities, high music quality, zero latency, and dedicated uptime:

---

### Recommended VPS Providers
| Provider | Plan / Specs | Price | Best For |
| :--- | :--- | :--- | :--- |
| **[Hetzner Cloud](https://www.hetzner.com/cloud)** | CX22 (2 vCPU, 4GB RAM, 40GB NVMe) | **€3.79 / mo** | 🏆 Best Value & Performance in Europe/US |
| **[DigitalOcean](https://www.digitalocean.com/)** | Basic Droplet (1 vCPU, 1GB RAM) | **$4.00 / mo** | Easy 1-click deployments & backups |
| **[Linode / Akamai](https://www.linode.com/)** | Nanode (1 vCPU, 1GB RAM) | **$5.00 / mo** | High network reliability worldwide |
| **[Discloud](https://discloud.com/)** | Platinum Bot Plan | **~$3.00 / mo** | Managed Discord Bot hosting |

---

### 🚀 1-Command Production Deployment on VPS

#### Method A: Docker Compose (Easiest & Most Robust)
1. SSH into your VPS:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```
2. Install Docker & Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. Clone repository and configure `.env`:
   ```bash
   git clone https://github.com/YOUR_USERNAME/prometheus-discord-bot.git
   cd prometheus-discord-bot
   nano bot/TitanBot-main/.env
   ```
4. Start the entire stack (PostgreSQL + Bot + Dashboard):
   ```bash
   docker compose up -d --build
   ```
5. View real-time logs:
   ```bash
   docker compose logs -f
   ```

---

#### Method B: PM2 Process Manager + Systemd
```bash
# 1. Install Node.js 20 & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs ffmpeg
sudo npm install -g pm2

# 2. Build Dashboard
cd dashboard
npm install && npm run build
cd ..

# 3. Start everything with PM2
pm2 start ecosystem.config.js

# 4. Enable auto-start on server boot
pm2 startup
pm2 save
```

---

### 🔒 Nginx Reverse Proxy with Free SSL (HTTPS)
To access your web dashboard with a custom domain (e.g. `https://dashboard.yourdomain.com`):

1. Install Nginx and Certbot:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```
2. Create `/etc/nginx/sites-available/bot-dashboard`:
   ```nginx
   server {
       server_name dashboard.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Enable the site and request SSL certificate:
   ```bash
   sudo ln -s /etc/nginx/sites-available/bot-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl restart nginx
   sudo certbot --nginx -d dashboard.yourdomain.com
   ```

---

## ⚡ 96 Slash Commands Matrix

| Category | Commands Count | Key Commands Included |
| :--- | :--- | :--- |
| **🔨 Moderation** | 16 | `/ban`, `/kick`, `/timeout`, `/unban`, `/purge`, `/lock`, `/unlock`, `/massban`, `/masskick`, `/warn`, `/warnings`, `/cases`, `/usernotes`, `/dm`, `/antiraid` |
| **📻 HD Radio & Voice** | 3 | `/radio` (8 Live Stations), `/activity`, `/jointocreate` |
| **🎫 Support Tickets** | 4 | `/ticket`, `/claim`, `/close`, `/priority` |
| **🏆 Leveling & XP** | 3 | `/rank`, `/leaderboard`, `/setlevel` |
| **🪙 Virtual Economy** | 12 | `/balance`, `/bank`, `/daily`, `/deposit`, `/withdraw`, `/gamble`, `/coinflip`, `/dice`, `/rob`, `/work`, `/shop`, `/inventory` |
| **🎉 Giveaways** | 4 | `/giveaway`, `/gstart`, `/gend`, `/greroll` |
| **🛠️ Utilities & Tools** | 22 | `/embedbuilder`, `/poll`, `/calculate`, `/tldr`, `/imagine`, `/backup`, `/serverinfo`, `/userinfo`, `/avatar`, `/weather`, `/time`, `/unixtime`, `/baseconvert`, `/generatepassword`, `/hexcolor`, `/shorten`, `/report`, `/todo`, `/wipedata` |
| **🎭 Community & Roles** | 6 | `/welcome`, `/goodbye`, `/greet`, `/autorole`, `/reactroles`, `/serverstats` |
| **🎮 Fun & Games** | 14 | `/8ball`, `/fight`, `/rps`, `/trivia`, `/quote`, `/fact`, `/meme`, `/joke`, `/ascii`, `/clap`, `/fliptext`, `/mock`, `/rate`, `/reverse` |
| **🔍 Search** | 4 | `/google`, `/urban`, `/define`, `/movie` |
| **⚙️ Core** | 8 | `/help`, `/ping`, `/stats`, `/uptime`, `/support`, `/about`, `/invite`, `/rules` |

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).
Feel free to fork, customize, and deploy for your community!
