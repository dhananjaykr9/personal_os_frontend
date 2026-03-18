/**
 * ORIN Strategic Soundscape Utility
 * Manages background audio protocols.
 */

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  category: 'Hindi' | 'Marathi';
  sourceType: 'mp3' | 'youtube';
}

type Listener = (state: { isPlaying: boolean; song: Song; volume: number }) => void;

class OrinSoundscape {
  private audio: HTMLAudioElement;
  private ytPlayer: any = null;
  private listeners: Listener[] = [];
  private playlist: Song[] = [
    {
      id: 'm_gs',
      title: 'Mix Arijit Singh',
      artist: 'Arijit Singh',
      url: '00DvaPstcpo',
      category: 'Hindi',
      sourceType: 'youtube'
    },
    {
      id: 'h1',
      title: 'Tum Hi Ho (Strategic Remix)',
      artist: 'Arijit Singh (Ambient)',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      category: 'Hindi',
      sourceType: 'mp3'
    },
    {
      id: 'm1',
      title: 'Mauli Mauli (Neural Pulse)',
      artist: 'Ajay-Atul (Ambient)',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      category: 'Marathi',
      sourceType: 'mp3'
    }
  ];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private interactionAudio: HTMLAudioElement;

  constructor() {
    this.audio = new Audio();
    this.audio.loop = false;
    this.audio.volume = 0.3;
    this.interactionAudio = new Audio();
    this.interactionAudio.volume = 0.2;
    this.audio.onended = () => this.next();
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    // Return unsubscribe
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const state = {
      isPlaying: this.isPlaying,
      song: this.getCurrentSong(),
      volume: this.audio.volume
    };
    this.listeners.forEach(l => l(state));
  }

  setYtPlayer(player: any) {
    this.ytPlayer = player;
    this.notify();
  }

  getCurrentSong() {
    return this.playlist[this.currentIndex];
  }

  async play() {
    const song = this.getCurrentSong();
    this.isPlaying = true;
    
    // Stop any existing streams first
    this.audio.pause();
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
    }

    if (song.sourceType === 'mp3') {
      if (this.audio.src !== song.url) this.audio.src = song.url;
      try {
        await this.audio.play();
      } catch (err) {
        console.warn('Playback deferred - waiting for user interaction:', err);
      }
    } else if (song.sourceType === 'youtube' && this.ytPlayer) {
      if (typeof this.ytPlayer.loadVideoById === 'function') {
        // Only load if different
        const currentId = this.ytPlayer.getVideoData?.()?.video_id;
        if (currentId !== song.url) {
          this.ytPlayer.loadVideoById(song.url);
        }
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
    this.pause();
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    await this.play();
  }

  async previous() {
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

  getVolume() {
    return this.audio.volume;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const orinSound = new OrinSoundscape();
