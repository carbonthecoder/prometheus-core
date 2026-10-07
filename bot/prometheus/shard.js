import { ShardingManager } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './src/utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the token exists
if (!process.env.DISCORD_TOKEN) {
  logger.error('[SHARDING_MANAGER] ❌ CRITICAL: No DISCORD_TOKEN found in .env');
  process.exit(1);
}

// Point the manager to the bot's core entry point
const manager = new ShardingManager(path.join(__dirname, 'src/app.js'), {
  token: process.env.DISCORD_TOKEN,
  totalShards: 'auto', // Automatically calculates how many shards are needed based on server count
  respawn: true // Auto-restart crashed shards
});

manager.on('shardCreate', shard => {
  logger.info(`[SHARDING_MANAGER] 🚀 Successfully launched Shard ${shard.id}`);
});

// Boot up the cluster
logger.info(`[SHARDING_MANAGER] ⚙️ Booting up Prometheus Enterprise Cluster...`);
manager.spawn().catch(error => {
  logger.error(`[SHARDING_MANAGER] ❌ FATAL ERROR: Failed to spawn shards:`, error);
});
