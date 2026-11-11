import { SlashCommandBuilder } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { musicService } from '../../services/musicService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play an audio stream or music URL in your voice channel')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('Direct audio URL or stream link')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const voiceChannel = interaction.member?.voice?.channel;
      if (!voiceChannel) {
        return interaction.editReply({
          embeds: [errorEmbed('You must be connected to a voice channel to use this command.')]
        });
      }

      const query = interaction.options.getString('query', true).trim();
      const queue = musicService.getQueue(interaction.guildId);

      await queue.connect(voiceChannel);

      const track = {
        title: query.startsWith('http') ? query.split('/').pop()?.split('?')[0] || 'Audio Stream' : query,
        url: query,
        requestedBy: interaction.user
      };

      queue.enqueue(track);

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Track Enqueued',
        subtitle: `Channel: #${voiceChannel.name}`,
        lines: [
          `**Title** ${track.title}`,
          `**Source** \`${track.url.substring(0, 80)}\``,
          `**Requested By** @${interaction.user.username}`,
          `**Queue Position** #${queue.tracks.length + (queue.currentTrack ? 1 : 0)}`
        ],
        thumbnail: interaction.user.displayAvatarURL({ dynamic: true, size: 256 }),
        footer: 'Prometheus Audio Engine · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error('Error in play command:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to join voice channel or enqueue stream.', err)]
      }).catch(() => {});
    }
  }
};
