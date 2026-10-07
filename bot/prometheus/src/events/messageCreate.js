




import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { getLevelingConfig, getUserLevelData } from '../services/leveling.js';
import { addXp } from '../services/xpSystem.js';
import { checkRateLimit } from '../utils/rateLimiter.js';
import { analyzeToxicity, generateChatEvent, analyzeImage } from '../services/aiService.js';
import EconomyService from '../services/economyService.js';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { broadcastWormhole } from '../commands/Tools/wormhole.js';

const activeEvents = new Map(); // Tracks if an event is currently running in a channel

const MESSAGE_XP_RATE_LIMIT_ATTEMPTS = 12;
const MESSAGE_XP_RATE_LIMIT_WINDOW_MS = 10000;

export default {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      
      // --- MODMAIL SUPPORT SYSTEM (DMs) ---
      if (!message.guild) {
          if (message.author.bot) return;
          
          // Forward the DM to a channel named 'modmail' in any mutual guild
          client.guilds.cache.forEach(async (guild) => {
              const modmailChannel = guild.channels.cache.find(c => c.name === 'modmail');
              if (modmailChannel) {
                  const embed = new EmbedBuilder()
                      .setAuthor({ name: `${message.author.tag} (ID: ${message.author.id})`, iconURL: message.author.displayAvatarURL() })
                      .setDescription(message.content || '*(No text, might be an attachment)*')
                      .setColor('#E74C3C')
                      .setFooter({ text: `Use /reply ${message.author.id} to respond` });
                      
                  await modmailChannel.send({ embeds: [embed] }).catch(() => {});
              }
          });
          
          await message.author.send("✅ Your message has been sent to the moderation team.").catch(() => {});
          return;
      }
      // ------------------------------------

      if (message.author.bot) return;

      // --- WORMHOLE BROADCASTING ---
      if (global.wormholeChannels && global.wormholeChannels.has(message.channel.id)) {
          // Broadcast to all other servers, don't stop processing so it can still earn XP
          broadcastWormhole(client, message.channel.id, message.content, message.author.tag);
      }
      // -----------------------------

      // --- NEURAL ENGINE: PREDICTIVE MODERATION ---
      
      // 1. Image OCR & Vision Analysis
      if (message.attachments.size > 0) {
          const image = message.attachments.find(a => a.contentType?.startsWith('image/'));
          if (image) {
              try {
                  const response = await axios.get(image.url, { responseType: 'arraybuffer' });
                  const base64 = Buffer.from(response.data, 'binary').toString('base64');
                  const visionResult = await analyzeImage(base64, image.contentType);
                  
                  if (visionResult.isToxic) {
                      logger.warn(`[AI Vision] Flagged image by ${message.author.tag}`);
                      await message.delete().catch(() => {});
                      await message.channel.send(`⚠️ **Neural AutoMod** intercepted an image from ${message.author} for failing visual safety checks.`).catch(() => {});
                      return;
                  }
              } catch (err) {
                  logger.error("[AI Vision] Failed to process image attachment.");
              }
          }
      }

      // 2. Text Toxicity Analysis
      const aiModResult = await analyzeToxicity(message.content);
      if (aiModResult && aiModResult.isToxic) {
          logger.warn(`[AI Moderation] Flagged message by ${message.author.tag}: ${aiModResult.reason}`);
          await message.delete().catch(() => {});
          await message.channel.send(`⚠️ **Neural AutoMod** intercepted a message from ${message.author} for failing semantic safety checks.\nReason: *${aiModResult.reason}*`).catch(() => {});
          return; // Stop further processing
      }
      // --------------------------------------------

      // --- BELUGA CHAT EVENTS ---
      // 2% chance to drop a random AI event if chat is active and no event is running
      if (Math.random() < 0.02 && !activeEvents.has(message.channel.id)) {
          triggerChatEvent(message.channel, client);
      }
      // --------------------------

      await handleLeveling(message, client);
    } catch (error) {
      logger.error('Error in messageCreate event:', error);
    }
  }
};








