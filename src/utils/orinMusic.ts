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

  playInteractionSound() {
    const interactionSrc = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    this.interactionAudio.src = interactionSrc;
    this.interactionAudio.currentTime = 0;
    this.interactionAudio.play().catch(() => {});
  }

  getCurrentSong() {
    return this.playlist[this.currentIndex];
  }

  play() {
    const song = this.getCurrentSong();
    this.isPlaying = true;
    if (song.sourceType === 'mp3') {
      if (this.audio.src !== song.url) this.audio.src = song.url;
      return this.audio.play();
    }
    return Promise.resolve();
  }

  pause() {
    const song = this.getCurrentSong();
    this.isPlaying = false;
    if (song.sourceType === 'mp3') this.audio.pause();
  }

  next() {
    this.pause();
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    if (this.isPlaying) return this.play();
    return Promise.resolve();
  }

  previous() {
    this.pause();
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    if (this.isPlaying) return this.play();
    return Promise.resolve();
  }

  setVolume(vol: number) {
    this.audio.volume = Math.max(0, Math.min(1, vol));
  }

  getVolume() {
    return this.audio.volume;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const orinSound = new OrinSoundscape();
