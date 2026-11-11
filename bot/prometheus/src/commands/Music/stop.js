import { SlashCommandBuilder } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { musicService } from '../../services/musicService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop audio playback, clear the queue, and disconnect from voice'),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const voiceChannel = interaction.member?.voice?.channel;
      if (!voiceChannel) {
        return interaction.editReply({
          embeds: [errorEmbed('You must be in a voice channel to stop music.')]
        });
      }

      musicService.deleteQueue(interaction.guildId);

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Playback Terminated',
        subtitle: `Channel: #${voiceChannel.name}`,
        lines: [
          `**Status** Playback halted and audio buffer cleared`,
          `**Connection** Voice session closed`,
          `**Stopped By** @${interaction.user.username}`
        ],
        footer: 'Prometheus Audio Engine · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed('Failed to stop playback.', err)]
      }).catch(() => {});
    }
  }
};
