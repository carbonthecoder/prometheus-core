export interface BotCommand {
  name: string;
  category: string;
  description: string;
}

export const COMMANDS_DATA: BotCommand[] = [
  // Birthday
  { name: 'birthday', category: 'Birthday', description: 'Birthday system commands and automatic celebration alerts.' },
  
  // Community
  { name: 'app-admin', category: 'Community', description: 'Manage staff and moderator applications.' },
  { name: 'apply', category: 'Community', description: 'Manage role applications for members.' },
  
  // Core
  { name: 'bug', category: 'Core', description: 'Report a bug or issue with the bot.' },
  { name: 'help', category: 'Core', description: 'Displays the interactive help menu with all available commands.' },
  { name: 'overview', category: 'Core', description: 'Read-only snapshot of all server system statuses.' },
  { name: 'ping', category: 'Core', description: 'Checks WebSocket latency and Discord API heartbeat.' },
  { name: 'stats', category: 'Core', description: 'View system CPU, RAM, uptime, and bot statistics.' },
  { name: 'support', category: 'Core', description: 'Get direct support link and community resources.' },
  { name: 'uptime', category: 'Core', description: 'Check how long the bot process has been running.' },
  
  // Economy
  { name: 'balance', category: 'Economy', description: "Check your or another member's wallet and bank balance." },
  { name: 'beg', category: 'Economy', description: 'Beg for a small amount of coins with randomized cooldowns.' },
  { name: 'buy', category: 'Economy', description: 'Purchase an item from the server economy shop.' },
  { name: 'daily', category: 'Economy', description: 'Claim your daily coin stipend and maintain streaks.' },
  { name: 'deposit', category: 'Economy', description: 'Deposit cash from your wallet safely into your bank account.' },
  { name: 'eleaderboard', category: 'Economy', description: "View the server's top 10 richest users." },
  { name: 'inventory', category: 'Economy', description: 'View your personal inventory of purchased items.' },
  { name: 'pay', category: 'Economy', description: 'Transfer money from your wallet to another user.' },
  { name: 'profile', category: 'Economy', description: 'Generates your custom Dynamic ID Passport card.' },
  { name: 'shop', category: 'Economy', description: 'Browse available roles and items in the server shop.' },
  { name: 'withdraw', category: 'Economy', description: 'Withdraw money from your bank back into your wallet.' },
  
  // Fun
  { name: 'fight', category: 'Fun', description: 'Starts a simulated 1v1 turn-based battle with health bars.' },
  { name: 'roll', category: 'Fun', description: 'Rolls dice using standard notation (e.g. 2d20, 1d6 + 5).' },
  
  // Giveaway
  { name: 'gcreate', category: 'Giveaway', description: 'Starts an interactive giveaway in a designated channel.' },
  { name: 'gdelete', category: 'Giveaway', description: 'Cancel and delete an ongoing giveaway.' },
  { name: 'gend', category: 'Giveaway', description: 'Force-end an active giveaway early and pick winners.' },
  { name: 'greroll', category: 'Giveaway', description: 'Rerolls new winner(s) for an ended giveaway.' },
  
  // JoinToCreate
  { name: 'jointocreate', category: 'JoinToCreate', description: 'Configure dynamic auto-generating temporary voice channels.' },
  
  // Leveling
  { name: 'leaderboard', category: 'Leveling', description: "Shows the server's global XP and level leaderboard." },
  { name: 'level', category: 'Leveling', description: 'Configure XP rate, level-up channels, and rewards.' },
  { name: 'leveladd', category: 'Leveling', description: 'Admin: Add levels directly to a server member.' },
  { name: 'levelremove', category: 'Leveling', description: 'Admin: Deduct levels from a server member.' },
  { name: 'levelset', category: 'Leveling', description: 'Admin: Set exact level value for a member.' },
  { name: 'rank', category: 'Leveling', description: 'Check your current rank card, level, and XP progress.' },
  
  // Logging
  { name: 'logging', category: 'Logging', description: 'Configure audit incident logging channels and event subscriptions.' },
  
  // Moderation
  { name: 'ban', category: 'Moderation', description: 'Ban a member from the server with optional reason and message purge.' },
  { name: 'cases', category: 'Moderation', description: 'View moderation history, infractions, and audit case logs.' },
  { name: 'dm', category: 'Moderation', description: 'Send an official moderation DM to a member on behalf of staff.' },
  { name: 'kick', category: 'Moderation', description: 'Kick a member from the Discord guild.' },
  { name: 'massban', category: 'Moderation', description: 'Ban multiple IDs or users simultaneously in a single command.' },
  { name: 'masskick', category: 'Moderation', description: 'Kick multiple users simultaneously.' },
  { name: 'purge', category: 'Moderation', description: 'Bulk delete up to 100 messages in the current channel.' },
  { name: 'timeout', category: 'Moderation', description: 'Mute / timeout a user for a specified duration.' },
  { name: 'unban', category: 'Moderation', description: 'Revoke a ban for a specified user ID.' },
  { name: 'untimeout', category: 'Moderation', description: 'Remove timeout status from a member immediately.' },
  { name: 'usernotes', category: 'Moderation', description: 'Add and view staff-only notes on specific users.' },
  { name: 'warn', category: 'Moderation', description: 'Issue a formal moderation warning to a member.' },
  { name: 'warnings', category: 'Moderation', description: 'List all active and past warnings recorded for a user.' },
  
  // Reaction Roles
  { name: 'reactroles', category: 'Reaction Roles', description: 'Create and manage emoji reaction role assignment panels.' },
  
  // Search
  { name: 'define', category: 'Search', description: 'Look up English dictionary definitions and pronunciations.' },
  { name: 'google', category: 'Search', description: 'Query Google search and return top verified results.' },
  { name: 'movie', category: 'Search', description: 'Search IMDb / TMDb for movies, series, ratings, and cast.' },
  { name: 'urban', category: 'Search', description: 'Look up slang terms on Urban Dictionary.' },
  
  // ServerStats
  { name: 'serverstats', category: 'ServerStats', description: 'Manage auto-updating member, bot, and role count voice channels.' },
  
  // Ticket
  { name: 'claim', category: 'Ticket', description: 'Staff: Claim an active support ticket.' },
  { name: 'close', category: 'Ticket', description: 'Close support ticket and generate HTML transcript.' },
  { name: 'priority', category: 'Ticket', description: 'Adjust priority level of a ticket (Low, Medium, Urgent).' },
  { name: 'ticket', category: 'Ticket', description: 'Create and manage support ticket panels.' },
  
  // Tools & AI
  { name: 'backup', category: 'Tools', description: 'Export full server structure (channels, categories, roles) as JSON.' },
  { name: 'baseconvert', category: 'Tools', description: 'Convert numbers across Binary, Hexadecimal, Octal, and Decimal.' },
  { name: 'calculate', category: 'Tools', description: 'Evaluate complex mathematical formulas and equations.' },
  { name: 'countdown', category: 'Tools', description: 'Start a live updating countdown timer.' },
  { name: 'embedbuilder', category: 'Tools', description: 'Construct and dispatch rich Discord embeds with color hex codes.' },
  { name: 'feed', category: 'Tools', description: 'Fetch top trending posts from any subreddit.' },
  { name: 'generatepassword', category: 'Tools', description: 'Generate cryptographically secure random passwords.' },
  { name: 'hexcolor', category: 'Tools', description: 'Generate random color palettes with preview swatch images.' },
  { name: 'imagine', category: 'Tools', description: 'Generates high-resolution AI visuals from natural language prompts.' },
  { name: 'poll', category: 'Tools', description: 'Create multi-choice reaction polls with up to 10 options.' },
  { name: 'prometheus', category: 'Tools', description: 'Engage directly with the onboard Autonomous Neural AI assistant.' },
  { name: 'randomuser', category: 'Tools', description: 'Randomly choose an active user from the server for giveaways.' },
  { name: 'reply', category: 'Tools', description: 'Respond to Modmail tickets directly from staff channels.' },
  { name: 'review', category: 'Tools', description: 'AI Code Reviewer: Analyzes code snippets and suggests optimizations.' },
  { name: 'shorten', category: 'Tools', description: 'Generate clean shortened URLs using is.gd API.' },
  { name: 'time', category: 'Tools', description: 'Display current local time across major global timezones.' },
  { name: 'tldr', category: 'Tools', description: 'AI Summary: Condenses the last 100 messages in the channel.' },
  { name: 'unixtime', category: 'Tools', description: 'Get current Unix epoch timestamp in various Discord formatting styles.' },
  { name: 'wormhole', category: 'Tools', description: 'Connect current channel to cross-server global chat network.' },
  
  // Utility
  { name: 'avatar', category: 'Utility', description: "Display high-res avatar and banner for any Discord member." },
  { name: 'firstmsg', category: 'Utility', description: 'Generate direct link to the very first message sent in this channel.' },
  { name: 'report', category: 'Utility', description: 'Submit an anonymous or signed incident report to staff.' },
  { name: 'serverinfo', category: 'Utility', description: 'Display detailed server metadata, creation date, booster count, etc.' },
  { name: 'todo', category: 'Utility', description: 'Manage a persistent personal to-do list stored in the bot database.' },
  { name: 'userinfo', category: 'Utility', description: 'Display comprehensive Discord account info, badges, and roles.' },
  { name: 'weather', category: 'Utility', description: 'Fetch real-time weather, humidity, and forecasts worldwide.' },
  { name: 'wipedata', category: 'Utility', description: 'GDPR right to be forgotten: Permanently delete your user records.' },
  
  // Verification
  { name: 'verification', category: 'Verification', description: 'Configure captcha or button-based server verification gate.' },
  { name: 'verify', category: 'Verification', description: 'Complete server verification to unlock channels.' },
  
  // Voice & Radio
  { name: 'activity', category: 'Voice', description: 'Launch Discord Activities (YouTube Together, Chess, Poker) in VC.' },
  { name: 'radio', category: 'Voice', description: 'Toggles 24/7 Lofi & HD Radio audio streams in voice channels.' },
  
  // Welcome & Auto-Role
  { name: 'autorole', category: 'Welcome', description: 'Manage roles that are automatically assigned upon join.' },
  { name: 'goodbye', category: 'Welcome', description: 'Configure farewell departure cards and messages.' },
  { name: 'greet', category: 'Welcome', description: 'Test and preview welcome greetings.' },
  { name: 'welcome', category: 'Welcome', description: 'Configure rich welcome message and greeting channel.' }
];
