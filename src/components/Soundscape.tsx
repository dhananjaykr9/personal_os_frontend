import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music as MusicIcon, Play, Pause, SkipForward, SkipBack, Volume2, Search, Youtube } from 'lucide-react';
import { orinSound } from '../utils/orinMusic';

const Soundscape: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying]           = useState(orinSound.getIsPlaying());
  const [currentSong, setCurrentSong]       = useState(orinSound.getCurrentSong());
  const [volume, setVolume]                 = useState(orinSound.getVolume());

  // Sync with orinSound singleton
  useEffect(() => {
    const unsub = orinSound.subscribe(state => {
      setIsPlaying(state.isPlaying);
      setCurrentSong(state.song);
      setVolume(state.volume);
    });
    return () => unsub();
  }, []);

  // Initialize YouTube IFrame API (Persistent)
  useEffect(() => {
    const initYT = () => {
      if (document.getElementById('yt-player-hidden')) {
        new (window as any).YT.Player('yt-player-hidden', {
          height: '0', width: '0', videoId: '',
          playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, origin: window.location.origin },
          events: {
            onReady: (e: any) => { orinSound.setYtPlayer(e.target); e.target.setVolume(volume * 100); },
            onStateChange: (e: any) => { if (e.data === 0) orinSound.next(); },
          }
        });
      }
    };
    if ((window as any).YT?.Player) { initYT(); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = initYT;
  }, []); // eslint-disable-line

  const togglePlay = async () => { if (isPlaying) { orinSound.pause(); } else { await orinSound.play(); } };
  const updateVolume = (val: number) => { orinSound.setVolume(val); setVolume(val); };
  const hasSong = currentSong.url.length > 0 && currentSong.id !== '';

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 transition-all hover:bg-white/[0.08] group relative">
      <div id="yt-player-hidden" className="hidden" />

      {/* Mini-Player HUD */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-indigo-500/20 ${isPlaying ? 'shadow-[0_0_12px_rgba(99,102,241,0.5)]' : ''}`}>
          {currentSong.thumbnail
            ? <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center"><MusicIcon size={16} className="text-indigo-400" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-white truncate uppercase tracking-tight">
            {hasSong ? currentSong.title : 'Standby Protocol'}
          </p>
          <div className="flex items-center gap-1.5 leading-none">
            {hasSong && <Youtube size={8} className="text-red-500 flex-shrink-0" />}
            <p className="text-[9px] font-bold text-slate-500 truncate leading-none">
              {hasSong ? currentSong.artist : 'Select Neural Audio'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/music')}
          className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-white hover:bg-indigo-500/20 transition-all flex-shrink-0"
          title="Open Music Hub"
        >
          <Search size={12} />
        </button>
      </div>

      {/* Optimized Controls */}
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => orinSound.previous()} className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
          <SkipBack size={11} />
        </button>
        <button onClick={togglePlay} disabled={!hasSong}
          className="p-2 rounded-lg bg-indigo-500 text-white shadow-lg hover:bg-indigo-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          {isPlaying ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" className="ml-0.5" />}
        </button>
        <button onClick={() => orinSound.next()} className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
          <SkipForward size={11} />
        </button>
        <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-black/20 rounded-lg border border-white/5 group/vol">
          <Volume2 size={9} className="text-slate-600 group-hover/vol:text-indigo-400 transition-colors" />
          <input type="range" min="0" max="1" step="0.05" value={volume}
            onChange={e => updateVolume(parseFloat(e.target.value))}
            className="w-full h-1 accent-indigo-500 cursor-pointer" />
        </div>
      </div>

      <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          animate={{ x: isPlaying ? ['-100%', '0%'] : '0%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
      </div>
    </div>
  );
};

export default Soundscape;
