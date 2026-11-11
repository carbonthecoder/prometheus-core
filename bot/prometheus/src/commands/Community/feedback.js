import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { getGuildConfig } from '../../services/guildConfig.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

function getStarDisplay(rating) {
  const full = '★ '.repeat(rating);
  const empty = '☆ '.repeat(5 - rating);
  return `${full}${empty}`.trim();
}

export default {
  data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Submit server or service review with a star rating')
    .addIntegerOption(option =>
      option
        .setName('rating')
        .setDescription('Score from 1 to 5 stars')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addStringOption(option =>
      option
        .setName('review')
        .setDescription('Your feedback comment')
        .setRequired(true)
        .setMaxLength(1024)
    )
    .addAttachmentOption(option =>
      option
        .setName('attachment')
        .setDescription('Optional proof or screenshot')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral });
      if (!deferSuccess) return;

      const rating = interaction.options.getInteger('rating', true);
      const review = interaction.options.getString('review', true).trim();
      const attachment = interaction.options.getAttachment('attachment');

      const config = await getGuildConfig(interaction.client, interaction.guildId);
      const channelId = config?.feedbackChannelId;

      if (!channelId) {
        return interaction.editReply({
          embeds: [errorEmbed('No feedback channel has been configured. An administrator must run `/setfeedback` first.')]
        });
      }

      const targetChannel = interaction.guild.channels.cache.get(channelId);
      if (!targetChannel?.isTextBased?.()) {
        return interaction.editReply({
          embeds: [errorEmbed('The configured feedback channel is not accessible.')]
        });
      }

      const user = interaction.user;
      const stars = getStarDisplay(rating);
      const timestamp = Math.floor(Date.now() / 1000);

      const embed = cozyEmbed({
        symbol: '◇',
        title: 'Community Review',
        subtitle: `Rating ${stars} (${rating}/5)`,
        lines: [
          `**Feedback** "${review}"`,
          `**Reviewer** @${user.username} (\`${user.id}\`)`,
          `**Submitted** <t:${timestamp}:F> · <t:${timestamp}:R>`
        ],
        thumbnail: user.displayAvatarURL({ dynamic: true, size: 256 }),
        footer: 'Verified Community Review · Accent #0e0d0d',
        color: '#0e0d0d'
      });

      if (attachment?.url) {
        embed.setImage(attachment.url);
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Profile')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/users/${user.id}`)
      );

      await targetChannel.send({
        embeds: [embed],
        components: [row]
      });

      return interaction.editReply({
        embeds: [successEmbed(`Thank you. Your review has been posted to <#${targetChannel.id}>.`)]
      });
    } catch (err) {
      logger.error('Error submitting feedback:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to dispatch feedback review.', err)]
      }).catch(() => {});
    }
  }
};
