import React, { useState, useEffect } from 'react';
import api from '../api';
import GlassCard from '../components/GlassCard';
import { Plus, Check, Flame, Activity, TrendingUp, Calendar, Zap, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Habit {
  id: string;
  habit_name: string;
  frequency: string;
  streak: number;
  created_at: string;
}

const Habits: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState({ habit_name: '', frequency: 'daily' });
  const [todayLogs, setTodayLogs] = useState<string[]>([]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  const fetchHabits = async () => {
    try {
      const response = await api.get('/api/habits/');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/habits/', newHabit);
      setShowAddModal(false);
      setNewHabit({ habit_name: '', frequency: 'daily' });
      fetchHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleLogHabit = async (habitId: string) => {
    try {
      await api.post(`/api/habits/log?habit_id=${habitId}&log_date=${format(new Date(), 'yyyy-MM-dd')}&completed=true`);
      setTodayLogs([...todayLogs, habitId]);
      fetchHabits();
    } catch (error) {
      console.error('Error logging habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await api.delete(`/api/habits/${habitId}`);
      setShowDeleteConfirm(null);
      fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20 max-w-7xl mx-auto"
    >
      <motion.div variants={item} className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Bio-Sync Active</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Registry: Stable</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic">
              Consistency Matrix
            </h2>
            <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
              Architecting evolution through repetitive discipline and neural conditioning. Optimized for <span className="text-indigo-400 font-black italic">PEAK-PERFORMANCE</span>.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="group relative flex items-center gap-3 px-8 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.2)] font-black uppercase tracking-widest text-xs active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus size={18} />
            <span>Initialize Protocol</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.div variants={item} className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          {habits.map((habit) => {
            const isCompletedToday = todayLogs.includes(habit.id);
            return (
              <motion.div key={habit.id} variants={item}>
                <GlassCard className={`relative overflow-hidden group p-8 h-full border ${isCompletedToday ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'} hover:border-indigo-500/30 transition-all`}>
                  {/* Neural Background visualization */}
                  <div className="absolute -right-8 -top-8 text-white/5 group-hover:text-indigo-500/10 group-hover:scale-150 transition-all duration-700 -rotate-12 pointer-events-none">
                    <Flame size={180} />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-indigo-500/30 transition-all" />
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-all tracking-tighter uppercase">{habit.habit_name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{habit.frequency}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isCompletedToday ? 'text-emerald-400' : 'text-indigo-400/50'}`}>
                          {isCompletedToday ? 'Bio-Sync Optimal' : 'Bio-Sync Active'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 text-white bg-gradient-to-br from-orange-400 to-rose-600 px-4 py-2 rounded-2xl shadow-lg group-hover:scale-110 transition-all">
                        <Flame size={20} className="fill-white/20" />
                        <span className="font-black text-xl tracking-tighter">{habit.streak}</span>
                      </div>
                      <button 
                        onClick={() => setShowDeleteConfirm(habit.id)}
                        className="p-2 text-slate-700 hover:text-rose-500 transition-all bg-white/5 rounded-xl opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/5 mb-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
                        <Calendar size={12} className="text-indigo-400" /> Node Status
                      </span>
                      <span className={`text-lg font-bold mt-1 tracking-tight ${isCompletedToday ? 'text-emerald-400' : 'text-white'}`}>
                        {isCompletedToday ? 'Identity Synchronized' : 'Pending Completion'}
                      </span>
                    </div>
                    {!isCompletedToday && (
                      <button
                        onClick={() => handleLogHabit(habit.id)}
                        className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group/btn"
                      >
                        <Check size={32} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    )}
                    {isCompletedToday && (
                      <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Check size={32} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-between items-center opacity-60">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <TrendingUp size={14} /> Active Path Verified
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}

          <motion.div variants={item}>
            <GlassCard
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center justify-center border-2 border-dashed border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer p-12 h-full min-h-[300px] group"
            >
              <div className="p-6 rounded-[2rem] bg-white/5 group-hover:bg-indigo-500 text-slate-600 group-hover:text-white transition-all scale-110">
                <Sparkles size={40} />
              </div>
              <div className="mt-8 text-center space-y-1">
                <p className="font-black text-xl text-white tracking-tighter uppercase leading-none">Forge New Identity</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Add System Component</p>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        <motion.div variants={item} className="space-y-8">
          <GlassCard className="p-10 space-y-8 border border-white/5">
            <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
              <Activity className="text-indigo-400" size={24} />
              Bio-Rhythm Heatmap
            </h3>
            
            <div className="grid grid-cols-7 gap-1">
              {[...Array(28)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-full aspect-square rounded-sm border border-white/5 transition-all duration-500",
                    i % 3 === 0 ? "bg-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.3)]" : 
                    i % 5 === 0 ? "bg-indigo-500/20" : "bg-white/5"
                  )} 
                />
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-1">
              <span>Last 4 Weeks</span>
              <span>Today</span>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Capacity</span>
                <span className="text-white font-black">{habits.length}/12</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(habits.length / 12) * 100}%` }}
                  className="h-full bg-indigo-500 shadow-lg shadow-indigo-500/20"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-10 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 text-indigo-500/5 group-hover:text-indigo-500/10 transition-all">
              <Zap size={150} />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Strategic Conditioning</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Consistency is the architectural foundation of the human ecosystem. Repetitive discipline leads to neural crystallization.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl glass-card p-12 border border-white/10 premium-shadow relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-orange-500/5">
                <Flame size={200} />
              </div>
              
              <h3 className="text-4xl font-black text-white mb-10 tracking-tighter uppercase relative z-10">Initialize Protocol</h3>
              
              <form onSubmit={handleCreateHabit} className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Component</label>
                  <input required placeholder="Define new repetitive action..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold focus:border-indigo-500/50 transition-all outline-none" value={newHabit.habit_name} onChange={(e) => setNewHabit({ ...newHabit, habit_name: e.target.value })} />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recurrence Cycle</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold cursor-pointer focus:border-indigo-500/50 transition-all outline-none" value={newHabit.frequency} onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}>
                    <option value="daily" className="bg-slate-900">Daily Execution</option>
                    <option value="weekly" className="bg-slate-900">Weekly Summary</option>
                  </select>
                </div>
                
                <div className="flex gap-6 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                  <button type="submit" className="flex-1 p-5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-indigo-500 transition-all active:scale-95">Commit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card p-10 border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)] text-center space-y-8"
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertTriangle className="text-rose-500" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Terminate Protocol?</h3>
                <p className="text-slate-500 font-medium">This action will permanently purge the selected identity component from the Consistency Matrix.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 p-4 rounded-xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                <button onClick={() => handleDeleteHabit(showDeleteConfirm)} className="flex-1 p-4 rounded-xl bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-600/30 active:scale-95 transition-all">Confirm Purge</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Habits;
