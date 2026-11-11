import { SlashCommandBuilder } from 'discord.js';
import { cozyEmbed } from '../../utils/embeds.js';
import { InviteService } from '../../services/inviteService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Check invite statistics for yourself or another server member')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Target member to inspect (defaults to you)')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const target = interaction.options.getUser('user') || interaction.user;
      const stats = InviteService.getStats(interaction.guildId, target.id);

      const embed = cozyEmbed({
        symbol: '◇',
        title: `@${target.username}`,
        subtitle: `ID: ${target.id} · Invite Record`,
        lines: [
          `**Total Invites** ${stats.total}`,
          `**Joined** ${stats.joins} members`,
          `**Left** ${stats.left} members`,
          `**Bonus** ${stats.total - stats.joins + stats.left}`
        ],
        thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
        footer: 'Prometheus Invite Telemetry · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        content: 'Failed to retrieve invite statistics.'
      }).catch(() => {});
    }
  }
};
