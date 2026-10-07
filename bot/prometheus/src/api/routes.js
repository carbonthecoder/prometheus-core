import { Router } from 'express';
import { getGuildConfig, updateGuildConfig } from '../services/guildConfig.js';
import { activeRadioSessions, RADIO_STATIONS, createHDAudioResource } from '../commands/Voice/radio.js';
import { joinVoiceChannel, createAudioPlayer, entersState, VoiceConnectionStatus, NoSubscriberBehavior } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';
import { ModerationService } from '../services/moderationService.js';
import { logger } from '../utils/logger.js';

export function createApiRouter(client) {
    const router = Router();

    // 1. Bot & System Telemetry Stats
    router.get('/stats', (req, res) => {
        try {
            const memoryUsage = process.memoryUsage();
            const totalGuilds = client.guilds.cache.size;
            const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
            const totalChannels = client.channels.cache.size;
            const dbStatus = client.db?.getStatus?.() || { connectionType: 'memory', isDegraded: false };

            res.json({
                status: 'online',
                version: '2.0.0',
                uptimeSeconds: Math.floor(process.uptime()),
                ping: client.ws?.ping ?? 0,
                guildsCount: totalGuilds,
                usersCount: totalMembers,
                channelsCount: totalChannels,
                activeRadioSessions: activeRadioSessions.size,
                memory: {
                    heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                    rssMB: Math.round(memoryUsage.rss / 1024 / 1024)
                },
                database: {
                    type: dbStatus.connectionType,
                    degraded: dbStatus.isDegraded
                }
            });
        } catch (error) {
            logger.error('API /stats error:', error);
            res.status(500).json({ error: 'Failed to fetch telemetry stats' });
        }
    });

    // 2. Full Command Registry
    router.get('/commands', (req, res) => {
        try {
            const commands = Array.from(client.commands.values()).map(cmd => ({
                name: cmd.data?.name || cmd.name,
                description: cmd.data?.description || cmd.description || 'No description',
                category: cmd.category || 'General',
                defaultPermissions: cmd.data?.default_member_permissions || null,
                optionsCount: cmd.data?.options?.length || 0
            }));

            res.json({ count: commands.length, commands });
        } catch (error) {
            logger.error('API /commands error:', error);
            res.status(500).json({ error: 'Failed to fetch command registry' });
        }
    });

    // 3. List of Guilds managed by bot
    router.get('/guilds', (req, res) => {
        try {
            const guilds = client.guilds.cache.map(g => ({
                id: g.id,
                name: g.name,
                iconURL: g.iconURL({ dynamic: true, size: 256 }) || null,
                memberCount: g.memberCount,
                ownerId: g.ownerId,
                joinedAt: g.joinedTimestamp
            }));

            res.json({ guilds });
        } catch (error) {
            logger.error('API /guilds error:', error);
            res.status(500).json({ error: 'Failed to list guilds' });
        }
    });

    // 4. Guild Detailed Metadata (Channels, Roles, Member count, Categories)
    router.get('/guilds/:guildId', async (req, res) => {
        try {
            const { guildId } = req.params;
            const guild = client.guilds.cache.get(guildId);

            if (!guild) {
                return res.status(404).json({ error: 'Guild not found on this bot instance' });
            }

            const textChannels = guild.channels.cache
                .filter(c => c.type === 0 || c.type === 5)
                .map(c => ({ id: c.id, name: c.name, parentId: c.parentId }));

            const voiceChannels = guild.channels.cache
                .filter(c => c.type === 2 || c.type === 13)
                .map(c => ({ id: c.id, name: c.name, parentId: c.parentId }));

            const categories = guild.channels.cache
                .filter(c => c.type === 4)
                .map(c => ({ id: c.id, name: c.name }));

            const roles = guild.roles.cache
                .filter(r => r.id !== guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => ({ id: r.id, name: r.name, color: r.hexColor, position: r.position }));

            const radioSession = activeRadioSessions.get(guildId);

            res.json({
                id: guild.id,
                name: guild.name,
                iconURL: guild.iconURL({ dynamic: true, size: 256 }) || null,
                memberCount: guild.memberCount,
                textChannels,
                voiceChannels,
                categories,
                roles,
                activeRadio: radioSession ? {
                    station: radioSession.stationKey,
                    volume: Math.round((radioSession.volume || 0.8) * 100),
                    voiceChannelId: radioSession.voiceChannelId
                } : null
            });
        } catch (error) {
            logger.error(`API /guilds/${req.params.guildId} error:`, error);
            res.status(500).json({ error: 'Failed to fetch guild details' });
        }
    });

    // 5. Get Guild Configuration
    router.get('/guilds/:guildId/config', async (req, res) => {
        try {
            const { guildId } = req.params;
            const config = await getGuildConfig(client, guildId);

            res.json({ guildId, config });
        } catch (error) {
            logger.error(`API /guilds/${req.params.guildId}/config GET error:`, error);
            res.status(500).json({ error: 'Failed to retrieve configuration' });
        }
    });

    // 6. Save / Update Guild Configuration
    router.post('/guilds/:guildId/config', async (req, res) => {
        try {
            const { guildId } = req.params;
            const updates = req.body;

            if (!updates || typeof updates !== 'object') {
                return res.status(400).json({ error: 'Invalid configuration payload' });
            }

            const updatedConfig = await updateGuildConfig(client, guildId, updates);
            logger.info(`Dashboard updated configuration for guild ${guildId}`);

            res.json({
                success: true,
                message: 'Configuration saved successfully',
                config: updatedConfig
            });
        } catch (error) {
            logger.error(`API /guilds/${req.params.guildId}/config POST error:`, error);
            res.status(500).json({ error: 'Failed to save configuration' });
        }
    });

    // 7. Web Moderation Action Dispatcher (Ban, Kick, Timeout, Warn, Unban, Purge)
    router.post('/guilds/:guildId/moderation/action', async (req, res) => {
        try {
            const { guildId } = req.params;
            const { action, targetUserId, reason, durationMinutes, amount, channelId } = req.body;

            const guild = client.guilds.cache.get(guildId);
            if (!guild) return res.status(404).json({ error: 'Guild not found' });

            if (action === 'ban') {
                await guild.members.ban(targetUserId, { reason: reason || 'Banned via Prometheus Web Dashboard' });
                return res.json({ success: true, message: `Successfully banned user ${targetUserId}` });
            }

            if (action === 'kick') {
                const member = await guild.members.fetch(targetUserId).catch(() => null);
                if (!member) return res.status(404).json({ error: 'Member not found in guild' });
                await member.kick(reason || 'Kicked via Prometheus Web Dashboard');
                return res.json({ success: true, message: `Successfully kicked ${member.user.tag}` });
            }

            if (action === 'timeout') {
                const member = await guild.members.fetch(targetUserId).catch(() => null);
                if (!member) return res.status(404).json({ error: 'Member not found in guild' });
                const ms = (durationMinutes || 10) * 60 * 1000;
                await member.timeout(ms, reason || 'Timed out via Prometheus Web Dashboard');
                return res.json({ success: true, message: `Successfully timed out ${member.user.tag} for ${durationMinutes || 10}m` });
            }

            if (action === 'unban') {
                await guild.members.unban(targetUserId, reason || 'Unbanned via Prometheus Web Dashboard');
                return res.json({ success: true, message: `Successfully unbanned user ${targetUserId}` });
            }

            if (action === 'purge') {
                const targetChannel = guild.channels.cache.get(channelId);
                if (!targetChannel) return res.status(404).json({ error: 'Channel not found' });
                const count = Math.min(100, Math.max(1, amount || 10));
                const deleted = await targetChannel.bulkDelete(count, true);
                return res.json({ success: true, message: `Purged ${deleted.size} messages in #${targetChannel.name}` });
            }

            res.status(400).json({ error: `Unknown moderation action: ${action}` });
        } catch (error) {
            logger.error('API moderation action error:', error);
            res.status(500).json({ error: error.message || 'Moderation action failed' });
        }
    });

    // 8. Custom Rich Embed Dispatcher
    router.post('/guilds/:guildId/embed/send', async (req, res) => {
        try {
            const { guildId } = req.params;
            const { channelId, title, description, color, authorName, authorIcon, footerText, footerIcon, thumbnail, image, fields } = req.body;

            const guild = client.guilds.cache.get(guildId);
            if (!guild) return res.status(404).json({ error: 'Guild not found' });

            const channel = guild.channels.cache.get(channelId);
            if (!channel) return res.status(404).json({ error: 'Target channel not found' });

            const embed = new EmbedBuilder();
            if (title) embed.setTitle(title);
            if (description) embed.setDescription(description);
            if (color) embed.setColor(color);
            if (authorName) embed.setAuthor({ name: authorName, iconURL: authorIcon || undefined });
            if (footerText) embed.setFooter({ text: footerText, iconURL: footerIcon || undefined });
            if (thumbnail) embed.setThumbnail(thumbnail);
            if (image) embed.setImage(image);

            if (Array.isArray(fields)) {
                fields.forEach(f => {
                    if (f.name && f.value) embed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                });
            }

            await channel.send({ embeds: [embed] });
            res.json({ success: true, message: `Embed successfully broadcast to #${channel.name}` });
        } catch (error) {
            logger.error('API embed send error:', error);
            res.status(500).json({ error: error.message || 'Failed to send embed' });
        }
    });

    // 9. Remote Radio Control
    router.post('/music/control', async (req, res) => {
        try {
            const { guildId, action, station, volume, voiceChannelId } = req.body;
            if (!guildId) return res.status(400).json({ error: 'Missing guildId' });

            const guild = client.guilds.cache.get(guildId);
            if (!guild) return res.status(404).json({ error: 'Guild not found' });

            const session = activeRadioSessions.get(guildId);

            if (action === 'stop') {
                if (session) {
                    try {
                        session.player.stop();
                        session.connection.destroy();
                        activeRadioSessions.delete(guildId);
                    } catch (e) {}
                }
                return res.json({ success: true, message: 'Radio stopped' });
            }

            if (action === 'set_volume') {
                const volLevel = Number(volume);
                if (session && session.currentResource?.volume && !isNaN(volLevel)) {
                    const dec = Math.max(0.01, Math.min(1.0, volLevel / 100));
                    session.currentResource.volume.setVolume(dec);
                    session.volume = dec;
                    return res.json({ success: true, volume: volLevel });
                }
                return res.status(400).json({ error: 'No active stream to adjust volume' });
            }

            if (action === 'play') {
                const targetStation = RADIO_STATIONS[station] || RADIO_STATIONS.lofi;
                const channelId = voiceChannelId || session?.voiceChannelId;

                if (!channelId) return res.status(400).json({ error: 'No voice channel specified' });

                const channel = guild.channels.cache.get(channelId);
                if (!channel) return res.status(404).json({ error: 'Voice channel not found' });

                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfDeaf: true
                });

                await entersState(connection, VoiceConnectionStatus.Ready, 15_000);

                const player = session?.player || createAudioPlayer({
                    behaviors: { noSubscriber: NoSubscriberBehavior.Play }
                });

                const vol = (volume ? volume / 100 : session?.volume) || 0.8;
                const { resource, process: proc } = createHDAudioResource(targetStation.url, vol);
                player.play(resource);
                connection.subscribe(player);

                activeRadioSessions.set(guildId, {
                    connection,
                    player,
                    stationKey: station || 'lofi',
                    station: targetStation,
                    volume: vol,
                    currentResource: resource,
                    ffmpegProcess: proc,
                    voiceChannelId: channel.id
                });

                return res.json({
                    success: true,
                    message: `Playing ${targetStation.name} in ${channel.name}`,
                    station: targetStation.name
                });
            }

            res.status(400).json({ error: 'Unknown action' });
        } catch (error) {
            logger.error('API /music/control error:', error);
            res.status(500).json({ error: error.message || 'Music control failed' });
        }
    });

    return router;
}
