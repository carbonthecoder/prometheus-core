import { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('Creates a full JSON backup of the server layout (Channels, Roles, Categories).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            
            // Backup Roles
            const roles = guild.roles.cache
                .filter(r => !r.managed && r.id !== guild.id)
                .map(r => ({
                    name: r.name,
                    color: r.hexColor,
                    hoist: r.hoist,
                    permissions: r.permissions.bitfield.toString(),
                    position: r.position
                }));

            // Backup Channels
            const channels = guild.channels.cache
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    parentId: c.parentId,
                    position: c.position,
                    userLimit: c.userLimit || 0,
                    bitrate: c.bitrate || 64000
                }));

            const backupData = {
                guildId: guild.id,
                guildName: guild.name,
                timestamp: Date.now(),
                roles: roles,
                channels: channels
            };

            const jsonString = JSON.stringify(backupData, null, 4);
            const buffer = Buffer.from(jsonString, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `backup-${guild.id}.json` });

            await InteractionHelper.safeEditReply(interaction, {
                content: `✅ **Server Backup Complete.**\nKeep this \`.json\` file safe. Do not share it with anyone.`,
                files: [attachment]
            });
            
        } catch (error) {
            console.error(error);
            await InteractionHelper.safeEditReply(interaction, {
                content: "Failed to generate server backup.",
                ephemeral: true
            });
        }
    }
};
