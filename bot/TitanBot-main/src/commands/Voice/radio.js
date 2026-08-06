import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    VoiceConnectionStatus,
    entersState,
    StreamType,
    NoSubscriberBehavior
} from '@discordjs/voice';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';

// Curated Crystal-Clear High-Fidelity Radio Streams (192kbps - 320kbps)
export const RADIO_STATIONS = {
    lofi: {
        name: '☕ Lofi Girl 24/7 (Chill Beats)',
        url: 'https://play.streamafrica.net/lofiradio',
        desc: 'Relaxing lo-fi hip hop study & chill beats.',
        thumb: 'https://i.scdn.co/image/ab67616d0000b2738a9bc6f62ea6ed66a9ba86fb',
        color: '#6c5ce7'
    },
    chillhop: {
        name: '🎧 ChillHop Café HQ (192kbps)',
        url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
        desc: 'Smooth jazz hop, chillhop, and laid-back grooves.',
        thumb: 'https://cdn-icons-png.flaticon.com/512/3845/3845868.png',
        color: '#00cec9'
    },
    synthwave: {
        name: '🌃 Nightwave Plaza (Vaporwave & Synth)',
        url: 'https://radio.plaza.one/mp3',
        desc: 'Cyberpunk, retro synthwave, and nostalgic 80s aesthetic.',
        thumb: 'https://plaza.one/img/logo.png',
        color: '#fd79a8'
    },
    cyberpunk: {
        name: '🚀 Tokyo Cyberpunk Beats',
        url: 'https://stream.laut.fm/lofi',
        desc: 'Futuristic beats, dark ambient, and electronic chill.',
        thumb: 'https://cdn-icons-png.flaticon.com/512/4812/4812480.png',
        color: '#0984e3'
    },
    anime: {
        name: '🌸 Anime Lo-Fi & Ghibli Chill',
        url: 'https://stream.zeno.fm/0r0xa792kwzuv',
        desc: 'Peaceful anime piano covers and soothing ambient beats.',
        thumb: 'https://cdn-icons-png.flaticon.com/512/3408/3408545.png',
        color: '#e84393'
    }
};

// Global active player registry per guild
export const activeRadioSessions = new Map();

/**
 * Creates a high-fidelity FFmpeg audio resource with jitter-free buffer controls
 */
export function createHDAudioResource(streamUrl, volume = 0.8) {
    if (!ffmpegPath) {
        return createAudioResource(streamUrl, { inlineVolume: true });
    }

    const ffmpegProcess = spawn(ffmpegPath, [
        '-reconnect', '1',
        '-reconnect_at_eof', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '5',
        '-i', streamUrl,
        '-analyzeduration', '0',
        '-loglevel', '0',
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2'
    ], { stdio: ['ignore', 'pipe', 'ignore'] });

    const resource = createAudioResource(ffmpegProcess.stdout, {
        inputType: StreamType.Raw,
        inlineVolume: true
    });

    if (resource.volume) {
        resource.volume.setVolume(volume);
    }

    return { resource, process: ffmpegProcess };
}

