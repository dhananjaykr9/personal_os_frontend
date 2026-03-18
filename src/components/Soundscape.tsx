import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { orinSound } from '../utils/orinMusic';

const Soundscape: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(orinSound.getCurrentSong());
  const [volume, setVolume] = useState(orinSound.getVolume());
  const [hasError, setHasError] = useState(false);
  const [ytPlayer, setYtPlayer] = useState<any>(null);

  // Load YouTube API
  useEffect(() => {
    if ((window as any).YT) return;
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      new (window as any).YT.Player('yt-player-hidden', {
        height: '0',
        width: '0',
        videoId: currentSong.sourceType === 'youtube' ? currentSong.url : '',
        playerVars: {
          'autoplay': 0,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'iv_load_policy': 3,
          'modestbranding': 1,
          'rel': 0,
          'showinfo': 0
        },
        events: {
          'onReady': (event: any) => {
            setYtPlayer(event.target);
            event.target.setVolume(volume * 100);
          },
          'onStateChange': (event: any) => {
            if (event.data === 0) {
              handleNext();
            }
          },
          'onError': () => setHasError(true)
        }
      });
    };
  }, []);

  useEffect(() => {
    const engageAudio = async () => {
      try {
        const song = orinSound.getCurrentSong();
        if (song.sourceType === 'mp3') {
          await orinSound.play();
        } else if (ytPlayer && song.sourceType === 'youtube') {
          ytPlayer.loadVideoById(song.url);
          ytPlayer.playVideo();
        }
        setIsPlaying(true);
        setHasError(false);
      } catch (err) {
        console.warn('Initial soundscape engagement failed:', err);
        setHasError(true);
      }
    };

    const timeout = setTimeout(engageAudio, 1000);

    return () => {
      clearTimeout(timeout);
      orinSound.pause();
      if (ytPlayer) ytPlayer.pauseVideo();
    };
  }, [ytPlayer]);

  const togglePlay = async () => {
    try {
      const song = orinSound.getCurrentSong();
      if (isPlaying) {
        orinSound.pause();
        if (song.sourceType === 'youtube' && ytPlayer) ytPlayer.pauseVideo();
      } else {
        if (song.sourceType === 'mp3') {
          await orinSound.play();
        } else if (song.sourceType === 'youtube' && ytPlayer) {
          ytPlayer.playVideo();
        }
      }
      setIsPlaying(!isPlaying);
      setHasError(false);
    } catch (err) {
      setHasError(true);
    }
  };

  const handleNext = async () => {
    try {
      orinSound.pause();
      if (ytPlayer) ytPlayer.pauseVideo();
      
      await orinSound.next();
      const nextSong = orinSound.getCurrentSong();
      setCurrentSong(nextSong);
      
      if (nextSong.sourceType === 'mp3') {
        await orinSound.play();
      } else if (nextSong.sourceType === 'youtube' && ytPlayer) {
        ytPlayer.loadVideoById(nextSong.url);
        ytPlayer.playVideo();
      }
      
      setIsPlaying(true);
      setHasError(false);
    } catch (err) {
      setHasError(true);
    }
  };

  const updateVolume = (val: number) => {
    orinSound.setVolume(val);
    if (ytPlayer) ytPlayer.setVolume(val * 100);
    setVolume(val);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden relative group transition-all hover:bg-white/10">
      <div id="yt-player-hidden" className="hidden" />
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg ${isPlaying ? 'animate-spin-slow' : ''}`}>
          <Music size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <h3 className="text-[11px] font-black text-white truncate uppercase tracking-tight">{currentSong.title}</h3>
            {currentSong.sourceType === 'youtube' && (
              <span className="text-[7px] px-1 bg-red-500/20 text-red-500 rounded font-black uppercase tracking-widest shrink-0">YT</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{currentSong.artist}</p>
            {hasError && <span className="text-[7px] font-black text-orange-500 uppercase animate-pulse shrink-0">Error</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={togglePlay}
              className="p-2 rounded-lg bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-colors"
            >
              {isPlaying ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" className="ml-0.5" />}
            </button>
            <button 
              onClick={handleNext}
              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <SkipForward size={12} />
            </button>
          </div>
          
          <div className="flex-1 flex items-center gap-2 px-2 py-1.5 bg-black/20 rounded-lg border border-white/5">
            <Volume2 size={10} className="text-slate-500" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume} 
              onChange={(e) => updateVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Mock Progress */}
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500"
            animate={{ width: isPlaying ? '100%' : '30%' }}
            transition={{ duration: 180, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Soundscape;
