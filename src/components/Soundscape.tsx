import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { orinSound } from '../utils/orinMusic';

const Soundscape: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(orinSound.getIsPlaying());
  const [currentSong, setCurrentSong] = useState(orinSound.getCurrentSong());
  const [volume, setVolume] = useState(orinSound.getVolume());
  const [hasError, setHasError] = useState(false);

  // Sync with global singleton state
  useEffect(() => {
    const unsubscribe = orinSound.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentSong(state.song);
      setVolume(state.volume);
    });
    return () => unsubscribe();
  }, []);

  // Load YouTube API
  useEffect(() => {
    const initPlayer = () => {
      const song = orinSound.getCurrentSong();
      new (window as any).YT.Player('yt-player-hidden', {
        height: '0',
        width: '0',
        videoId: song.sourceType === 'youtube' ? song.url : '',
        playerVars: {
          'autoplay': 0,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'iv_load_policy': 3,
          'modestbranding': 1,
          'rel': 0,
          'showinfo': 0,
          'origin': window.location.origin
        },
        events: {
          'onReady': (event: any) => {
            orinSound.setYtPlayer(event.target);
            event.target.setVolume(volume * 100);
            
            // Sync with global play state - essential for auto-play after splash
            if (orinSound.getIsPlaying()) {
              if (song.sourceType === 'youtube') {
                event.target.playVideo();
              } else {
                // If we are playing an MP3 but YT player just ready, ensure YT is paused
                event.target.pauseVideo();
              }
            }
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

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      // NOTE: We don't pause on unmount anymore because the singleton handles it
      // and we want music to continue if the sidebar just collapses
    };
  }, []);

  const togglePlay = async () => {
    try {
      if (isPlaying) {
        orinSound.pause();
      } else {
        await orinSound.play();
      }
      setIsPlaying(!isPlaying);
      setHasError(false);
    } catch (err) {
      setHasError(true);
    }
  };

  const handleNext = async () => {
    try {
      await orinSound.next();
      setCurrentSong(orinSound.getCurrentSong());
      setIsPlaying(orinSound.getIsPlaying());
      setHasError(false);
    } catch (err) {
      setHasError(true);
    }
  };

  const updateVolume = (val: number) => {
    orinSound.setVolume(val);
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
