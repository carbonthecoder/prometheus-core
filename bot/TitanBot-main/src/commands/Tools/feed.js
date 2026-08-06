import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('feed')
        .setDescription('Pulls the top trending post from any Subreddit.')
        .addStringOption(option =>
            option.setName('subreddit')
                .setDescription('Name of the subreddit (e.g. programmerhumor)')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const sub = interaction.options.getString('subreddit').replace('r/', '');
            
            // Reddit JSON API is free and public
            const response = await axios.get(`https://www.reddit.com/r/${sub}/top.json?limit=1&t=day`);
            
            if (!response.data || !response.data.data.children.length) {
                return InteractionHelper.safeEditReply(interaction, {
                    content: "Could not find any trending posts for that Subreddit.",
                    ephemeral: true
                });
            }

            const post = response.data.data.children[0].data;

            const embed = new EmbedBuilder()
                .setTitle(post.title.substring(0, 250))
                .setDescription(post.selftext ? post.selftext.substring(0, 1000) + '...' : `[View on Reddit](https://reddit.com${post.permalink})`)
                .setColor("#FF4500") // Reddit Orange
            .setAuthor({ name: `r/${post.subreddit} • Posted by u/${post.author}`, iconURL: 'https://www.redditinc.com/assets/images/site/reddit-logo.png' })
            .setFooter({ text: `⬆️ ${post.ups} Upvotes | 💬 ${post.num_comments} Comments` });

            // If it's an image post, embed the image natively
            if (post.url && post.url.match(/\.(jpeg|jpg|gif|png)$/)) {
                embed.setImage(post.url);
            }

            await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
            
        } catch (error) {
            console.error(error);
            await InteractionHelper.safeEditReply(interaction, {
                content: "Failed to connect to the Social Feed API. The subreddit might be private or banned.",
                ephemeral: true
            });
        }
    }
};
