import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { updateGuildConfig } from '../../services/guildConfig.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setfeedback')
    .setDescription('Configure the destination review channel for community feedback')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Target channel for receiving verified reviews')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const channel = interaction.options.getChannel('channel', true);

      await updateGuildConfig(interaction.client, interaction.guildId, {
        feedbackChannelId: channel.id
      });

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Feedback Channel Configured',
        subtitle: `Channel: #${channel.name}`,
        lines: [
          `**Feed** <#${channel.id}>`,
          `**Status** Active`,
          `**Command** Members submit reviews via \`/feedback\``
        ],
        footer: 'Prometheus Infrastructure · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error('Error configuring feedback channel:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to update feedback channel settings.', err)]
      }).catch(() => {});
    }
  }
};
