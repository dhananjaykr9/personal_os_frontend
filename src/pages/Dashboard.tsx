import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import GlassCard from '../components/GlassCard';
import {
  CheckSquare,
  BookOpen,
  TrendingUp,
  Zap,
  RotateCcw,
  BarChart3
} from 'lucide-react';

import { orin } from '../utils/orinVoice';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Today\'s Objectives', value: '0', icon: CheckSquare, color: 'from-indigo-500 to-blue-600' },
    { label: 'Learning Progress', value: '0%', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    { label: 'Habit Consistency', value: '0%', icon: RotateCcw, color: 'from-orange-500 to-rose-600' },
    { label: 'Productivity Score', value: '0', icon: BarChart3, color: 'from-purple-500 to-indigo-600' },
  ]);

  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [quickTasks, setQuickTasks] = useState<any[]>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo' as 'todo' | 'doing' | 'done',
    task_type: 'personal',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    category: 'general'
  });

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, topicsRes] = await Promise.all([
        api.get('/api/tasks/'),
        api.get('/api/learning/')
      ]);

      const activeTasks = tasksRes.data.filter((t: any) => t.status !== 'completed' && t.status !== 'done').length;
      const avgMastery = topicsRes.data.length > 0 
        ? Math.round(topicsRes.data.reduce((acc: number, t: any) => acc + t.completion_percentage, 0) / topicsRes.data.length) 
        : 0;

      // Calculate Habit Completion for today
      const habitLogsRes = await api.get('/api/habits/'); // Assuming we check habits for logs
      // This is a simplified consistency check
      const habitCount = habitLogsRes.data.length;
      const completedToday = habitLogsRes.data.filter((h: any) => h.streak > 0).length; // Placeholder logic
      const habitConsistency = habitCount > 0 ? Math.round((completedToday / habitCount) * 100) : 0;

      setStats([
        { label: 'Tactical Objectives', value: activeTasks.toString(), icon: CheckSquare, color: 'from-indigo-500 to-blue-600' },
        { label: 'Neural Progress', value: `${avgMastery}%`, icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
        { label: 'Bio-Sync Matrix', value: `${habitConsistency}%`, icon: RotateCcw, color: 'from-orange-500 to-rose-600' },
        { label: 'System Efficiency', value: (activeTasks * 10 + habitConsistency).toString(), icon: BarChart3, color: 'from-purple-500 to-indigo-600' },
      ]);

      setLearningProgress(topicsRes.data.slice(0, 3).map((t: any) => ({
        label: t.topic,
        value: t.completion_percentage,
        color: t.completion_percentage > 70 ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-blue-500'
      })));

      setQuickTasks(tasksRes.data
        .filter((t: any) => t.status !== 'completed' && t.status !== 'done')
        .slice(0, 3)
        .map((t: any) => ({
          title: t.title,
          priority: t.priority || 'medium',
          color: t.priority === 'high' ? 'text-rose-500 bg-rose-500/10' : 
                 t.priority === 'low' ? 'text-emerald-500 bg-emerald-500/10' : 
                 'text-amber-500 bg-amber-500/10'
        }))
      );

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    orin.speak("Dashboard synchronized. All systems operational.");
    
    const refreshHandler = () => fetchDashboardData();
    window.addEventListener('data-refreshed', refreshHandler);
    return () => window.removeEventListener('data-refreshed', refreshHandler);
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/tasks/', newTask);
      setShowAddTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        task_type: 'personal',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        category: 'general'
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20 max-w-7xl mx-auto"
    >
      <motion.header variants={item} className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">System Live</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full w-fit">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">ID: D_KHARKAR | Admin Alpha</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Security: Stable</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic">
              Tactical Briefing: Chief Dhananjay
            </h2>
          </div>
          <p className="text-slate-400 text-xl font-medium max-w-3xl leading-relaxed">
            Neural mapping consolidated. <span className="text-indigo-400 font-black tracking-widest italic">{stats[0].value} objectives</span> pending action. Bio-Sync matrix stabilized at <span className="text-emerald-400 font-black tracking-widest italic">{stats[2].value}</span>.
          </p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <GlassCard className="p-8 relative overflow-hidden group glass-glow h-full border border-white/5 hover:border-indigo-500/30 transition-all">
              {/* Neural/High-Tech background pattern */}
              <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-indigo-500/10 group-hover:scale-125 transition-all duration-700 -rotate-12">
                <stat.icon size={120} />
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-indigo-500/30 transition-all" />
              
              <div className="flex flex-col gap-6 relative z-10">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} w-fit shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                  <h3 className="text-5xl font-black text-white tracking-tighter">{stat.value}</h3>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard className="h-full relative overflow-hidden group p-10 border border-white/5 bg-slate-900/40">
            {/* Neural Backdrop for Chart */}
            <div className="absolute inset-0 neural-grid opacity-10 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-tight">
                  <TrendingUp className="text-indigo-400" size={24} />
                  Weekly Productivity Flux
                </h3>
                <p className="text-sm text-slate-500 font-medium">Performance metrics over last 7 rotation cycles</p>
              </div>
              <div className="flex items-end gap-3 h-40">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full">
                    <div className="w-full bg-white/5 rounded-2xl relative overflow-hidden group/bar border border-white/5 h-full">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${30 + Math.random() * 60}%` }}
                        transition={{ duration: 2, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600/80 via-indigo-500/60 to-indigo-400 group-hover/bar:from-indigo-500 group-hover/bar:to-indigo-300 transition-all"
                      />
                      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">D0{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid gap-8 border-t border-white/5 pt-10 relative z-10 font-black italic">
              <div className="space-y-1">
                 <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Active Neural Pathways</h4>
              </div>
              {learningProgress.map((topic, i) => (
                <div key={topic.label} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 font-bold text-sm uppercase tracking-tight">{topic.label}</span>
                    <span className="text-indigo-400 font-black text-sm">{topic.value}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.value}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "circOut" }}
                      className={`h-full bg-gradient-to-r ${topic.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
              {learningProgress.length === 0 && (
                <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] py-12 text-center">No Active Nodes</p>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="h-full p-10 flex flex-col border border-white/5">
            <div className="flex justify-between items-center mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-tight">
                  <Zap className="text-amber-400" size={24} />
                  Registry
                </h3>
                <p className="text-sm text-slate-500 font-medium">Immediate high-value actions</p>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {quickTasks.map((task) => (
                <motion.div
                  key={task.title}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group"
                >
                  <div className={`p-2 rounded-xl ${task.color} transition-colors group-hover:bg-indigo-500/20`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current shadow-lg" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-all truncate uppercase tracking-tight">{task.title}</span>
                </motion.div>
              ))}
              {quickTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-20">
                   <CheckSquare size={48} className="text-slate-700" />
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 text-center">System Clear</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowAddTaskModal(true)}
              className="w-full mt-10 py-5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95"
            >
              Deploy Objective
            </button>
          </GlassCard>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddTaskModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card p-12 border border-white/10 premium-shadow relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-indigo-500/5">
                <Zap size={200} />
              </div>

              <h3 className="text-3xl font-black text-white mb-10 tracking-tighter uppercase relative z-10">Launch New Objective</h3>

              <form onSubmit={handleCreateTask} className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Identification</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold focus:border-indigo-500/50 transition-all outline-none" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="e.g. Audit Cryptographic Subsystem" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deadline</label>
                    <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold focus:border-indigo-500/50 transition-all outline-none" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold focus:border-indigo-500/50 transition-all outline-none cursor-pointer" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                      <option value="low" className="bg-slate-900">Low Impact</option>
                      <option value="medium" className="bg-slate-900">Standard Impact</option>
                      <option value="high" className="bg-slate-900">Critical Impact</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-indigo-400 font-bold focus:border-indigo-500/50 transition-all outline-none cursor-pointer" value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value as any})}>
                      <option value="todo" className="bg-slate-900">Todo</option>
                      <option value="doing" className="bg-slate-900">Doing</option>
                      <option value="done" className="bg-slate-900">Done</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-6 pt-6">
                  <button type="button" onClick={() => setShowAddTaskModal(false)} className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                  <button type="submit" className="flex-1 p-5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95">Deploy Command</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
