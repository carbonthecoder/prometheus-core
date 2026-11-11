import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { ModmailService } from '../../services/modmailService.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('closemail')
    .setDescription('Resolve and archive the active modmail support thread')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Optional closure notice for user')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const channel = interaction.channel;
      if (!channel?.isThread?.()) {
        return interaction.editReply({
          embeds: [errorEmbed('This command can only be run inside a ModMail support thread.')]
        });
      }

      const userId = ModmailService.getUserIdFromThread(channel);
      if (!userId) {
        return interaction.editReply({
          embeds: [errorEmbed('This thread is not recognized as a ModMail thread.')]
        });
      }

      const reason = interaction.options.getString('reason') || 'Inquiry resolved by staff.';
      const targetUser = await interaction.client.users.fetch(userId).catch(() => null);

      if (targetUser) {
        const closeCard = cozyEmbed({
          symbol: '◇',
          title: 'Ticket Closed',
          subtitle: `Guild: ${interaction.guild.name}`,
          lines: [
            `**Resolution** ${reason}`,
            `**Staff Member** @${interaction.user.username}`,
            `**Notice** Send another direct message whenever you need further assistance.`
          ],
          footer: 'Prometheus Core Support · Accent #0e0d0d',
          color: '#0e0d0d'
        });

        await targetUser.send({ embeds: [closeCard] }).catch(() => {});
      }

      const confirmCard = cozyEmbed({
        symbol: '◇',
        title: 'Thread Archived',
        subtitle: `User: <@${userId}>`,
        lines: [
          `**Resolution** ${reason}`,
          `**Closed By** <@${interaction.user.id}>`
        ],
        footer: 'Prometheus Core ModMail · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      await interaction.editReply({ embeds: [confirmCard] });
      await channel.setLocked(true, 'Modmail ticket closed');
      await channel.setArchived(true, 'Modmail ticket closed');
    } catch (err) {
      logger.error('Error closing modmail thread:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to close modmail thread.', err)]
      }).catch(() => {});
    }
  }
};
