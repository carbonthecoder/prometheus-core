import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

// In a real database, you'd store this in Postgres.
// For the monolithic local build, we use a global Set.
global.wormholeChannels = global.wormholeChannels || new Set();

export default {
    data: new SlashCommandBuilder()
        .setName('wormhole')
        .setDescription('Connects this channel to the Global Inter-Server Chat.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('connect')
                .setDescription('Link this channel to the Wormhole network.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disconnect')
                .setDescription('Sever the Wormhole connection.')
        ),
        
    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const channelId = interaction.channelId;

        try {
            if (subcommand === 'connect') {
                if (global.wormholeChannels.has(channelId)) {
                    return InteractionHelper.safeEditReply(interaction, {
                        content: "This channel is already connected to the Wormhole."
                    });
                }
                
                global.wormholeChannels.add(channelId);
                
                const embed = new EmbedBuilder()
                    .setTitle("🌀 Wormhole Connected")
                    .setDescription("This channel is now globally linked. Any message sent here will be broadcasted to every other server on the network.")
                    .setColor("#9B59B6");
                
                await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
                
                // Broadcast connection
                broadcastWormhole(interaction.client, channelId, `**[SYSTEM]** A new server has joined the Wormhole...`);
            } 
            else if (subcommand === 'disconnect') {
                if (!global.wormholeChannels.has(channelId)) {
                    return InteractionHelper.safeEditReply(interaction, {
                        content: "This channel is not connected to the Wormhole."
                    });
                }
                
                global.wormholeChannels.delete(channelId);
                
                // Broadcast disconnection
                broadcastWormhole(interaction.client, channelId, `**[SYSTEM]** A server has severed its Wormhole connection.`);
                
                await InteractionHelper.safeEditReply(interaction, { content: "Wormhole connection severed." });
            }
        } catch (error) {
            console.error(error);
            await InteractionHelper.safeEditReply(interaction, {
                content: "Failed to configure the Wormhole.",
                ephemeral: true
            });
        }
    }
};

export async function broadcastWormhole(client, senderChannelId, messageContent, authorTag = null) {
    if (!global.wormholeChannels) return;
    
    for (const channelId of global.wormholeChannels) {
        if (channelId === senderChannelId) continue; // Don't send it back to the sender
        
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel && channel.isTextBased()) {
                const prefix = authorTag ? `[Wormhole] **${authorTag}**: ` : ``;
                await channel.send(`${prefix}${messageContent}`);
            }
        } catch (e) {
            // Channel might have been deleted, remove it
            global.wormholeChannels.delete(channelId);
        }
    }
}
