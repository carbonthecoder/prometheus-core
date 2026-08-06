import { SlashCommandBuilder } from 'discord.js';
import { reviewCode } from '../../services/aiService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { createEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('review')
        .setDescription('Summons the AI to roast and fix your terrible code.')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The code snippet you want reviewed')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const code = interaction.options.getString('code');
            const review = await reviewCode(code);

            const embed = createEmbed({
                title: "💻 Neural Code Architect",
                description: review,
                color: "primary"
            }).setFooter({ text: "Powered by Gemini AI", iconURL: "https://cdn-icons-png.flaticon.com/512/2083/2083213.png" });

            await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
        } catch (error) {
            console.error(error);
            await InteractionHelper.safeEditReply(interaction, {
                content: "Failed to review the code. It was probably too bad for the AI to look at.",
                ephemeral: true
            });
        }
    }
};
