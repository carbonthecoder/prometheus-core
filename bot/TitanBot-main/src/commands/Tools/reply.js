import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reply')
        .setDescription('Replies to a user via Modmail.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The ID of the user to reply to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send them')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const userId = interaction.options.getString('userid');
            const replyMsg = interaction.options.getString('message');
            
            const targetUser = await interaction.client.users.fetch(userId).catch(() => null);
            
            if (!targetUser) {
                return InteractionHelper.safeEditReply(interaction, {
                    content: "Could not find a user with that ID.",
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.guild.name} Moderation Team`, iconURL: interaction.guild.iconURL() })
                .setDescription(replyMsg)
                .setColor('#2ECC71')
                .setFooter({ text: `Reply to this DM to send another message.` });

            await targetUser.send({ embeds: [embed] });

            // Log it in the channel
            await interaction.channel.send({
                content: `📤 **Reply sent to ${targetUser.tag} by ${interaction.user}:**\n> ${replyMsg}`
            });

            await InteractionHelper.safeEditReply(interaction, {
                content: `✅ Reply successfully sent to ${targetUser.tag}.`,
                ephemeral: true
            });
            
        } catch (error) {
            console.error(error);
            await InteractionHelper.safeEditReply(interaction, {
                content: "Failed to send the message. They might have DMs disabled.",
                ephemeral: true
            });
        }
    }
};
