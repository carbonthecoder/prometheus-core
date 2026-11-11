import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { suggestionVotes } from '../../commands/Community/suggest.js';
import { cozyEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';

async function handleSuggestVote(interaction, client, args) {
  try {
    const action = args[0]; // 'up' or 'down'
    const suggestionId = args[1];

    if (!suggestionId) {
      return interaction.reply({
        content: 'Invalid proposal reference.',
        flags: MessageFlags.Ephemeral
      });
    }

    let record = suggestionVotes.get(suggestionId);
    if (!record) {
      // Reconstitute from existing embed if restarted
      const embed = interaction.message.embeds[0];
      const textLine = embed?.description?.split('\n')?.find(l => l.includes('Feedback'));
      const text = textLine ? textLine.replace(/^.*Feedback\*\*\s*/, '') : 'Community Proposal';

      record = {
        authorId: null,
        text,
        channelId: interaction.channelId,
        messageId: interaction.message.id,
        upvotes: new Set(),
        downvotes: new Set()
      };
      suggestionVotes.set(suggestionId, record);
    }

    const userId = interaction.user.id;
    let feedbackMsg = '';

    if (action === 'up') {
      if (record.upvotes.has(userId)) {
        record.upvotes.delete(userId);
        feedbackMsg = 'Removed your upvote.';
      } else {
        record.upvotes.add(userId);
        record.downvotes.delete(userId);
        feedbackMsg = 'Registered your upvote.';
      }
    } else if (action === 'down') {
      if (record.downvotes.has(userId)) {
        record.downvotes.delete(userId);
        feedbackMsg = 'Removed your downvote.';
      } else {
        record.downvotes.add(userId);
        record.upvotes.delete(userId);
        feedbackMsg = 'Registered your downvote.';
      }
    }

    const upCount = record.upvotes.size;
    const downCount = record.downvotes.size;

    const oldEmbed = interaction.message.embeds[0];
    const updatedEmbed = cozyEmbed({
      symbol: '◇',
      title: oldEmbed.title ? oldEmbed.title.replace(/^◇\((.*)\)$/, '$1') : `Proposal #${suggestionId}`,
      subtitle: oldEmbed.description?.split('\n')?.[0]?.replace(/^`│`\s*\*\*/, '')?.replace(/\*\*$/, '') || null,
      lines: [
        `**Feedback** ${record.text}`,
        `**Status** Discussion Open`,
        `**Votes** ▲ ${upCount}  │  ▼ ${downCount}`
      ],
      thumbnail: oldEmbed.thumbnail?.url || null,
      footer: `Proposal #${suggestionId} · Accent #0e0d0d`,
      color: '#0e0d0d'
    });

    const updatedRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`suggest:up:${suggestionId}`)
        .setLabel(`▲ ${upCount}`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`suggest:down:${suggestionId}`)
        .setLabel(`▼ ${downCount}`)
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({
      embeds: [updatedEmbed],
      components: [updatedRow]
    });
  } catch (err) {
    logger.error('Error handling suggestion vote button:', err);
    return interaction.reply({
      content: 'Could not update your vote.',
      flags: MessageFlags.Ephemeral
    }).catch(() => {});
  }
}

export default {
  name: 'suggest',
  execute: handleSuggestVote
};
