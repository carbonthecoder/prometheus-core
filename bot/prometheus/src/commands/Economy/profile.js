import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { getEconomyData } from '../../utils/economy.js';
import { getUserLevelData } from '../../services/leveling.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Generates your custom Dynamic ID Passport.'),
        
    async execute(interaction) {

        try {
            const user = interaction.user;
            const guildId = interaction.guild.id;

            // Fetch Data
            const ecoData = await getEconomyData(interaction.client, guildId, user.id);
            const levelData = await getUserLevelData(interaction.client, guildId, user.id);

            const balance = ecoData?.wallet || 0;
            const bank = ecoData?.bank || 0;
            const level = levelData?.level || 1;
            const xp = levelData?.xp || 0;

            // Canvas Setup
            const canvas = createCanvas(850, 400);
            const ctx = canvas.getContext('2d');

            // 1. Premium Background Gradient
            const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            bgGradient.addColorStop(0, '#0a0a0c');
            bgGradient.addColorStop(1, '#1a1025'); // Deep Dark Purple
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 2. Glassmorphism Card Overlay
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.roundRect(20, 20, 810, 360, 20);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 3. Neon Accent Line (Top)
            const accentGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            accentGradient.addColorStop(0, '#9B59B6'); // Purple
            accentGradient.addColorStop(1, '#57F287'); // Green
            ctx.fillStyle = accentGradient;
            ctx.fillRect(20, 20, 810, 6);

            // 4. Draw Avatar with Glowing Border
            ctx.save();
            ctx.beginPath();
            ctx.arc(150, 200, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            
            // Avatar Glow
            ctx.shadowColor = '#9B59B6';
            ctx.shadowBlur = 30;
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#9B59B6';
            ctx.stroke();
            
            ctx.clip();

            const avatarUrl = user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 512 });
            const avatarRes = await fetch(avatarUrl); 
            const avatarBuffer = await avatarRes.arrayBuffer(); 
            const avatar = await loadImage(Buffer.from(avatarBuffer));
            ctx.drawImage(avatar, 50, 100, 200, 200);
            ctx.restore();

            // 5. User Information
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'transparent'; // Remove glow for text
            ctx.font = 'bold 50px sans-serif';
            ctx.fillText(user.username.toUpperCase(), 300, 110);

            // ID Badge
            ctx.fillStyle = 'rgba(155, 89, 182, 0.2)';
            ctx.roundRect(300, 130, 220, 35, 10);
            ctx.fill();
            ctx.fillStyle = '#9B59B6';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(`NEURAL ARCHITECT`, 315, 155);

            // 6. Economy Stats
            ctx.fillStyle = '#A0A0A0';
            ctx.font = '22px sans-serif';
            ctx.fillText(`CASH BALANCE`, 300, 220);
            ctx.fillStyle = '#57F287';
            ctx.font = 'bold 38px sans-serif';
            ctx.fillText(`$${balance.toLocaleString()}`, 300, 260);

            ctx.fillStyle = '#A0A0A0';
            ctx.font = '22px sans-serif';
            ctx.fillText(`VAULT RESERVE`, 580, 220);
            ctx.fillStyle = '#FEE75C';
            ctx.font = 'bold 38px sans-serif';
            ctx.fillText(`$${bank.toLocaleString()}`, 580, 260);

            // 7. XP Progress Bar
            const xpMax = level * 1000; 
            const xpPercent = Math.min(xp / xpMax, 1);
            
            ctx.fillStyle = '#A0A0A0';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(`LEVEL ${level}`, 300, 320);
            ctx.textAlign = 'right';
            ctx.fillText(`${xp} / ${xpMax} XP`, 800, 320);
            ctx.textAlign = 'left'; // Reset

            // Empty Bar
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.roundRect(300, 335, 500, 15, 8);
            ctx.fill();
            
            // Filled Bar
            const fillGradient = ctx.createLinearGradient(300, 0, 800, 0);
            fillGradient.addColorStop(0, '#9B59B6');
            fillGradient.addColorStop(1, '#EB459E');
            ctx.fillStyle = fillGradient;
            ctx.roundRect(300, 335, 500 * xpPercent, 15, 8);
            ctx.fill();

            // Build Attachment
            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-passport.png' });

            await InteractionHelper.safeEditReply(interaction, { files: [attachment] });

        } catch (error) {
            console.error('[PROFILE] Error generating canvas:', error);
            await InteractionHelper.safeEditReply(interaction, {
                content: "Failed to generate your ID Passport. Try again later.",
                ephemeral: true
            });
        }
    }
};
