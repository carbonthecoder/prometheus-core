import { ChannelType, ThreadAutoArchiveDuration, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { cozyEmbed, successEmbed, infoEmbed } from '../utils/embeds.js';
import { getGuildConfig } from './guildConfig.js';
import { logger } from '../utils/logger.js';

const pendingThreads = new Set();

export class ModmailService {
  static getUserIdFromThread(thread) {
    const match = thread.name.match(/\d{17,20}/);
    return match ? match[0] : null;
  }

  static async handleUserDm(message, client) {
    if (message.author.bot) return;

    const user = message.author;
    if (pendingThreads.has(user.id)) return;

    // Find a mutual guild with configured modmailChannelId
    for (const guild of client.guilds.cache.values()) {
      try {
        const config = await getGuildConfig(client, guild.id);
        const modmailChannelId = config?.modmailChannelId;
        if (!modmailChannelId) continue;

        // Verify member belongs to this guild
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) continue;

        const mailChannel = guild.channels.cache.get(modmailChannelId);
        if (!mailChannel || !mailChannel.isTextBased()) continue;

        // Search for existing active thread
        const targetThreadName = `mail-${user.id}`;
        let thread = mailChannel.threads?.cache?.find(t => t.name === targetThreadName && !t.locked);

        if (!thread && mailChannel.threads) {
          const active = await mailChannel.threads.fetchActive().catch(() => null);
          thread = active?.threads?.find(t => t.name === targetThreadName && !t.locked);
        }

        if (!thread) {
          pendingThreads.add(user.id);
          try {
            thread = await mailChannel.threads.create({
              name: targetThreadName,
              autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
              type: ChannelType.PrivateThread,
              reason: `Prometheus ModMail inquiry for @${user.username} (${user.id})`
            });

            // Initial thread header card
            const welcomeCard = cozyEmbed({
              symbol: '◇',
              title: `ModMail Dispatch · @${user.username}`,
              subtitle: `User ID: ${user.id} · Profile`,
              lines: [
                `**User** <@${user.id}> (\`${user.id}\`)`,
                `**Joined Server** <t:${Math.floor((member.joinedTimestamp || Date.now()) / 1000)}:R>`,
                `**Status** Thread Opened · Send messages here to reply to user`
              ],
              thumbnail: user.displayAvatarURL({ dynamic: true, size: 256 }),
              footer: 'Prometheus Core ModMail · Accent #0e0d0d',
              color: '#0e0d0d'
            });

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel('Profile')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/users/${user.id}`)
            );

            await thread.send({ embeds: [welcomeCard], components: [row] });
          } finally {
            pendingThreads.delete(user.id);
          }
        }

        // Forward message to thread
        const userMsgCard = cozyEmbed({
          symbol: '◇',
          title: `@${user.username}`,
          subtitle: `Inquiry Message`,
          lines: [
            `**Content** ${message.content || '*(Attachment only)*'}`
          ],
          thumbnail: user.displayAvatarURL({ dynamic: true, size: 128 }),
          footer: `Received <t:${Math.floor(Date.now() / 1000)}:R> · Accent #0e0d0d`,
          color: '#0e0d0d'
        });

        const files = Array.from(message.attachments.values()).map(a => a.url);
        await thread.send({ embeds: [userMsgCard], files });

        // Confirm to user
        const receiptCard = cozyEmbed({
          symbol: '◇',
          title: 'Transmission Received',
          subtitle: `Guild: ${guild.name}`,
          lines: [
            `**Status** Dispatched to server moderation team`,
            `**Notice** Staff responses will be delivered here directly`
          ],
          footer: 'Prometheus Core · Accent #0e0d0d',
          color: '#0e0d0d'
        });

        await user.send({ embeds: [receiptCard] }).catch(() => {});
        return;
      } catch (err) {
        logger.error('Error handling ModMail DM relay:', err);
      }
    }
  }

  static async handleStaffReply(message, client) {
    if (!message.guild || message.author.bot) return;
    if (!message.channel.isThread()) return;

    // Check if channel is a mail thread
    const targetUserId = this.getUserIdFromThread(message.channel);
    if (!targetUserId) return;

    // Ignore staff internal notes starting with //
    if (message.content.startsWith('//')) return;

    try {
      const targetUser = await client.users.fetch(targetUserId).catch(() => null);
      if (!targetUser) return;

      const replyEmbed = cozyEmbed({
        symbol: '◇',
        title: `Response from ${message.guild.name}`,
        subtitle: `Staff Member: @${message.author.username}`,
        lines: [
          `**Reply** ${message.content || '*(Attachment)*'}`
        ],
        thumbnail: message.guild.iconURL({ dynamic: true, size: 128 }) || message.author.displayAvatarURL(),
        footer: 'Prometheus Core Support · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      const files = Array.from(message.attachments.values()).map(a => a.url);
      await targetUser.send({ embeds: [replyEmbed], files });
      await message.react('✅').catch(() => {});
    } catch (err) {
      logger.error('Failed to relay staff response to user DM:', err);
      await message.reply({ content: 'Could not deliver DM to user (DMs may be closed).' }).catch(() => {});
    }
  }
}
