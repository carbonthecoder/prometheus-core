import { SlashCommandBuilder } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { musicService } from '../../services/musicService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the currently playing track'),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const queue = musicService.getQueue(interaction.guildId);
      if (!queue.currentTrack) {
        return interaction.editReply({
          embeds: [errorEmbed('There is no active track to skip.')]
        });
      }

      const skippedTitle = queue.currentTrack.title;
      queue.skip();

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Track Skipped',
        subtitle: `Skipped by @${interaction.user.username}`,
        lines: [
          `**Skipped Track** ${skippedTitle}`,
          `**Remaining in Queue** ${queue.tracks.length} track(s)`
        ],
        footer: 'Prometheus Audio Engine · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed('Failed to skip track.', err)]
      }).catch(() => {});
    }
  }
};
