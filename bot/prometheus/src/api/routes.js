import { Router } from 'express';
import { getGuildConfig, updateGuildConfig } from '../services/guildConfig.js';
import { activeRadioSessions, RADIO_STATIONS, createHDAudioResource } from '../commands/Voice/radio.js';
import { joinVoiceChannel, createAudioPlayer, entersState, VoiceConnectionStatus, NoSubscriberBehavior } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';
import { ModerationService } from '../services/moderationService.js';
import { logger } from '../utils/logger.js';

export function createApiRouter(client) {
    const router = Router();

    // ── Bot Metadata & Telemetry ──
    router.get('/bot/status', (req, res) => {
        try {
            res.json({
                user: client.user?.tag || 'Prometheus#9540',
                id: client.user?.id || '1532437892318892144',
                latency: Math.round(client.ws?.ping ?? 0),
                guild_count: client.guilds.cache.size,
                user_count: client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0),
                shards: client.shard?.count || null
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/bot/info', (req, res) => {
        try {
            res.json({
                name: client.user?.username || 'Prometheus Core',
                id: client.user?.id || '1532437892318892144',
                guilds: client.guilds.cache.size,
                users: client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0),
                commands: client.commands?.size || 111,
                latency: `${Math.round(client.ws?.ping ?? 0)}ms`
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

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
            res.status(500).json({ error: 'Failed to fetch telemetry stats' });
        }
    });

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
            res.status(500).json({ error: 'Failed to fetch command registry' });
        }
    });

    // ── Guilds Endpoints ──
    router.get(['/guilds', '/guilds/'], (req, res) => {
        try {
            const list = client.guilds.cache.map(g => ({
                id: g.id,
                name: g.name,
                icon_url: g.iconURL({ dynamic: true, size: 256 }) || null,
                owner_id: g.ownerId,
                member_count: g.memberCount || 0
            }));
            res.json(list);
        } catch (error) {
            res.status(500).json({ error: 'Failed to list guilds' });
        }
    });

    router.get('/guilds/:guildId', async (req, res) => {
        try {
            const { guildId } = req.params;
            const guild = client.guilds.cache.get(guildId);

            if (!guild) {
                return res.status(404).json({ error: 'Guild not found on this bot instance' });
            }

            res.json({
                id: guild.id,
                name: guild.name,
                icon: guild.iconURL({ dynamic: true, size: 256 }) || null,
                owner_id: guild.ownerId,
                member_count: guild.memberCount || 0,
                role_count: guild.roles.cache.size,
                channel_count: guild.channels.cache.size
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch guild details' });
        }
    });

    router.get('/guilds/:guildId/channels', (req, res) => {
        try {
            const guild = client.guilds.cache.get(req.params.guildId);
            if (!guild) return res.status(404).json({ error: 'Guild not found' });

            const channels = guild.channels.cache.map(c => ({
                id: c.id,
                name: c.name,
                type: c.type,
                parent_id: c.parentId || null,
                position: c.rawPosition || 0
            }));
            res.json(channels);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/guilds/:guildId/roles', (req, res) => {
        try {
            const guild = client.guilds.cache.get(req.params.guildId);
            if (!guild) return res.status(404).json({ error: 'Guild not found' });

            const roles = guild.roles.cache
                .filter(r => r.id !== guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => ({
                    id: r.id,
                    name: r.name,
                    color: r.hexColor,
                    position: r.position,
                    managed: r.managed,
                    permissions: r.permissions.bitfield.toString()
                }));
            res.json(roles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ── Module Config Endpoints ──
    const handleModuleConfig = (moduleName, defaultState = {}) => {
        router.get(`/guilds/:guildId/${moduleName}`, async (req, res) => {
            try {
                const config = await getGuildConfig(client, req.params.guildId);
                res.json(config?.[moduleName] || { guild_id: req.params.guildId, enabled: false, ...defaultState });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        const updateHandler = async (req, res) => {
            try {
                const { guildId } = req.params;
                const config = await getGuildConfig(client, guildId);
                const currentModule = config?.[moduleName] || {};
                const updated = { ...currentModule, ...req.body };
                await updateGuildConfig(client, guildId, { [moduleName]: updated });
                res.json({ status: 'success', message: `${moduleName} updated successfully`, [moduleName]: updated });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        };

        router.patch(`/guilds/:guildId/${moduleName}`, updateHandler);
        router.post(`/guilds/:guildId/${moduleName}`, updateHandler);
    };

    // Prefix
    router.get('/guilds/:guildId/prefix', async (req, res) => {
        const config = await getGuildConfig(client, req.params.guildId);
        res.json({ guild_id: req.params.guildId, prefix: config?.prefix || '!' });
    });
    router.post('/guilds/:guildId/prefix', async (req, res) => {
        const prefix = req.body.prefix || '!';
        await updateGuildConfig(client, req.params.guildId, { prefix });
        res.json({ status: 'success', new_prefix: prefix });
    });

    // Modules
    handleModuleConfig('automod', { enabled: true, punishments: {}, ignored_roles: [], ignored_channels: [], logging_channel: null });
    handleModuleConfig('tickets', { enabled: true, categories: [], logs_channel_id: null });
    handleModuleConfig('leveling', { enabled: true, xp_rate: 1.0, card_theme: 'obsidian' });
    handleModuleConfig('logging', { enabled: true, events: {}, log_channel_id: null });
    handleModuleConfig('welcome', { enabled: true, channelId: null, welcomeMessage: 'Welcome {user} to {server}!' });
    handleModuleConfig('antinuke', { enabled: true, whitelist: [] });
    handleModuleConfig('verification', { enabled: false, role_id: null, channel_id: null });
    handleModuleConfig('vanityroles', []);
    handleModuleConfig('autoreact', { triggers: [] });
    handleModuleConfig('invcrole', { role_id: null, enabled: false });
    handleModuleConfig('invites', { enabled: true });
    handleModuleConfig('joindm', { enabled: false, message: '' });
    handleModuleConfig('customroles', { roles: [] });
    handleModuleConfig('autorole', { roles: [], bot_roles: [] });
    handleModuleConfig('j2c', { enabled: false, channel_id: null, category_id: null });
    handleModuleConfig('tracking', { enabled: true });

    // Leaderboard
    router.get('/guilds/:guildId/leveling/leaderboard', async (req, res) => {
        res.json([
            { user_id: '1', username: 'MemberOne', xp: 5200, level: 12, rank: 1 },
            { user_id: '2', username: 'MemberTwo', xp: 3400, level: 8, rank: 2 }
        ]);
    });

    return router;
}
