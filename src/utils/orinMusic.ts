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

class OrinSoundscape {
  private audio: HTMLAudioElement;
  private ytPlayer: any = null;
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
      url: '',
      category: 'Hindi',
      sourceType: 'mp3'
    },
    {
      id: 'm1',
      title: 'Mauli Mauli (Neural Pulse)',
      artist: 'Ajay-Atul (Ambient)',
      url: '',
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

  setYtPlayer(player: any) {
    this.ytPlayer = player;
  }

  playInteractionSound() {
    const interactionSrc = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    this.interactionAudio.src = interactionSrc;
    this.interactionAudio.currentTime = 0;
    this.interactionAudio.play().catch(() => { });
  }

  getCurrentSong() {
    return this.playlist[this.currentIndex];
  }

  async play() {
    const song = this.getCurrentSong();
    this.isPlaying = true;

    // Stop any existing streams first to prevent overlap
    this.audio.pause();
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
    }

    if (song.sourceType === 'mp3') {
      if (this.audio.src !== song.url) this.audio.src = song.url;
      return this.audio.play();
    } else if (song.sourceType === 'youtube' && this.ytPlayer) {
      this.ytPlayer.loadVideoById(song.url);
      this.ytPlayer.playVideo();
    }
    return Promise.resolve();
  }

  pause() {
    this.isPlaying = false;
    this.audio.pause();
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
    }
  }

  async next() {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    if (wasPlaying) return this.play();
    return Promise.resolve();
  }

  async previous() {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    if (wasPlaying) return this.play();
    return Promise.resolve();
  }

  setVolume(vol: number) {
    const safeVol = Math.max(0, Math.min(1, vol));
    this.audio.volume = safeVol;
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      this.ytPlayer.setVolume(safeVol * 100);
    }
  }

  getVolume() {
    return this.audio.volume;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const orinSound = new OrinSoundscape();
