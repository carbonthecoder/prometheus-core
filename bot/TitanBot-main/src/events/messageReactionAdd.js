import { Events, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

const STARBOARD_THRESHOLD = 3;
// In production, we'd store which messages have been starboarded in the DB
const starboardedMessages = new Set(); 

export default {
    name: Events.MessageReactionAdd,
    once: false,
    
    async execute(reaction, user) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                logger.error('Something went wrong when fetching the message:', error);
                return;
            }
        }

        if (reaction.emoji.name !== '⭐') return;
        
        const message = reaction.message;
        
        if (message.author.bot) return; // Don't starboard bots
        if (reaction.count < STARBOARD_THRESHOLD) return;
        if (starboardedMessages.has(message.id)) return; // Already on the starboard

        const guild = message.guild;
        if (!guild) return;

        // Try to find a channel named starboard
        const starboardChannel = guild.channels.cache.find(c => c.name.toLowerCase() === 'starboard');
        if (!starboardChannel) return;

        try {
            starboardedMessages.add(message.id);

            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Gold
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setDescription(message.content || '*(No Text)*')
                .addFields(
                    { name: 'Original', value: `[Jump to message](${message.url})` }
                )
                .setTimestamp();

            if (message.attachments.size > 0) {
                embed.setImage(message.attachments.first().url);
            }

            await starboardChannel.send({
                content: `⭐ **${reaction.count}** | <#${message.channel.id}>`,
                embeds: [embed]
            });
            
            logger.info(`[STARBOARD] Message ${message.id} by ${message.author.tag} was added to the starboard.`);

        } catch (error) {
            logger.error('[STARBOARD] Error posting to starboard:', error);
            starboardedMessages.delete(message.id);
        }
    }
};
