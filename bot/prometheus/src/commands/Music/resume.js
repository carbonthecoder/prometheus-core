import { SlashCommandBuilder } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { musicService } from '../../services/musicService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume paused audio playback'),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const queue = musicService.getQueue(interaction.guildId);
      const resumed = queue.resume();

      if (!resumed) {
        return interaction.editReply({
          embeds: [errorEmbed('Playback is not currently paused or no track is loaded.')]
        });
      }

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Playback Resumed',
        subtitle: `Track: ${queue.currentTrack?.title || 'Active Track'}`,
        lines: [
          `**State** Audio streaming resumed ▶`,
          `**Buffer** Real-time synchronization restored`
        ],
        footer: 'Prometheus Audio Engine · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed('Failed to resume playback.', err)]
      }).catch(() => {});
    }
  }
};
