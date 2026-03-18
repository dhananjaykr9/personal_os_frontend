import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { 
  Flag, 
  CheckCircle2, 
  MapPin, 
  Zap,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Target,
  Plus,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

interface Milestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  status: string;
  tags: string[];
  icon_name: string;
}

const iconMap: Record<string, any> = {
  CheckCircle2,
  Zap,
  BrainCircuit,
  Flag,
  Target,
  MapPin
};

const Roadmap: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    target_date: '',
    status: 'planned',
    tags: '',
    icon_name: 'Target'
  });

  const fetchMilestones = async () => {
    try {
      const response = await api.get('/api/milestones/');
      setMilestones(response.data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/milestones/', {
        ...newMilestone,
        tags: newMilestone.tags.split(',').map(t => t.trim()).filter(t => t)
      });
      setIsModalOpen(false);
      setNewMilestone({
        title: '',
        description: '',
        target_date: '',
        status: 'planned',
        tags: '',
        icon_name: 'Target'
      });
      fetchMilestones();
    } catch (error) {
      console.error('Error adding milestone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      await api.delete(`/api/milestones/${id}`);
      fetchMilestones();
    } catch (error) {
      console.error('Error deleting milestone:', error);
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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20"
    >
      <motion.div variants={item} className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Strategic Trajectory Live</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Milestones: {milestones.length}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic">
              Strategic Timeline
            </h2>
            <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
              Architecting the long-term evolution of the ecosystem through defined milestones. Synchronized via <span className="text-indigo-400 font-black italic">FUTURE-CORE</span>.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-8 py-5 bg-white/5 px-10 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-black text-2xl tracking-tighter">75%</span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Phase 1</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-indigo-400 font-black text-2xl tracking-tighter italic">Alpha</span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Security</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative">
        {/* Timeline Stem */}
        <div className="absolute left-[2.25rem] md:left-[5.25rem] top-0 bottom-0 w-px bg-white/5 overflow-hidden">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-500/0 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          />
        </div>

        <div className="space-y-12">
          {milestones.map((milestone) => {
            const Icon = iconMap[milestone.icon_name] || Target;
            return (
              <motion.div key={milestone.id} variants={item} className="relative pl-24 md:pl-48">
                {/* Timeline Node */}
                <div className={`absolute left-4 md:left-[4.5rem] top-0 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-3xl z-20 transition-all duration-500 ${milestone.status === 'completed'
                    ? 'bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] text-white scale-110'
                    : milestone.status === 'in-progress'
                      ? 'bg-indigo-400 animate-pulse text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                      : 'bg-white/5 border border-white/10 text-slate-600'
                  }`}>
                  <Icon size={milestone.status === 'completed' ? 32 : 24} />
                </div>

                {/* Connector Pin */}
                <div className="absolute left-[2.25rem] md:left-[5.25rem] top-8 w-12 md:w-24 h-px bg-white/5" />

                <GlassCard className={`p-8 md:p-10 group hover:border-indigo-500/30 transition-all relative overflow-hidden h-full border border-white/5 ${milestone.status === 'in-progress' ? 'bg-indigo-500/5' : ''
                  }`}>
                  {/* Neural Background visualization */}
                  <div className="absolute -right-10 -top-10 text-white/5 group-hover:text-indigo-500/10 group-hover:scale-150 transition-all duration-700 -rotate-12 pointer-events-none">
                    <Icon size={200} />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-indigo-500/30 transition-all" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase group-hover:text-indigo-400 transition-colors">
                          {milestone.title}
                        </h3>
                        {milestone.status === 'in-progress' && (
                          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/20">
                            Active Phase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                        <TrendingUp size={12} className="text-indigo-500/50" /> Estimated Threshold: {milestone.target_date}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {milestone.tags.map(tag => (
                          <span key={tag} className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button 
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="text-slate-700 hover:text-rose-500 transition-all p-2 bg-white/5 rounded-xl hover:bg-rose-500/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-3xl relative z-10">
                    {milestone.description}
                  </p>

                  <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="flex -space-x-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                            <BrainCircuit size={14} className="text-slate-500" />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest italic">3 Interdependencies Identified</span>
                    </div>
                    <button className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]">
                      Detailed Specs <ChevronRight size={14} />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div variants={item}>
        <GlassCard 
          onClick={() => setIsModalOpen(true)}
          className="p-12 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-6 opacity-60 hover:opacity-100 hover:bg-white/5 transition-all group cursor-pointer"
        >
          <div className="p-8 rounded-[2rem] bg-white/5 group-hover:bg-indigo-500 text-slate-600 group-hover:text-white transition-all shadow-2xl">
            <Plus size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Expand Strategic Horizon</h3>
            <p className="text-slate-500 font-medium text-lg">Propose new operational milestones for the ecosystem.</p>
          </div>
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl my-auto"
            >
              <GlassCard className="p-8 md:p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Initialize Protocol</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Define new strategic milestone</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-slate-500 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddMilestone} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Objective Title</label>
                      <input
                        required
                        type="text"
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
                        placeholder="E.G. NEURAL LINK ALPHA"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Threshold Date</label>
                      <input
                        required
                        type="text"
                        value={newMilestone.target_date}
                        onChange={(e) => setNewMilestone({...newMilestone, target_date: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
                        placeholder="Q1 2026"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Objective Parameters (Tags)</label>
                    <input
                      type="text"
                      value={newMilestone.tags}
                      onChange={(e) => setNewMilestone({...newMilestone, tags: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
                      placeholder="AI, INFRASTRUCTURE, CORE"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Strategic Description</label>
                    <textarea
                      required
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-600 h-24 resize-none"
                      placeholder="DESCRIBE THE STRATEGIC IMPACT..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Current Status</label>
                      <select
                        value={newMilestone.status}
                        onChange={(e) => setNewMilestone({...newMilestone, status: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none cursor-pointer"
                      >
                        <option value="planned" className="bg-slate-900 text-white">PLANNED</option>
                        <option value="in-progress" className="bg-slate-900 text-white">IN-PROGRESS</option>
                        <option value="completed" className="bg-slate-900 text-white">COMPLETED</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Visual Identifier</label>
                      <select
                        value={newMilestone.icon_name}
                        onChange={(e) => setNewMilestone({...newMilestone, icon_name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none cursor-pointer"
                      >
                        {Object.keys(iconMap).map(icon => (
                          <option key={icon} value={icon} className="bg-slate-900 text-white">{icon.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-[0_10px_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Initialize Milestone
                      </>
                    )}
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Roadmap;
