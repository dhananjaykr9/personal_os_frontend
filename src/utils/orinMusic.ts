/**
 * ORIN Strategic Soundscape Utility
 * Manages background audio with YouTube search support via Invidious API.
 */

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;           // YouTube video ID or MP3 URL
  category: string;
  sourceType: 'mp3' | 'youtube';
  thumbnail?: string;
  duration?: number;
}

type Listener = (state: { isPlaying: boolean; song: Song; volume: number }) => void;

class OrinSoundscape {
  private audio: HTMLAudioElement;
  private ytPlayer: any = null;
  private listeners: Listener[] = [];
  private playlist: Song[] = [];
  private currentIndex: number = 0;
  isPlaying: boolean = false;

  constructor() {
    this.audio = new Audio();
    this.audio.loop = false;
    this.audio.volume = 0.3;
    this.audio.onended = () => this.next();
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private notify() {
    const song = this.getCurrentSong();
    if (!song) return;
    this.listeners.forEach(l => l({ isPlaying: this.isPlaying, song, volume: this.audio.volume }));
  }

  setYtPlayer(player: any) {
    this.ytPlayer = player;
    this.notify();
  }

  getCurrentSong(): Song {
    return this.playlist[this.currentIndex] || {
      id: '', title: 'No track loaded', artist: 'Search for a song below',
      url: '', category: 'none', sourceType: 'youtube'
    };
  }

  getPlaylist() { return this.playlist; }
  getCurrentIndex() { return this.currentIndex; }

  // ── Play a specific YouTube video by ID directly ────────────────────────
  async playVideoId(videoId: string, title: string, artist: string, thumbnail?: string) {
    const song: Song = {
      id: videoId, title, artist, url: videoId,
      category: 'search', sourceType: 'youtube', thumbnail
    };

    // Check if already in playlist
    const existing = this.playlist.findIndex(s => s.id === videoId);
    if (existing >= 0) {
      this.currentIndex = existing;
    } else {
      // Insert at front of queue
      this.playlist.unshift(song);
      this.currentIndex = 0;
    }

    this.isPlaying = true;

    if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
      this.ytPlayer.loadVideoById(videoId);
      this.ytPlayer.playVideo();
    }
    this.notify();
  }

  async play() {
    const song = this.getCurrentSong();
    if (!song.url) return;
    this.isPlaying = true;

    this.audio.pause();
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
    }

    if (song.sourceType === 'mp3') {
      if (this.audio.src !== song.url) this.audio.src = song.url;
      try { await this.audio.play(); } catch (err) { console.warn('Playback deferred:', err); }
    } else if (song.sourceType === 'youtube' && this.ytPlayer) {
      if (typeof this.ytPlayer.loadVideoById === 'function') {
        const currentId = this.ytPlayer.getVideoData?.()?.video_id;
        if (currentId !== song.url) { this.ytPlayer.loadVideoById(song.url); }
        this.ytPlayer.playVideo();
      }
    }
    this.notify();
  }

  pause() {
    this.isPlaying = false;
    this.audio.pause();
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
    }
    this.notify();
  }

  async next() {
    if (this.playlist.length === 0) return;
    this.pause();
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    await this.play();
  }

  async previous() {
    if (this.playlist.length === 0) return;
    this.pause();
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    await this.play();
  }

  setVolume(vol: number) {
    const safeVol = Math.max(0, Math.min(1, vol));
    this.audio.volume = safeVol;
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      this.ytPlayer.setVolume(safeVol * 100);
    }
    this.notify();
  }

  getVolume() { return this.audio.volume; }
  getIsPlaying() { return this.isPlaying; }
}

export const orinSound = new OrinSoundscape();
