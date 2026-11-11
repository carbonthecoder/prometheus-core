import { SlashCommandBuilder } from 'discord.js';
import { cozyEmbed, errorEmbed } from '../../utils/embeds.js';
import { musicService } from '../../services/musicService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display current audio queue and upcoming tracks'),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const queue = musicService.getQueue(interaction.guildId);
      if (!queue.currentTrack && queue.tracks.length === 0) {
        return interaction.editReply({
          embeds: [errorEmbed('The audio queue is currently empty.')]
        });
      }

      const lines = [];
      if (queue.currentTrack) {
        lines.push(`**Now Playing** ${queue.currentTrack.title}`);
        lines.push(`**Requested By** @${queue.currentTrack.requestedBy?.username || 'Unknown'}`);
      }

      if (queue.tracks.length > 0) {
        const upcoming = queue.tracks.slice(0, 5).map((t, i) => `${i + 1}. ${t.title}`).join('\n│ ');
        lines.push(`**Upcoming Tracks**\n│ ${upcoming}`);
        if (queue.tracks.length > 5) {
          lines.push(`*...and ${queue.tracks.length - 5} more in queue*`);
        }
      } else {
        lines.push(`**Upcoming Tracks** None (queue end reached)`);
      }

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Audio Playback Queue',
        subtitle: `Total Tracks: ${queue.tracks.length + (queue.currentTrack ? 1 : 0)}`,
        lines,
        footer: 'Prometheus Audio Engine · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed('Failed to retrieve queue information.', err)]
      }).catch(() => {});
    }
  }
};
