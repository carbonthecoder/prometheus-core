import { Events } from 'discord.js';
import { InviteService } from '../services/inviteService.js';

export default {
  name: Events.InviteDelete,
  once: false,

  execute(invite) {
    InviteService.onInviteDelete(invite);
  }
};
