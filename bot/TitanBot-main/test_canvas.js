import { Client, GatewayIntentBits } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import 'dotenv/config';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    try {
        const user = await client.users.fetch('954250474763198494'); // The user id from the logs
        const avatarUrl = user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 });
        console.log('Avatar URL:', avatarUrl);
        
        const avatarRes = await fetch(avatarUrl);
        const avatarBuffer = await avatarRes.arrayBuffer();
        
        console.log('Buffer byte length:', avatarBuffer.byteLength);
        
        const avatar = await loadImage(Buffer.from(avatarBuffer));
        console.log('Successfully loaded avatar image:', avatar.width, 'x', avatar.height);
    } catch (e) {
        console.error('Error:', e);
    }
    client.destroy();
});

client.login(process.env.DISCORD_TOKEN);
