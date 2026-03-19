import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  History, 
  Play, 
  Loader2, 
  Youtube, 
  TrendingUp,
  Clock,
  Zap,
  Brain
} from 'lucide-react';
import { orinSound } from '../utils/orinMusic';
import type { Song } from '../utils/orinMusic';
import api from '../api';
import { clsx } from 'clsx';

interface SearchResult {
  videoId: string;
  title: string;
  author: string;
  lengthSeconds: number;
  videoThumbnails: Array<{ url: string; width: number; height: number }>;
}

const formatDuration = (secs: number) => {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Helper to fix legacy names in history
const applyMetadataRepair = (history: Song[]): Song[] => {
  const repairMap: Record<string, { title: string, artist: string }> = {
    '1BWdglekty0': { title: 'lofi hip hop radio 📚 - beats to relax/study to', artist: 'Lofi Girl' },
    '7798M_i-xrk': { title: 'Gulabi Sadi', artist: 'Sanju Rathod' },
    'jfKfPfyJRdk': { title: 'lofi hip hop radio 💤 - beats to sleep/chill to', artist: 'Lofi Girl' }
  };

  return history.map(song => {
    // Also strip any custom branding from titles if they aren't in the specific map
    let title = song.title.replace(/Tactical Ambient: |Neural Lofi: |Focus Protocol: /g, '');
    let artist = song.artist === 'Dhananjay Core' ? 'YouTube' : song.artist;

    if (repairMap[song.id]) {
      return { ...song, ...repairMap[song.id] };
    }
    return { ...song, title, artist };
  });
};

const Music: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [loadingId, setLoadingId] = useState('');
  const [currentSongId, setCurrentSongId] = useState(orinSound.getCurrentSong().id);
  const [isPlaying, setIsPlaying] = useState(orinSound.getIsPlaying());

  const [history, setHistory] = useState<Song[]>(() => {
    const saved = localStorage.getItem('orin_music_history');
    const parsed = saved ? JSON.parse(saved) : [];
    // Auto-repair legacy names on load
    return applyMetadataRepair(parsed);
  });

  useEffect(() => {
    const unsub = orinSound.subscribe(state => {
      setCurrentSongId(state.song.id);
      setIsPlaying(state.isPlaying);
    });
    return () => unsub();
  }, []);

  const addToHistory = (song: Song) => {
    setHistory(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const updated = [song, ...filtered].slice(0, 20);
      localStorage.setItem('orin_music_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('orin_music_history');
    setHistory([]);
  };

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsSearching(true);
    setSearchError('');
    try {
      const res = await api.get('/api/orin/search', { params: { q } });
      if (res.data && Array.isArray(res.data)) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setSearchError('Search protocol offline. Try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaySong = async (s: Song) => {
    setLoadingId(s.id);
    await orinSound.playVideoId(s.id, s.title, s.artist, s.thumbnail);
    addToHistory(s);
    setLoadingId('');
  };

  const handlePlayResult = (result: SearchResult) => {
    const song: Song = {
      id: result.videoId,
      title: result.title,
      artist: result.author,
      url: result.videoId,
      category: 'search',
      sourceType: 'youtube',
      thumbnail: `https://img.youtube.com/vi/${result.videoId}/mqdefault.jpg`
    };
    handlePlaySong(song);
  };

  const detectedVideoId = (() => {
    const s = searchQuery.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
    const short = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (short) return short[1];
    const watch = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watch) return watch[1];
    const embed = s.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embed) return embed[1];
    return null;
  })();

  const isYoutubeLink = !!detectedVideoId;

  const handlePlayUrl = async () => {
    if (!detectedVideoId) return;
    setLoadingId(detectedVideoId);
    
    try {
      // Fetch actual metadata from backend
      const res = await api.get(`/api/orin/info/${detectedVideoId}`);
      const song: Song = {
        id: detectedVideoId,
        title: res.data.title || 'Neural Stream Capture',
        artist: res.data.author || 'YouTube',
        url: detectedVideoId,
        category: 'pasted',
        sourceType: 'youtube',
        thumbnail: `https://img.youtube.com/vi/${detectedVideoId}/mqdefault.jpg`
      };
      handlePlaySong(song);
    } catch (err) {
      // Fallback if metadata fetch fails
      const fallback: Song = {
        id: detectedVideoId,
        title: 'Neural Stream Capture',
        artist: 'YouTube',
        url: detectedVideoId,
        category: 'pasted',
        sourceType: 'youtube',
        thumbnail: `https://img.youtube.com/vi/${detectedVideoId}/mqdefault.jpg`
      };
      handlePlaySong(fallback);
    } finally {
      setLoadingId('');
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 neural-grid opacity-15 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-950/98 to-slate-900 z-[-1]" />

      <div className="relative z-10 space-y-10 pb-20">
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Audio Intelligence Active</span>
              </div>
              {isPlaying && (
                <div className="flex gap-1 items-end h-4 pb-1">
                  {[0.4, 0.7, 0.2, 0.9, 0.5].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: ["20%", "100%", "20%"] }}
                      transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: "easeInOut" }}
                      className="w-1 bg-indigo-500/40 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
            <h1 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic uppercase">
              Strategic <span className="text-indigo-500">Soundscape</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
              Neural-linked audio bridge for deep technical focus and operational efficiency. Authorized under <span className="text-indigo-400 font-black italic tracking-widest">PROT-AUDIO-SYNC</span>.
            </p>
          </div>

          {/* Search Input HUD */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all rounded-full pointer-events-none" />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                   if (isYoutubeLink) handlePlayUrl();
                   else doSearch(searchQuery);
                 }
              }}
              placeholder="Search or paste YouTube URL..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/40 focus:bg-white/[0.08] transition-all font-medium relative z-10"
            />
            {isSearching && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 size={18} className="text-indigo-400" />
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Direct URL Play Button */}
            {isYoutubeLink && (
              <motion.button 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                onClick={handlePlayUrl}
                className="w-full flex items-center justify-between p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                    <Youtube className="text-red-500" size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black text-white leading-tight uppercase tracking-tight italic">Capture Neural Stream ▶</p>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-md">{searchQuery}</p>
                  </div>
                </div>
                <Play size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              </motion.button>
            )}

            {/* Error Message */}
            {searchError && (
               <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold tracking-wide italic">
                 {searchError}
               </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <TrendingUp size={16} className="text-indigo-400" />
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Neural Intercepts</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((result) => (
                    <button 
                      key={result.videoId} 
                      onClick={() => handlePlayResult(result)}
                      className={clsx(
                        "flex items-center gap-5 p-4 rounded-[2rem] transition-all group text-left border relative overflow-hidden",
                        currentSongId === result.videoId 
                          ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]' 
                          : 'bg-white/5 border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.08] neuro-glow'
                      )}
                    >
                      <div className="scanner-light" />
                      <div className="w-24 h-16 rounded-2xl overflow-hidden bg-black/40 flex-shrink-0 relative">
                        <img src={result.videoThumbnails?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-indigo-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <Play size={24} className="text-white fill-white animate-pulse" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className="text-base font-black text-white truncate leading-tight mb-1 uppercase italic tracking-tight">{result.title}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">{result.author}</span>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <Clock size={10} className="text-indigo-400" />
                            <span className="text-[9px] text-indigo-400 font-black tracking-widest">{formatDuration(result.lengthSeconds)}</span>
                          </div>
                        </div>
                      </div>
                      {loadingId === result.videoId && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                          <Loader2 size={18} className="text-indigo-400 animate-spin" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <div className="py-20 text-center space-y-4 opacity-20">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-500/20 flex items-center justify-center mx-auto">
                  <Search size={40} className="text-indigo-500" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.5em] text-indigo-500">Scan Audio Frequency</p>
              </div>
            )}
          </div>

          {/* Sidebar History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 glass-effect border border-white/5 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-slate-400" />
                  <h2 className="text-xs font-black text-white uppercase tracking-widest">Neural History</h2>
                </div>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-[10px] font-black text-slate-600 hover:text-rose-400 transition-colors uppercase tracking-widest">Clear</button>
                )}
              </div>

              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mx-auto bg-white/5">
                      <Clock size={20} className="text-slate-700" />
                    </div>
                    <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest">No recently accessed telemetry</p>
                  </div>
                ) : (
                  history.map((song) => (
                    <button 
                      key={song.id} 
                      onClick={() => handlePlaySong(song)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all group border ${currentSongId === song.id ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5 border-transparent hover:bg-white/[0.08]'}`}
                    >
                      <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                        <img src={song.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-[11px] font-black truncate leading-none mb-1 ${currentSongId === song.id ? 'text-indigo-300' : 'text-slate-300 group-hover:text-white'}`}>{song.title}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase truncate">{song.artist}</p>
                      </div>
                      {currentSongId === song.id && isPlaying && (
                        <div className="flex gap-0.5 items-end h-3 mb-1">
                          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 h-full bg-indigo-500" />
                          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 h-full bg-indigo-400" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain size={120} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <Zap size={20} className="text-indigo-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Neural Link</h3>
              </div>
              <p className="text-sm text-indigo-300/80 font-bold leading-relaxed mb-6">Capture encrypted audio streams from external nodes. Paste any YouTube identifier to synchronize.</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-500/10 w-fit px-4 py-2 rounded-full border border-indigo-500/20">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                Auto-Link Protocol Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Music;
