import { Events, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getColor } from '../config/bot.js';
import { cozyEmbed } from '../utils/embeds.js';
import { InviteService } from '../services/inviteService.js';
import { getGuildConfig } from '../services/guildConfig.js';
import { getWelcomeConfig } from '../utils/database.js';
import { formatWelcomeMessage } from '../utils/welcome.js';
import { logEvent, EVENT_TYPES } from '../services/loggingService.js';
import { getServerCounters, updateCounter } from '../services/serverstatsService.js';
import { setBirthday as dbSetBirthday } from '../utils/database.js';
import { logger } from '../utils/logger.js';

// --- FORT KNOX ANTI-RAID STATE ---
const joinTracker = new Map();
const RAID_THRESHOLD = 5; // 5 joins
const RAID_WINDOW_MS = 10000; // in 10 seconds
// ---------------------------------

export default {
  name: Events.GuildMemberAdd,
  once: false,
  
  async execute(member) {
    try {
        const { guild, user } = member;

        // --- FORT KNOX RAID DETECTION ---
        if (!joinTracker.has(guild.id)) {
            joinTracker.set(guild.id, []);
        }
        
        const timestamps = joinTracker.get(guild.id);
        const now = Date.now();
        
        // Push current join time
        timestamps.push(now);
        
        // Remove timestamps older than window
        const recentJoins = timestamps.filter(t => now - t < RAID_WINDOW_MS);
        joinTracker.set(guild.id, recentJoins);
        
        if (recentJoins.length >= RAID_THRESHOLD) {
            logger.warn(`[ANTI-RAID] Raid detected in ${guild.name}! Locking down...`);
            
            // Execute lockdown (Remove send messages from @everyone)
            const everyoneRole = guild.roles.everyone;
            if (everyoneRole) {
                await everyoneRole.setPermissions(
                    everyoneRole.permissions.remove(PermissionFlagsBits.SendMessages)
                ).catch(() => {});
            }
            
            // Kick the raiding bot/user
            await member.kick('Fort Knox Anti-Raid: Automated Defense').catch(() => {});
            
            // Find system channel to announce lockdown
            const systemChannel = guild.systemChannel || guild.channels.cache.find(c => c.name === 'general');
            if (systemChannel) {
                await systemChannel.send('🛡️ **FORT KNOX PROTOCOL ENGAGED**\nRaid detected. The server has been automatically locked down. Sending permissions disabled for `@everyone`.').catch(() => {});
            }
            return; // Stop processing this user
        }
        // --------------------------------
        
        const config = await getGuildConfig(member.client, guild.id);
        
        const welcomeConfig = await getWelcomeConfig(member.client, guild.id);
        
        const welcomeChannelId = welcomeConfig?.channelId;

        if (welcomeConfig?.enabled && welcomeChannelId) {
            const channel = guild.channels.cache.get(welcomeChannelId);
            if (channel?.isTextBased?.()) {
                const me = guild.members.me;
                const permissions = me ? channel.permissionsFor(me) : null;
                if (!permissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
                    return;
                }

                const inviterData = await InviteService.findInviter(member);
                const inviterText = inviterData?.inviter ? `@${inviterData.inviter.username} (code: ${inviterData.code})` : 'Vanity URL or Direct';
                const createdTimestamp = Math.floor(user.createdAt.getTime() / 1000);
                const nowTimestamp = Math.floor(Date.now() / 1000);

                const messageContent = welcomeConfig.welcomePing ? user.toString() : null;
                const canEmbed = permissions.has(PermissionFlagsBits.EmbedLinks);

                if (!canEmbed) {
                    await channel.send({
                        content: messageContent || `Welcome ${user} to ${guild.name}!`
                    });
                } else {
                    const embed = cozyEmbed({
                        symbol: '◇',
                        title: `@${user.username}`,
                        subtitle: `ID: ${user.id} · Member #${guild.memberCount}`,
                        lines: [
                            `**Member** <@${user.id}> (\`${user.id}\`)`,
                            `**Invited By** ${inviterText}`,
                            `**Joined** <t:${nowTimestamp}:R>`,
                            `**Created** <t:${createdTimestamp}:R>`
                        ],
                        thumbnail: user.displayAvatarURL({ dynamic: true, size: 256 }),
                        footer: `Welcome to ${guild.name} · Accent #0e0d0d`,
                        color: '#0e0d0d'
                    });
                    
                    if (welcomeConfig.welcomeImage) {
                        embed.setImage(welcomeConfig.welcomeImage);
                    }

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('Profile')
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://discord.com/users/${user.id}`),
                        new ButtonBuilder()
                            .setLabel('Avatar')
                            .setStyle(ButtonStyle.Link)
                            .setURL(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    );
                    
                    await channel.send({ 
                        content: messageContent,
                        embeds: [embed],
                        components: [row]
                    });
                }
            }
        }
        
        if (welcomeConfig?.roleIds && welcomeConfig.roleIds.length > 0) {
            const delay = welcomeConfig.autoRoleDelay || 0;
            const singleRoleId = welcomeConfig.roleIds[0];
            
            if (delay > 0) {
                const timeout = setTimeout(async () => {
                    const role = guild.roles.cache.get(singleRoleId);
                    if (role) {
                        await assignRoleSafely(member, role);
                    }
                }, delay * 1000);
                if (typeof timeout.unref === 'function') {
                    timeout.unref();
                }
            } else {
                const role = guild.roles.cache.get(singleRoleId);
                if (role) {
                    await assignRoleSafely(member, role);
                }
            }
        }
        
        if (config?.verification?.enabled || config?.verification?.autoVerify?.enabled) {
            await handleVerification(member, guild, config.verification, member.client);
        }

        
        try {
            await logEvent({
                client: member.client,
                guildId: guild.id,
                eventType: EVENT_TYPES.MEMBER_JOIN,
                data: {
                    description: `${user.tag} joined the server`,
                    userId: user.id,
                    fields: [
                        {
                            name: '👤 Member',
                            value: `${user.tag} (${user.id})`,
                            inline: true
                        },
                        {
                            name: '👥 Member Count',
                            value: guild.memberCount.toString(),
                            inline: true
                        },
                        {
                            name: '📅 Account Created',
                            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
                            inline: true
                        }
                    ]
                }
            });
        } catch (error) {
            logger.debug('Error logging member join:', error);
        }
        
        
        try {
            const counters = await getServerCounters(member.client, guild.id);
            for (const counter of counters) {
                if (counter && counter.type && counter.channelId && counter.enabled !== false) {
                    await updateCounter(member.client, guild, counter);
                }
            }
        } catch (error) {
            logger.debug('Error updating counters on member join:', error);
        }
        
        // Restore birthday data if the member previously left
        try {
            const backupKey = `guild:${guild.id}:birthdays:left`;
            const backup = (await member.client.db.get(backupKey)) || {};
            if (backup[user.id]) {
                const { month, day } = backup[user.id];
                await dbSetBirthday(member.client, guild.id, user.id, month, day);
                delete backup[user.id];
                await member.client.db.set(backupKey, backup);
                logger.debug(`Birthday restored for user ${user.id} in guild ${guild.id}`);
            }
        } catch (error) {
            logger.debug('Error restoring birthday on member join:', error);
        }
        
    } catch (error) {
        logger.error('Error in guildMemberAdd event:', error);
    }
  }
};

async function handleVerification(member, guild, verificationConfig, client) {
    const { autoVerifyOnJoin } = await import('../services/verificationService.js');
    
    try {
        const result = await autoVerifyOnJoin(client, guild, member, verificationConfig);
        
        if (result.autoVerified) {
            logger.info('User auto-verified on join', {
                guildId: guild.id,
                userId: member.id,
                userTag: member.user.tag,
                roleName: result.roleName,
                criteria: result.criteria
            });
        } else {
            logger.debug('User not auto-verified on join', {
                guildId: guild.id,
                userId: member.id,
                reason: result.reason
            });
        }

    } catch (error) {
        logger.error('Error in auto-verification for member', {
            guildId: guild.id,
            userId: member.id,
            userTag: member.user.tag,
            error: error.message
        });
    }
}

async function assignRoleSafely(member, role) {
    try {
        await member.roles.add(role);
    } catch (error) {
        logger.warn(`Failed to assign role ${role.id} to member ${member.id}:`, error);
    }
}



