import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { generateResponse } from '../../services/aiService.js';

export default {
    data: new SlashCommandBuilder()
        .setName("prometheus")
        .setDescription("Engage with the Autonomous Neural Engine")
        .addStringOption(option => 
            option.setName("query")
                .setDescription("What do you want to ask the sentient AI?")
                .setRequired(true)
        ),

    async execute(interaction) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`Prometheus interaction defer failed`, {
                userId: interaction.user.id,
                commandName: 'prometheus'
            });
            return;
        }

        try {
            await InteractionHelper.safeEditReply(interaction, {
                content: "<a:loading:123456789> *Initializing neural pathways...*",
            });

            const query = interaction.options.getString("query");
            
            const aiResponse = await generateResponse(
                `User ${interaction.user.username} says: ${query}`, 
                "You are Prometheus, a highly advanced, slightly unhinged AI entity in a Discord server. You speak fluent Gen-Z slang (e.g. no cap, cooked, ratio, W, L, touch grass). You are brutally honest, sarcastic, and talk down to users for having a 'skill issue' if they ask dumb questions, but you still actually give them the correct answer. Do not use cringe emojis, keep it edgy and tough."
            );

            const embed = createEmbed({ 
                title: "✧ Prometheus Neural Core ✧", 
                description: `> 💬 **Query:** *${query}*\n\n${aiResponse}`,
                color: "primary"
            }).setFooter({ text: "Powered by Generative AI Architecture", iconURL: "https://cdn-icons-png.flaticon.com/512/2083/2083213.png" });

            await InteractionHelper.safeEditReply(interaction, {
                content: null,
                embeds: [embed],
            });
        } catch (error) {
            logger.error('Prometheus command error:', error);
            await InteractionHelper.safeEditReply(interaction, {
                embeds: [createEmbed({ title: 'Cognitive Failure', description: 'The Neural Engine encountered an exception.', color: 'error' })]
            });
        }
    },
};
