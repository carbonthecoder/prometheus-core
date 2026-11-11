import { Events } from 'discord.js';
import { InviteService } from '../services/inviteService.js';

export default {
  name: Events.InviteCreate,
  once: false,

  execute(invite) {
    InviteService.onInviteCreate(invite);
  }
};
