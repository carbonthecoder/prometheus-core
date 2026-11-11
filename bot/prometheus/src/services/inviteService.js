import { Collection } from 'discord.js';
import { logger } from '../utils/logger.js';

// Guild ID -> Collection<InviteCode, uses>
const guildInvitesCache = new Map();

// Guild ID -> Map<UserId, { total: number, joins: number, left: number, fake: number }>
const inviteCounters = new Map();

export class InviteService {
  static async initGuildInvites(guild) {
    try {
      if (!guild.members.me?.permissions.has('ManageGuild')) return;
      const invites = await guild.invites.fetch().catch(() => null);
      if (!invites) return;

      const codeMap = new Map();
      invites.forEach(inv => codeMap.set(inv.code, inv.uses || 0));
      guildInvitesCache.set(guild.id, codeMap);
    } catch (err) {
      logger.debug(`Could not cache invites for ${guild.name}:`, err.message);
    }
  }

  static onInviteCreate(invite) {
    if (!invite?.guild?.id) return;
    const cache = guildInvitesCache.get(invite.guild.id) || new Map();
    cache.set(invite.code, invite.uses || 0);
    guildInvitesCache.set(invite.guild.id, cache);
  }

  static onInviteDelete(invite) {
    if (!invite?.guild?.id) return;
    const cache = guildInvitesCache.get(invite.guild.id);
    if (cache) {
      cache.delete(invite.code);
    }
  }

  static async findInviter(member) {
    const guild = member.guild;
    const beforeCache = guildInvitesCache.get(guild.id) || new Map();

    try {
      if (!guild.members.me?.permissions.has('ManageGuild')) return null;
      const currentInvites = await guild.invites.fetch().catch(() => null);
      if (!currentInvites) return null;

      // Update cache
      const newCache = new Map();
      currentInvites.forEach(inv => newCache.set(inv.code, inv.uses || 0));
      guildInvitesCache.set(guild.id, newCache);

      // Identify which code incremented
      const usedInvite = currentInvites.find(inv => {
        const prevUses = beforeCache.get(inv.code) || 0;
        return (inv.uses || 0) > prevUses;
      });

      if (!usedInvite || !usedInvite.inviter) return null;

      const inviter = usedInvite.inviter;
      this.incrementInvites(guild.id, inviter.id);
      return { inviter, code: usedInvite.code, uses: usedInvite.uses };
    } catch (err) {
      logger.error('Error finding inviter on member join:', err);
      return null;
    }
  }

  static incrementInvites(guildId, userId) {
    if (!inviteCounters.has(guildId)) {
      inviteCounters.set(guildId, new Map());
    }
    const guildStats = inviteCounters.get(guildId);
    const userStats = guildStats.get(userId) || { total: 0, joins: 0, left: 0, fake: 0 };
    userStats.total += 1;
    userStats.joins += 1;
    guildStats.set(userId, userStats);
  }

  static incrementLeaves(guildId, userId) {
    if (!inviteCounters.has(guildId)) return;
    const guildStats = inviteCounters.get(guildId);
    const userStats = guildStats.get(userId);
    if (userStats) {
      userStats.left += 1;
      userStats.total = Math.max(0, userStats.total - 1);
    }
  }

  static getStats(guildId, userId) {
    const guildStats = inviteCounters.get(guildId);
    return guildStats?.get(userId) || { total: 0, joins: 0, left: 0, fake: 0 };
  }
}
