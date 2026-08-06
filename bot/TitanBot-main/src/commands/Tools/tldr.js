import { SlashCommandBuilder } from 'discord.js';
import { summarizeChannel } from '../../services/aiService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { createEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('tldr')
        .setDescription('Summons the AI to summarize the last 100 messages in this channel.'),
        
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            
            // Filter out bot messages and system messages to focus on actual drama
            const userMessages = messages
                .filter(m => !m.author.bot && !m.system && m.content.length > 0)
                .map(m => ({ author: m.author.username, content: m.content }))
                .reverse(); // Chronological order

            if (userMessages.length < 5) {
                return InteractionHelper.safeEditReply(interaction, {
                    content: "Bro, this chat is dead. There's nothing to summarize. Go outside.",
                    ephemeral: true
                });
            }

            const summary = await summarizeChannel(userMessages);

            const embed = createEmbed({
                title: "📜 Channel TL;DR (Neural Summary)",
                description: summary,
                color: "primary"
            }).setFooter({ text: "Powered by Gemini AI", iconURL: "https://cdn-icons-png.flaticon.com/512/2083/2083213.png" });

            await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
        } catch (error) {
            console.error(error);
            await InteractionHelper.safeEditReply(interaction, {
                content: "Failed to generate summary. The AI is probably tired.",
                ephemeral: true
            });
        }
    }
};