export default {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('HD 24/7 Studio Radio & Music Streaming Engine')
        .addSubcommand(sub => 
            sub.setName('play')
               .setDescription('Start playing a 24/7 crystal-clear HD radio station')
               .addStringOption(opt =>
                   opt.setName('station')
                      .setDescription('Select the music genre / station')
                      .setRequired(false)
                      .addChoices(
                          { name: '☕ Lofi Girl 24/7 (Study/Chill)', value: 'lofi' },
                          { name: '🎧 ChillHop Café HQ (Jazzhop)', value: 'chillhop' },
                          { name: '🌃 Nightwave Plaza (Synthwave)', value: 'synthwave' },
                          { name: '🚀 Tokyo Cyberpunk Beats', value: 'cyberpunk' },
                          { name: '🌸 Anime Lo-Fi & Ghibli', value: 'anime' }
                      )
               )
               .addIntegerOption(opt =>
                   opt.setName('volume')
                      .setDescription('Volume level (1-100%)')
                      .setMinValue(1)
                      .setMaxValue(100)
                      .setRequired(false)
               )
        )
        .addSubcommand(sub =>
            sub.setName('stop')
               .setDescription('Stop the radio and disconnect from voice')
        )
        .addSubcommand(sub =>
            sub.setName('volume')
               .setDescription('Adjust playback volume')
               .addIntegerOption(opt =>
                   opt.setName('level')
                      .setDescription('Volume (1-100%)')
                      .setRequired(true)
                      .setMinValue(1)
                      .setMaxValue(100)
               )
        ),

    category: 'Voice',

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(false) || 'play';
        const guildId = interaction.guildId;
        const member = interaction.member;
        const voiceChannel = member?.voice?.channel;

        // STOP SUBCOMMAND
        if (subcommand === 'stop') {
            const session = activeRadioSessions.get(guildId);
            if (!session) {
                return InteractionHelper.safeReply(interaction, {
                    embeds: [errorEmbed('No active radio session in this server.')],
                    ephemeral: true
                });
            }

            try {
                session.player.stop();
                session.connection.destroy();
                activeRadioSessions.delete(guildId);
            } catch (err) {
                logger.error('Error stopping radio:', err);
            }

            return InteractionHelper.safeReply(interaction, {
                embeds: [successEmbed('📻 Radio Stream Stopped', 'Disconnected from voice channel. Use `/radio play` anytime to tune back in!')]
            });
        }

        // VOLUME SUBCOMMAND
        if (subcommand === 'volume') {
            const session = activeRadioSessions.get(guildId);
            if (!session || !session.currentResource?.volume) {
                return InteractionHelper.safeReply(interaction, {
                    embeds: [errorEmbed('No active radio stream currently playing.')],
                    ephemeral: true
                });
            }

            const level = interaction.options.getInteger('level');
            const volumeDecimal = level / 100;
            session.currentResource.volume.setVolume(volumeDecimal);
            session.volume = volumeDecimal;

            return InteractionHelper.safeReply(interaction, {
                embeds: [successEmbed('🔊 Volume Adjusted', `Radio playback volume set to **${level}%**.`)]
            });
        }

        // PLAY SUBCOMMAND
        if (!voiceChannel) {
            return InteractionHelper.safeReply(interaction, {
                embeds: [errorEmbed('Voice Channel Required', 'You must join a Voice Channel first so I know where to play the tunes!')],
                ephemeral: true
            });
        }

        const stationKey = interaction.options.getString('station') || 'lofi';
        const volumeInput = interaction.options.getInteger('volume') || 80;
        const volumeDecimal = volumeInput / 100;
        const station = RADIO_STATIONS[stationKey] || RADIO_STATIONS.lofi;

        try {
            // Join voice channel
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: true
            });

            await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play
                }
            });

            const { resource, process: ffmpegProc } = createHDAudioResource(station.url, volumeDecimal);
            player.play(resource);
            connection.subscribe(player);

            // Keep track of session
            const session = {
                connection,
                player,
                stationKey,
                station,
                volume: volumeDecimal,
                currentResource: resource,
                ffmpegProcess: ffmpegProc,
                voiceChannelId: voiceChannel.id
            };
            activeRadioSessions.set(guildId, session);

            // Auto-reconnect loop on idle / stream drop
            player.on(AudioPlayerStatus.Idle, () => {
                logger.info(`Radio stream idle for guild ${guildId}, reconnecting HD stream...`);
                try {
                    const nextStream = createHDAudioResource(station.url, session.volume);
                    session.currentResource = nextStream.resource;
                    session.ffmpegProcess = nextStream.process;
                    player.play(nextStream.resource);
                } catch (err) {
                    logger.error('Failed to reconnect HD radio stream:', err);
                }
            });

            player.on('error', (err) => {
                logger.warn('Audio player error, auto-recovering:', err.message);
                try {
                    const recovered = createHDAudioResource(station.url, session.volume);
                    session.currentResource = recovered.resource;
                    player.play(recovered.resource);
                } catch (e) {
                    logger.error('Audio recovery failed:', e);
                }
            });

            connection.on(VoiceConnectionStatus.Disconnected, () => {
                activeRadioSessions.delete(guildId);
            });

            const embed = createEmbed({
                title: `📻 24/7 HD Neural Radio - ${station.name}`,
                description: `${station.desc}\n\n**Connected to:** <#${voiceChannel.id}>\n**Audio Quality:** Studio 48kHz Stereo / 192k HQ\n**Volume:** ${volumeInput}%\n\n*Stream runs 24/7. Switch stations or stop anytime with buttons below.*`,
                color: station.color
            })
            .setThumbnail(station.thumb)
            .setFooter({ text: 'Powered by OpusScript & FFmpeg Engine' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('radio_lofi')
                    .setLabel('☕ Lofi')
                    .setStyle(stationKey === 'lofi' ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('radio_chillhop')
                    .setLabel('🎧 ChillHop')
                    .setStyle(stationKey === 'chillhop' ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('radio_synthwave')
                    .setLabel('🌃 Synthwave')
                    .setStyle(stationKey === 'synthwave' ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('radio_anime')
                    .setLabel('🌸 Anime')
                    .setStyle(stationKey === 'anime' ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('radio_stop')
                    .setLabel('⏹️ Stop')
                    .setStyle(ButtonStyle.Danger)
            );

            await InteractionHelper.safeReply(interaction, {
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            logger.error('Error starting HD radio stream:', error);
            await InteractionHelper.safeReply(interaction, {
                embeds: [errorEmbed('Failed to Connect', 'Could not establish HD voice stream connection. Please check bot voice permissions.')],
                ephemeral: true
            });
        }
    }
};
