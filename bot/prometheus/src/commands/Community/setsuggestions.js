import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { updateGuildConfig } from '../../services/guildConfig.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setsuggestions')
    .setDescription('Configure the destination feed channel for member suggestions')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Target channel for receiving new proposals')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const channel = interaction.options.getChannel('channel', true);

      await updateGuildConfig(interaction.client, interaction.guildId, {
        suggestionChannelId: channel.id
      });

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Suggestion Feed Configured',
        subtitle: `Channel: #${channel.name}`,
        lines: [
          `**Feed** <#${channel.id}>`,
          `**Status** Active`,
          `**Command** Members submit proposals via \`/suggest\``
        ],
        footer: 'Prometheus Infrastructure · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error('Error configuring suggestions channel:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to update suggestion channel settings.', err)]
      }).catch(() => {});
    }
  }
};
