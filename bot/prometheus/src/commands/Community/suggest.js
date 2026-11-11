import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { getGuildConfig, updateGuildConfig } from '../../services/guildConfig.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export const suggestionVotes = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit an idea or improvement proposal for the community')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Describe your suggestion clearly')
        .setRequired(true)
        .setMaxLength(1024)
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral });
      if (!deferSuccess) return;

      const text = interaction.options.getString('text', true).trim();
      const config = await getGuildConfig(interaction.client, interaction.guildId);
      const channelId = config?.suggestionChannelId;

      if (!channelId) {
        return interaction.editReply({
          embeds: [errorEmbed('No suggestion channel has been configured. An administrator must run `/setsuggestions` first.')]
        });
      }

      const targetChannel = interaction.guild.channels.cache.get(channelId);
      if (!targetChannel?.isTextBased?.()) {
        return interaction.editReply({
          embeds: [errorEmbed('The configured suggestion channel is no longer accessible.')]
        });
      }

      const suggestionId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const user = interaction.user;

      const embed = cozyEmbed({
        symbol: '◇',
        title: `Proposal #${suggestionId}`,
        subtitle: `Submitted by @${user.username}`,
        lines: [
          `**Feedback** ${text}`,
          `**Status** Discussion Open`,
          `**Votes** ▲ 0  │  ▼ 0`
        ],
        thumbnail: user.displayAvatarURL({ dynamic: true, size: 256 }),
        footer: `Proposal #${suggestionId} · Accent #0e0d0d`,
        color: '#0e0d0d'
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`suggest:up:${suggestionId}`)
          .setLabel('▲ 0')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`suggest:down:${suggestionId}`)
          .setLabel('▼ 0')
          .setStyle(ButtonStyle.Secondary)
      );

      const msg = await targetChannel.send({
        embeds: [embed],
        components: [row]
      });

      suggestionVotes.set(suggestionId, {
        authorId: user.id,
        text,
        channelId: targetChannel.id,
        messageId: msg.id,
        upvotes: new Set(),
        downvotes: new Set()
      });

      return interaction.editReply({
        embeds: [successEmbed(`Your suggestion has been posted to <#${targetChannel.id}> (#${suggestionId}).`)]
      });
    } catch (err) {
      logger.error('Error submitting suggestion:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to dispatch suggestion proposal.', err)]
      }).catch(() => {});
    }
  }
};