async function handleLeveling(message, client) {
  try {
    const rateLimitKey = `xp-event:${message.guild.id}:${message.author.id}`;
    const canProcess = await checkRateLimit(rateLimitKey, MESSAGE_XP_RATE_LIMIT_ATTEMPTS, MESSAGE_XP_RATE_LIMIT_WINDOW_MS);
    if (!canProcess) {
      return;
    }

    const levelingConfig = await getLevelingConfig(client, message.guild.id);
    
    if (!levelingConfig?.enabled) {
      return;
    }

    
    if (levelingConfig.ignoredChannels?.includes(message.channel.id)) {
      return;
    }

    
    if (levelingConfig.ignoredRoles?.length > 0) {
      const member = await message.guild.members.fetch(message.author.id).catch(() => {
        return null;
      });
      if (member && member.roles.cache.some(role => levelingConfig.ignoredRoles.includes(role.id))) {
        return;
      }
    }

    
    if (levelingConfig.blacklistedUsers?.includes(message.author.id)) {
      return;
    }

    
    if (!message.content || message.content.trim().length === 0) {
      return;
    }

    const userData = await getUserLevelData(client, message.guild.id, message.author.id);
    
    
    const cooldownTime = levelingConfig.xpCooldown || 60;
    const now = Date.now();
    const timeSinceLastMessage = now - (userData.lastMessage || 0);
    
    
    if (timeSinceLastMessage < cooldownTime * 1000) {
      return;
    }

    
    const minXP = levelingConfig.xpRange?.min || levelingConfig.xpPerMessage?.min || 15;
    const maxXP = levelingConfig.xpRange?.max || levelingConfig.xpPerMessage?.max || 25;

    
    const safeMinXP = Math.max(1, minXP);
    const safeMaxXP = Math.max(safeMinXP, maxXP);

    
    const xpToGive = Math.floor(Math.random() * (safeMaxXP - safeMinXP + 1)) + safeMinXP;

    
    let finalXP = xpToGive;
    if (levelingConfig.xpMultiplier && levelingConfig.xpMultiplier > 1) {
      finalXP = Math.floor(finalXP * levelingConfig.xpMultiplier);
    }

    
    const result = await addXp(client, message.guild, message.member, finalXP);
    
    if (result.success && result.leveledUp) {
      logger.info(
        `${message.author.tag} leveled up to level ${result.level} in ${message.guild.name}`
      );
    }
  } catch (error) {
    logger.error('Error handling leveling for message:', error);
  }
}

async function triggerChatEvent(channel, client) {
    activeEvents.set(channel.id, true);
    
    try {
        const event = await generateChatEvent();
        if (!event) {
            activeEvents.delete(channel.id);
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(event.type === 'riddle' ? '🧠 AI Riddle Drop!' : '⌨️ Speed Typing Test!')
            .setDescription(`**${event.question}**\n\n*First person to type the correct answer gets $2,500 coins!*`)
            .setColor('#9B59B6');

        await channel.send({ embeds: [embed] });

        const filter = m => !m.author.bot && m.content.toLowerCase().includes(event.answer.toLowerCase());
        const collector = channel.createMessageCollector({ filter, time: 60000, max: 1 });

        collector.on('collect', async m => {
            await EconomyService.addMoney(client, m.guild.id, m.author.id, 2500, 'Chat Event Drop');
            await channel.send(`🎉 **GG!** ${m.author} got it right! The answer was \`${event.answer}\`. You've been awarded **$2,500** coins!`);
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                channel.send(`⏰ Time's up! No one got it. The answer was \`${event.answer}\`.`);
            }
            activeEvents.delete(channel.id);
        });

    } catch (error) {
        logger.error('[CHAT_EVENT] Failed to trigger event:', error);
        activeEvents.delete(channel.id);
    }
}


