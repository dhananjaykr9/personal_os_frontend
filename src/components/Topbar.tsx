import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Clock, User, Bell, Zap, FileText, CheckSquare, Target, Activity, LayoutDashboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import api from '../api';
import { clsx } from 'clsx';

const Topbar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [searchFocused, setSearchFocused] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'note'>('task');
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const notifTimer = setInterval(fetchNotifications, 30000); // 30s Intelligence Sync
    fetchNotifications();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQuickAdd(false);
        setSearchQuery('');
        setSearchResults([]);
      }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    const handleRefresh = () => fetchNotifications();
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('notifications-refresh', handleRefresh);

    // Close dropdowns on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      clearInterval(timer);
      clearInterval(notifTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('notifications-refresh', handleRefresh);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const response = await api.get(`/api/search/?q=${searchQuery}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Search failure:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleClose = () => {
    setShowQuickAdd(false);
    setInputValue('');
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (quickAddType === 'task') {
        await api.post('/api/tasks/', {
          title: inputValue,
          description: 'Quick added tactical objective',
          priority: 'medium',
          status: 'todo',
          task_type: 'personal',
          due_date: format(new Date(), 'yyyy-MM-dd'),
          category: 'general'
        });
        
        // Add notification for the new task
        await api.post('/api/notifications/', {
          title: 'Objective Registered',
          message: `New task: ${inputValue}`,
          type: 'success'
        });
      } else {
        await api.post('/api/notes/', {
          title: inputValue.substring(0, 30),
          category: 'quick-capture',
          content: inputValue
        });

        // Add notification for the new note
        await api.post('/api/notifications/', {
          title: 'Insight Captured',
          message: `New note: ${inputValue.substring(0, 20)}...`,
          type: 'info'
        });
      }
      handleClose();
      window.dispatchEvent(new CustomEvent('data-refreshed'));
      window.dispatchEvent(new CustomEvent('notifications-refresh'));
    } catch (error) {
      console.error('Error in quick add:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckSquare size={14} className="text-rose-400" />;
      case 'note': return <FileText size={14} className="text-indigo-400" />;
      case 'habit': return <Activity size={14} className="text-emerald-400" />;
      case 'learning': return <Zap size={14} className="text-amber-400" />;
      case 'milestone': return <Target size={14} className="text-purple-400" />;
      case 'nav': return <LayoutDashboard size={14} className="text-indigo-400" />;
      default: return <LayoutDashboard size={14} />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full mb-8">
      <div className="flex items-center justify-between gap-8 h-20 px-8 bg-white/[0.02] border-b border-white/5 backdrop-blur-xl">
        {/* Search Engine */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${searchFocused ? 'text-indigo-400' : 'text-slate-500'}`}>
              <Search size={18} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Search Intelligence Nodes (⌘ K)"
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/30 focus:bg-white/[0.08] transition-all"
            />
            <div className="absolute inset-y-0 right-4 flex items-center gap-1.5 pointer-events-none opacity-40">
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="pointer-events-auto hover:text-white">
                  <X size={14} />
                </button>
              ) : (
                <>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-black">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-black">K</kbd>
                </>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchFocused && (searchQuery.length >= 2 || isSearching) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 glass-card border border-white/10 shadow-2xl overflow-hidden max-h-[400px] flex flex-col"
              >
                <div className="p-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Neural Matches</span>
                  {isSearching && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 border-t-2 border-indigo-400 rounded-full mr-2" />}
                </div>
                
                <div className="overflow-y-auto custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => {
                          navigate(result.path);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center gap-4 group"
                      >
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/10 transition-colors">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-white truncate group-hover:text-indigo-300 transition-colors">{result.title}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{result.subtitle}</p>
                        </div>
                      </button>
                    ))
                  ) : !isSearching && (
                    <div className="p-8 text-center text-slate-500">
                      <p className="text-xs font-bold uppercase tracking-widest italic opacity-50">No intelligence nodes found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Telemetry */}
        <div className="flex items-center gap-6">
          {/* Temporal Sync */}
          <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <Clock size={16} className="text-indigo-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white leading-none tabular-nums">
                {format(time, 'HH:mm:ss')}
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">
                IST Sync
              </span>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowQuickAdd(true)}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group relative"
            >
              <Plus size={20} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            </button>
            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifs(n => !n)}
                className="relative p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-all"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-lg animate-pulse">{unreadCount}</span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-14 w-80 glass-card border border-white/10 shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-black">{unreadCount} New</span>
                      )}
                    </div>
                    <div className="divide-y divide-white/5 max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => { 
                              if (!n.is_read) markAsRead(n.id);
                              setShowNotifs(false); 
                            }}
                            className={clsx(
                              "w-full text-left flex items-start gap-3 p-4 hover:bg-white/5 transition-all group relative",
                              !n.is_read && "bg-indigo-500/[0.03]"
                            )}
                          >
                            {!n.is_read && (
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500" />
                            )}
                            <span className="text-xl mt-0.5 flex-shrink-0">
                              {n.type === 'success' ? '⚡' : n.type === 'warning' ? '🎯' : '📋'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={clsx(
                                "text-xs font-black transition-colors truncate",
                                n.type === 'success' ? 'text-indigo-400' : n.type === 'warning' ? 'text-amber-400' : 'text-emerald-400',
                                !n.is_read && "group-hover:text-white"
                              )}>{n.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{n.message}</p>
                            </div>
                            <span className="text-[9px] text-slate-600 font-bold flex-shrink-0 mt-1">
                              {format(new Date(n.created_at), 'HH:mm')}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-10 text-center space-y-3 opacity-30">
                          <Bell size={32} className="mx-auto text-slate-500" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No Alerts Found</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-white/5">
                      <button
                        onClick={() => { navigate('/settings'); setShowNotifs(false); }}
                        className="w-full text-center text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
                      >
                        View Full System Report →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-px h-8 bg-white/5 mx-2" />
            {/* Profile Section */}
            <div ref={profileRef} className="relative">
              <div
                onClick={() => setShowProfile(p => !p)}
                className="flex items-center gap-4 pl-2 group cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-white leading-none uppercase tracking-tighter">Dhananjay K.</p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} 
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
                    />
                    <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Admin Alpha</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-all">
                    <User size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#020617] rounded-full" />
                </div>
              </div>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-14 w-64 glass-card border border-white/10 shadow-2xl overflow-hidden z-50"
                  >
                    {/* Profile Header */}
                    <div className="p-5 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                          <User size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white tracking-tight">Dhananjay Kharkar</p>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Admin Alpha · System Architect</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[9px] text-emerald-400 font-bold">Online</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="p-2">
                      {[
                        { label: 'Settings', path: '/settings', icon: '⚙️' },
                        { label: 'Analytics', path: '/analytics', icon: '📊' },
                        { label: 'Terminal', path: '/terminal', icon: '⬛' },
                      ].map(item => (
                        <button
                          key={item.path}
                          onClick={() => { navigate(item.path); setShowProfile(false); }}
                          className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="text-xs font-black text-slate-300 group-hover:text-white uppercase tracking-wider transition-colors">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-white/5 p-3">
                      <p className="text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">Orin Protocol · Build 1.0</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <div 
            onClick={handleClose}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <GlassCard className="p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 text-indigo-500/5 pointer-events-none">
                  <Zap size={200} />
                </div>
                
                <div className="flex justify-between items-center mb-10 text-left">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Quick Entry Protocol</h3>
                  <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest px-2">Abort</button>
                </div>

                <div className="flex gap-4 mb-8 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setQuickAddType('task')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quickAddType === 'task' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    New Task
                  </button>
                  <button 
                    onClick={() => setQuickAddType('note')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quickAddType === 'note' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    New Insight
                  </button>
                </div>

                <form onSubmit={handleQuickAdd} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Objective Identification</label>
                    <input 
                      autoFocus 
                      required 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/30 transition-all font-medium" 
                      placeholder={quickAddType === 'task' ? "Describe tactical objective..." : "Capture neural insight..."} 
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    type="submit" 
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      'Initialize Entry'
                    )}
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Topbar;
