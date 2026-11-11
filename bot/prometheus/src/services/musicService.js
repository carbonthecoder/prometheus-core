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
import { logger } from '../utils/logger.js';

import fs from 'fs';

class GuildQueue {
  constructor(guildId) {
    this.guildId = guildId;
    this.tracks = [];
    this.currentTrack = null;
    this.connection = null;
    this.player = null;
    this.volume = 1.0;
    this.resource = null;
  }

  ensurePlayer() {
    if (!this.player) {
      this.player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play
        }
      });

      this.player.on(AudioPlayerStatus.Idle, () => {
        this.playNext();
      });

      this.player.on('error', (err) => {
        logger.error(`[MUSIC] Player error in guild ${this.guildId}:`, err);
        this.playNext();
      });
    }
    return this.player;
  }

  async connect(channel) {
    if (!this.connection || this.connection.state.status === VoiceConnectionStatus.Destroyed) {
      this.connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      await entersState(this.connection, VoiceConnectionStatus.Ready, 15_000);
      const player = this.ensurePlayer();
      this.connection.subscribe(player);
    }
  }

  enqueue(track) {
    this.tracks.push(track);
    if (!this.currentTrack && this.player?.state?.status !== AudioPlayerStatus.Playing) {
      this.playNext();
    }
  }

  playNext() {
    if (this.tracks.length === 0) {
      this.currentTrack = null;
      this.resource = null;
      return null;
    }

    const track = this.tracks.shift();
    this.currentTrack = track;

    try {
      const resolvedBinary = (ffmpegPath && fs.existsSync(ffmpegPath)) ? ffmpegPath : 'ffmpeg';
      const ffmpeg = spawn(resolvedBinary, [
        '-reconnect', '1',
        '-reconnect_at_eof', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '3',
        '-i', track.url,
        '-analyzeduration', '0',
        '-loglevel', '0',
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        'pipe:1'
      ], { stdio: ['ignore', 'pipe', 'ignore'] });

      ffmpeg.on('error', (err) => {
        logger.error('[MUSIC] FFmpeg process error:', err.message);
        this.playNext();
      });

      this.resource = createAudioResource(ffmpeg.stdout, {
        inputType: StreamType.Raw,
        inlineVolume: true
      });

      this.resource.volume?.setVolume(this.volume);
      this.ensurePlayer().play(this.resource);
      return track;
    } catch (err) {
      logger.error('[MUSIC] Error spawning ffmpeg stream:', err);
      return this.playNext();
    }
  }

  pause() {
    if (this.player && this.player.state.status === AudioPlayerStatus.Playing) {
      this.player.pause();
      return true;
    }
    return false;
  }

  resume() {
    if (this.player && this.player.state.status === AudioPlayerStatus.Paused) {
      this.player.unpause();
      return true;
    }
    return false;
  }

  skip() {
    if (this.player) {
      this.player.stop();
      return true;
    }
    return false;
  }

  stop() {
    this.tracks = [];
    this.currentTrack = null;
    if (this.player) {
      this.player.stop();
    }
    if (this.connection) {
      try {
        this.connection.destroy();
      } catch {}
      this.connection = null;
    }
  }
}

class MusicService {
  constructor() {
    this.queues = new Map();
  }

  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, new GuildQueue(guildId));
    }
    return this.queues.get(guildId);
  }

  deleteQueue(guildId) {
    const queue = this.queues.get(guildId);
    if (queue) {
      queue.stop();
      this.queues.delete(guildId);
    }
  }
}

export const musicService = new MusicService();
