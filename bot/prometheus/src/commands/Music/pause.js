import { SlashCommandBuilder } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { musicService } from '../../services/musicService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the active audio playback'),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const queue = musicService.getQueue(interaction.guildId);
      const paused = queue.pause();

      if (!paused) {
        return interaction.editReply({
          embeds: [errorEmbed('Playback is already paused or no track is active.')]
        });
      }

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Playback Paused',
        subtitle: `Track: ${queue.currentTrack?.title || 'Active Track'}`,
        lines: [
          `**State** Audio paused ⏸`,
          `**Resume** Use \`/resume\` to continue streaming`
        ],
        footer: 'Prometheus Audio Engine · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed('Failed to pause track.', err)]
      }).catch(() => {});
    }
  }
};
