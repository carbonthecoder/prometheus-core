import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { cozyEmbed, errorEmbed } from '../../utils/embeds.js';
import { musicService } from '../../services/musicService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Display real-time telemetry for the current audio track'),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const queue = musicService.getQueue(interaction.guildId);
      if (!queue.currentTrack) {
        return interaction.editReply({
          embeds: [errorEmbed('Nothing is currently playing.')]
        });
      }

      const track = queue.currentTrack;
      const isPaused = queue.player?.state?.status === 'paused';

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Now Playing',
        subtitle: `Track: ${track.title}`,
        lines: [
          `**Stream Source** \`${track.url.substring(0, 70)}\``,
          `**Status** ${isPaused ? 'Paused ⏸' : 'Streaming ▶'}`,
          `**Requested By** @${track.requestedBy?.username || 'Unknown'}`,
          `**Audio Bitrate** 48.0 kHz · Stereo 16-bit`
        ],
        thumbnail: track.requestedBy?.displayAvatarURL?.({ dynamic: true, size: 256 }) || null,
        footer: 'Prometheus Audio Engine · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed('Failed to inspect current track.', err)]
      }).catch(() => {});
    }
  }
};
