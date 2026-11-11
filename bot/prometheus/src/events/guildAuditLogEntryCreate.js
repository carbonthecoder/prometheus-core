import { Events, AuditLogEvent, PermissionFlagsBits, ChannelType } from 'discord.js';
import { cozyEmbed } from '../utils/embeds.js';
import { getGuildConfig } from '../services/guildConfig.js';
import { logger } from '../utils/logger.js';

const processedAuditIds = new Set();
const AUDIT_CACHE_LIMIT = 500;

export default {
  name: Events.GuildAuditLogEntryCreate,
  once: false,

  async execute(auditLogEntry, guild) {
    try {
      if (!guild || !auditLogEntry) return;

      const { id, action, executorId, targetId, reason, extra } = auditLogEntry;

      // Prevent duplicate processing
      if (processedAuditIds.has(id)) return;
      processedAuditIds.add(id);
      if (processedAuditIds.size > AUDIT_CACHE_LIMIT) {
        const first = processedAuditIds.values().next().value;
        processedAuditIds.delete(first);
      }

      const client = guild.client;
      if (!executorId || executorId === client.user.id) return;
      if (executorId === guild.ownerId) return;

      const config = await getGuildConfig(client, guild.id);
      const antinuke = config?.antinuke;
      if (!antinuke?.enabled) return;

      const whitelist = antinuke.whitelist || [];
      if (whitelist.includes(executorId)) return;

      const me = guild.members.me;
      const canBan = me?.permissions.has(PermissionFlagsBits.BanMembers);

      // Check dangerous audit log actions
      const isDangerousAction = [
        AuditLogEvent.ChannelDelete,
        AuditLogEvent.RoleDelete,
        AuditLogEvent.MemberBanAdd,
        AuditLogEvent.MemberKick,
        AuditLogEvent.BotAdd,
        AuditLogEvent.WebhookCreate,
        AuditLogEvent.WebhookDelete
      ].includes(action);

      if (!isDangerousAction) return;

      logger.warn(`[ANTINUKE] Unauthorized action ${action} by ${executorId} in ${guild.name}`);

      // Neutralize the rogue actor
      if (canBan) {
        await guild.members.ban(executorId, {
          reason: `Prometheus Antinuke: Unauthorized high-risk action (${action})`
        }).catch(() => {});
      }

      // Reversal logic
      if (action === AuditLogEvent.BotAdd && targetId) {
        // Kick the unauthorized bot
        const botMember = await guild.members.fetch(targetId).catch(() => null);
        if (botMember && me?.permissions.has(PermissionFlagsBits.KickMembers)) {
          await botMember.kick('Prometheus Antinuke: Unauthorized bot addition').catch(() => {});
        }
      }

      // Dispatch alert to system or logging channel
      const alertChannel = guild.systemChannel || guild.channels.cache.find(c => c.name === 'logs' || c.name === 'mod-logs' || c.name === 'general');
      if (alertChannel?.isTextBased?.()) {
        const alertEmbed = cozyEmbed({
          symbol: '◇',
          title: 'Threat Neutralized',
          subtitle: `Guild Security · Antinuke Enforcement`,
          lines: [
            `**Perpetrator** <@${executorId}> (\`${executorId}\`)`,
            `**Action Trigger** \`AuditLogEvent #${action}\``,
            `**Countermeasure** Perpetrator banned · Unauthorized entities revoked`,
            `**Status** Defense protocol operational`
          ],
          footer: 'Prometheus Antinuke Engine · Accent #0e0d0d',
          color: '#0e0d0d'
        });

        await alertChannel.send({ embeds: [alertEmbed] }).catch(() => {});
      }
    } catch (err) {
      logger.error('Error in Antinuke audit observer:', err);
    }
  }
};
