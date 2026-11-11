import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { cozyEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { handleInteractionError } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Inspect user profile and security details with cozy aesthetic UI")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to inspect (defaults to you)"),
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) {
        return;
      }

      const user = interaction.options.getUser("target") || interaction.user;
      const fetchedUser = await interaction.client.users.fetch(user.id, { force: true }).catch(() => user);
      const member = interaction.guild?.members.cache.get(user.id);

      const createdTimestamp = Math.floor(user.createdAt.getTime() / 1000);
      const joinedTimestamp = member?.joinedAt ? Math.floor(member.joinedAt.getTime() / 1000) : null;
      const avatarUrl = fetchedUser.displayAvatarURL({ dynamic: true, size: 512 });
      const bannerUrl = fetchedUser.bannerURL({ dynamic: true, size: 1024 }) || avatarUrl;

      const permissions = member 
        ? (member.permissions.has('Administrator') ? 'Administrator' : member.permissions.has('ManageGuild') ? 'Manager' : 'Member')
        : 'External User';

      const lines = [
        `**Permissions** ${permissions}`,
        `**Nickname** ${member?.nickname || 'None'}`,
        `**Joined** ${joinedTimestamp ? `<t:${joinedTimestamp}:D> · <t:${joinedTimestamp}:R>` : 'Not in server'}`
      ];

      const footerText = `Created <t:${createdTimestamp}:D> · Accent #0e0d0d`;

      const embed = cozyEmbed({
        symbol: '◇',
        title: `@${user.username}`,
        subtitle: `ID: ${user.id} · Profile`,
        lines,
        thumbnail: avatarUrl,
        footer: footerText,
        color: '#0e0d0d'
      });

      const buttonsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Profile ↗')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/users/${user.id}`),
        new ButtonBuilder()
          .setLabel('Avatar ↗')
          .setStyle(ButtonStyle.Link)
          .setURL(avatarUrl),
        new ButtonBuilder()
          .setLabel('Banner ↗')
          .setStyle(ButtonStyle.Link)
          .setURL(bannerUrl)
      );

      await InteractionHelper.safeEditReply(interaction, {
        embeds: [embed],
        components: [buttonsRow]
      });

      logger.info('UserInfo cozy response rendered', {
        userId: interaction.user.id,
        targetUserId: user.id
      });
    } catch (error) {
      logger.error('UserInfo execution error:', error);
      await handleInteractionError(interaction, error, {
        commandName: 'userinfo'
      });
    }
  },
};
