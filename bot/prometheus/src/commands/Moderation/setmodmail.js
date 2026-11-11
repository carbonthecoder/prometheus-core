import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { updateGuildConfig } from '../../services/guildConfig.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setmodmail')
    .setDescription('Configure the staff channel where user DMs create private support threads')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Text channel that will host modmail threads')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const channel = interaction.options.getChannel('channel', true);

      await updateGuildConfig(interaction.client, interaction.guildId, {
        modmailChannelId: channel.id
      });

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'ModMail Dispatch Configured',
        subtitle: `Channel: #${channel.name}`,
        lines: [
          `**Feed** <#${channel.id}>`,
          `**Behavior** DMs from server members will automatically create private staff threads`,
          `**Staff Replies** Type directly in thread to answer (prefix with \`//\` for internal staff notes)`
        ],
        footer: 'Prometheus Infrastructure · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error('Error configuring modmail channel:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to update modmail settings.', err)]
      }).catch(() => {});
    }
  }
};
