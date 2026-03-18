import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { Plus, Trash2, Clock, Zap, Target, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'doing' | 'done';
  task_type: 'learning' | 'personal' | 'work';
  due_date: string;
  category: string;
  created_at: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    task_type: 'personal',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    category: 'general'
  });

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

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks/');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const refreshHandler = () => fetchTasks();
    window.addEventListener('data-refreshed', refreshHandler);
    return () => window.removeEventListener('data-refreshed', refreshHandler);
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/tasks/', newTask);
      setShowAddModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        task_type: 'personal',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        category: 'general'
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/tasks/${id}/status?status=${status}`);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
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
          <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Tactical Control Active</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Node Count: {tasks.length}</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic">
              Strategic Objectives
            </h2>
            <p className="text-slate-400 text-xl font-medium max-w-xl leading-relaxed">
              Neural mapping of operational landscape. Precision execution authorized under <span className="text-indigo-400 font-black italic">PROT-DECISION</span>.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="group relative flex items-center gap-3 px-8 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.2)] font-black uppercase tracking-widest text-xs active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus size={18} />
            <span>Initialize Objective</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {['todo', 'doing', 'done'].map((status) => (
          <motion.div key={status} variants={item} className="space-y-6">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  status === 'todo' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                  status === 'doing' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 
                  'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                }`} />
                {status}
              </h3>
              <span className="text-[10px] bg-white/10 px-3 py-1 rounded-lg text-slate-300 font-black border border-white/10">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            
            <div className="space-y-4 min-h-[500px]">
              <AnimatePresence mode="popLayout">
                {tasks.filter(t => t.status === status).map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <GlassCard className="p-6 group relative overflow-hidden h-full border border-white/5 hover:border-indigo-500/30 transition-all">
                      {/* Neural Background visualization */}
                      <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-indigo-500/10 group-hover:scale-150 transition-all duration-700 -rotate-12 pointer-events-none">
                        {task.status === 'done' ? <CheckCircle2 size={120} /> : <Target size={120} />}
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-indigo-500/30 transition-all" />
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-wrap gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${getPriorityStyles(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-500">
                              {task.task_type}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-slate-700 hover:text-rose-500 transition-all p-2 bg-white/5 rounded-xl hover:bg-rose-500/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-black text-white group-hover:text-indigo-400 transition-all text-xl tracking-tight uppercase">
                            {task.title}
                          </h4>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            <Clock size={12} className="text-indigo-500/50" />
                            <span>{task.due_date}</span>
                          </div>
                          <div className="flex gap-2">
                            {status !== 'todo' && (
                              <button 
                                onClick={() => handleUpdateStatus(task.id, 'todo')}
                                className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                              >
                                <AlertCircle size={14} />
                              </button>
                            )}
                            {status === 'todo' && (
                              <button 
                                onClick={() => handleUpdateStatus(task.id, 'doing')}
                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/5 px-4 py-2 rounded-xl hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/10"
                              >
                                <Target size={12} /> Start
                              </button>
                            )}
                            {status !== 'done' && (
                              <button 
                                onClick={() => handleUpdateStatus(task.id, 'done')}
                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/5 px-4 py-2 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/10"
                              >
                                <CheckCircle2 size={12} /> Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {tasks.filter(t => t.status === status).length === 0 && !loading && (
                <div className="h-32 rounded-3xl border-2 border-dashed border-white/[0.03] flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800">No Registry</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl glass-card p-8 md:p-12 border border-white/10 premium-shadow relative overflow-hidden my-auto"
            >
              <div className="absolute -right-20 -top-20 text-indigo-500/5 pointer-events-none">
                <Target size={300} />
              </div>

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/30">
                    <Zap className="text-white" size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none italic">Initialize Objective</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Define new parameters for operational execution.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-slate-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Target Identification</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 font-bold focus:border-indigo-500/50 transition-all outline-none" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="e.g. Audit Cryptographic Subsystem" />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Operational Directive</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-slate-300 min-h-[100px] focus:border-indigo-500/50 transition-all outline-none leading-relaxed font-medium" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Specify success criteria and implementation path..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Temporal Deadline</label>
                    <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white cursor-pointer font-bold focus:border-indigo-500/50 transition-all outline-none" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Impact Tier</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold cursor-pointer focus:border-indigo-500/50 transition-all outline-none appearance-none" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                      <option value="low" className="bg-slate-900">LOW IMPACT</option>
                      <option value="medium" className="bg-slate-900">STANDARD IMPACT</option>
                      <option value="high" className="bg-slate-900">CRITICAL IMPACT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Domain Architecture</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold cursor-pointer focus:border-indigo-500/50 transition-all outline-none appearance-none" value={newTask.task_type} onChange={e => setNewTask({...newTask, task_type: e.target.value as any})}>
                      <option value="personal" className="bg-slate-900">PERSONAL ECOSYSTEM</option>
                      <option value="learning" className="bg-slate-900">INTELLIGENCE ENGINE</option>
                      <option value="work" className="bg-slate-900">PROFESSIONAL STRATUM</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Vertical Classification</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold placeholder:text-slate-700 focus:border-indigo-500/50 transition-all outline-none" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} placeholder="e.g. Infrastructure" />
                  </div>
                </div>

                <div className="flex gap-6 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all border border-white/5">Abort Objective</button>
                  <button type="submit" className="flex-1 p-5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Zap size={14} />
                    Commit Command
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Tasks;
