import { SlashCommandBuilder } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { createEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('imagine')
        .setDescription('Generates a high-resolution AI image from a text prompt.')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('What do you want the AI to draw?')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const rawPrompt = interaction.options.getString('prompt');
            
            // Pollinations.ai provides a completely free, keyless text-to-image API.
            // We encode the prompt to ensure it works in the URL safely.
            const encodedPrompt = encodeURIComponent(rawPrompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

            const embed = createEmbed({
                title: "🎨 AI Image Generator",
                description: `> 💬 **Prompt:** *${rawPrompt}*`,
                color: "primary"
            })
            .setImage(imageUrl)
            .setFooter({ text: "Rendered by Pollinations.ai Engine", iconURL: "https://cdn-icons-png.flaticon.com/512/2083/2083213.png" });

            await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
        } catch (error) {
            console.error(error);
            await InteractionHelper.safeEditReply(interaction, {
                content: "The AI image generator failed to render your prompt. Try again later.",
                ephemeral: true
            });
        }
    }
};
