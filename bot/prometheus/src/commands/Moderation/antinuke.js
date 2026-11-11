import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { cozyEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { getGuildConfig, updateGuildConfig } from '../../services/guildConfig.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('antinuke')
    .setDescription('Configure Prometheus server defense and antinuke safeguards')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName('toggle')
        .setDescription('Toggle the antinuke active defense engine on or off')
        .addBooleanOption(opt =>
          opt
            .setName('enabled')
            .setDescription('Enable or disable antinuke protection')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('whitelist')
        .setDescription('Trust or untrust an administrator to bypass antinuke checks')
        .addUserOption(opt =>
          opt
            .setName('user')
            .setDescription('Administrator to manage')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName('action')
            .setDescription('Add or remove from whitelist')
            .setRequired(true)
            .addChoices(
              { name: 'Add to Whitelist', value: 'add' },
              { name: 'Remove from Whitelist', value: 'remove' }
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('status')
        .setDescription('Inspect current antinuke status and trusted administrators')
    ),

  async execute(interaction) {
    try {
      const deferSuccess = await InteractionHelper.safeDefer(interaction);
      if (!deferSuccess) return;

      const sub = interaction.options.getSubcommand();
      const config = await getGuildConfig(interaction.client, interaction.guildId);
      const antinuke = config?.antinuke || { enabled: true, whitelist: [] };

      if (sub === 'toggle') {
        const enabled = interaction.options.getBoolean('enabled', true);
        antinuke.enabled = enabled;
        await updateGuildConfig(interaction.client, interaction.guildId, { antinuke });

        const embed = cozyEmbed({
          symbol: '◇',
          title: 'Antinuke Defense Engine',
          subtitle: `State: ${enabled ? 'Active' : 'Disabled'}`,
          lines: [
            `**Safeguard Status** ${enabled ? 'Enabled' : 'Disabled'}`,
            `**Triggers Watched** Channel wipes, role deletion, mass bans, webhook creation, bot spam`,
            `**Countermeasure** Immediate perpetrator ban & state recovery`
          ],
          footer: 'Prometheus Security · Accent #0e0d0d',
          color: '#0e0d0d'
        });

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'whitelist') {
        const user = interaction.options.getUser('user', true);
        const action = interaction.options.getString('action', true);
        const list = new Set(antinuke.whitelist || []);

        if (action === 'add') {
          list.add(user.id);
        } else {
          list.delete(user.id);
        }

        antinuke.whitelist = Array.from(list);
        await updateGuildConfig(interaction.client, interaction.guildId, { antinuke });

        const embed = cozyEmbed({
          symbol: '◇',
          title: 'Security Whitelist Updated',
          subtitle: `@${user.username} · ${action === 'add' ? 'Added' : 'Removed'}`,
          lines: [
            `**Target** <@${user.id}> (\`${user.id}\`)`,
            `**Action** ${action === 'add' ? 'Granted Antinuke Immunity' : 'Revoked Antinuke Immunity'}`,
            `**Total Whitelisted Admins** ${antinuke.whitelist.length}`
          ],
          footer: 'Prometheus Security · Accent #0e0d0d',
          color: '#0e0d0d'
        });

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'status') {
        const isEnabled = antinuke.enabled !== false;
        const wl = antinuke.whitelist || [];
        const wlList = wl.length > 0 ? wl.map(id => `<@${id}>`).join(', ') : 'None (Only Server Owner)';

        const embed = cozyEmbed({
          symbol: '◇',
          title: 'Antinuke Defense Telemetry',
          subtitle: `Protection: ${isEnabled ? 'ACTIVE' : 'INACTIVE'}`,
          lines: [
            `**Status** ${isEnabled ? 'Active' : 'Disabled'}`,
            `**Server Owner** <@${interaction.guild.ownerId}>`,
            `**Whitelisted Members** ${wlList}`,
            `**Watched Vectors** Role Destruct, Channel Purge, Bot Spam, Mass Ban, Webhooks`
          ],
          footer: 'Prometheus Security · Accent #0e0d0d',
          color: '#0e0d0d'
        });

        return interaction.editReply({ embeds: [embed] });
      }
    } catch (err) {
      logger.error('Error executing antinuke command:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to process antinuke command.', err)]
      }).catch(() => {});
    }
  }
};
