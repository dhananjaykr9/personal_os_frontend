import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Activity, 
  Layers, 
  Cpu,
  Zap,
  Brain,
  Shield,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState({
    taskCompletion: 0,
    learningHours: 0,
    masteryLevel: 0,
    mistakeCount: 0
  });

  const [learningTrend, setLearningTrend] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [masteryData, setMasteryData] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState(new Date());

  const fetchAnalyticsData = async () => {
    try {
      const [tasksRes, topicsRes, logsRes, mistakesRes] = await Promise.all([
        api.get('/api/tasks/'),
        api.get('/api/learning/'),
        api.get('/api/learning-logs/'),
        api.get('/api/mistakes/')
      ]);

      const totalTasks = tasksRes.data.length;
      const completedTasks = tasksRes.data.filter((t: any) => t.status === 'completed' || t.status === 'done').length;
      const totalHours = topicsRes.data.reduce((acc: number, t: any) => acc + (t.hours_spent || 0), 0);
      const avgMastery = topicsRes.data.length > 0
        ? Math.round(topicsRes.data.reduce((acc: number, t: any) => acc + t.completion_percentage, 0) / topicsRes.data.length)
        : 0;

      setStats({
        taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        learningHours: totalHours,
        masteryLevel: avgMastery,
        mistakeCount: mistakesRes.data.length
      });

      // Mastery - Actual topics
      setMasteryData(topicsRes.data.slice(0, 4).map((t: any) => ({
        label: t.topic,
        value: t.completion_percentage,
        color: t.completion_percentage > 70 ? 'indigo' : 'purple'
      })));

      // Generate a 7-day trend from logs
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const dailyHours = last7Days.map(date => {
        const dailyLogs = logsRes.data.filter((l: any) => l.log_date === date || (l.created_at && l.created_at.startsWith(date)));
        const hours = dailyLogs.reduce((acc: number, l: any) => acc + l.hours_studied, 0);
        return Math.min(100, (hours / 8) * 100); 
      });
      setLearningTrend(dailyHours);
      setLastSync(new Date());

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000); // 30s Intelligence Sync
    
    const handleRefresh = () => fetchAnalyticsData();
    window.addEventListener('data-refreshed', handleRefresh);
    window.addEventListener('notifications-refresh', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('data-refreshed', handleRefresh);
      window.removeEventListener('notifications-refresh', handleRefresh);
    };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen">
      {/* Neural Grid Backdrop */}
      <div className="fixed inset-0 neural-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
      >
        <motion.header variants={item} className="space-y-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,1)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Intelligence Sync Active</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl backdrop-blur-md">
              <History size={14} className="text-emerald-500/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 tabular-nums">
                Last Update: {format(lastSync, 'HH:mm:ss')}
              </span>
            </div>
            <div className="flex items-center gap-3 px-5 py-2 bg-purple-500/5 border border-purple-500/10 rounded-xl backdrop-blur-md">
              <Shield size={14} className="text-purple-500/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500/60">Core Secure</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
                <Brain size={32} className="text-indigo-400" />
              </div>
              <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic uppercase">
                Neural Analytics
              </h2>
            </div>
            <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed pl-2 border-l-2 border-indigo-500/30">
              Real-time telemetry of mission objectives and cognitive proficiency. Synchronized via <span className="text-indigo-400 font-black italic">ORIN.CORE.SYMMETRY</span>.
            </p>
          </div>
        </motion.header>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Task Velocity', value: `${stats.taskCompletion}%`, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'hover:border-indigo-500/40' },
            { label: 'Knowledge Accrual', value: `${stats.learningHours}h`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/40' },
            { label: 'System Mastery', value: `${stats.masteryLevel}%`, icon: Cpu, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/40' },
            { label: 'Error Density', value: stats.mistakeCount, icon: BarChart3, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'hover:border-rose-500/40' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={item}>
              <GlassCard className={clsx("p-10 relative overflow-hidden group border border-white/5 transition-all duration-500", stat.border)}>
                {/* Scanner Sweep Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-scanner-sweep pointer-events-none" />
                
                {/* Neural/High-Tech background icon */}
                <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 -rotate-12 pointer-events-none">
                  <stat.icon size={160} />
                </div>
                
                <div className="flex flex-col gap-6 relative z-10">
                  <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:rotate-6 transition-transform", stat.bg)}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{stat.label}</p>
                    <h3 className="text-6xl font-black text-white tracking-tighter italic">{stat.value}</h3>
                  </div>
                </div>
                
                {/* Tactical Corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={item} className="lg:col-span-2">
            <GlassCard className="min-h-[500px] p-10 flex flex-col relative overflow-hidden h-full border border-white/5">
              <div className="absolute top-0 right-0 p-10 text-indigo-500/5">
                <Layers size={200} />
              </div>

              <div className="flex justify-between items-center mb-16 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black flex items-center gap-4 text-white tracking-tighter uppercase italic">
                    <BarChart3 className="text-indigo-500" size={32} />
                    Cognitive Velocity
                  </h3>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest pl-1">Temporal skill acquisition frequency</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                  <Zap size={14} className="text-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Protocol Active</span>
                </div>
              </div>

              <div className="flex-1 flex items-end justify-between px-6 pb-12 border-l border-b border-white/10 relative z-10 gap-4">
                {learningTrend.map((height, i) => (
                  <div key={i} className="flex-1 group relative flex flex-col items-center max-w-[60px]">
                    {/* Glowing bar effect */}
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, height)}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.05, ease: [0.33, 1, 0.68, 1] }}
                      className="w-full bg-gradient-to-t from-indigo-600/30 to-indigo-400 rounded-t-xl relative z-10 border-x border-t border-white/10 group-hover:brightness-125 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                    >
                       <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/40" />
                    </motion.div>
                    <span className="absolute -bottom-10 text-[10px] font-black text-slate-600 uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">T-{6 - i}D</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard className="p-10 relative overflow-hidden h-full border border-white/5">
              <div className="flex justify-between items-center mb-16 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black flex items-center gap-4 text-white tracking-tighter uppercase italic">
                    <TrendingUp className="text-emerald-500" size={32} />
                    Expertise
                  </h3>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest pl-1">Domain competence distribution</p>
                </div>
              </div>

              <div className="space-y-12 relative z-10">
                {masteryData.map((skill, i) => (
                  <div key={skill.label} className="space-y-5 group">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operational Domain</span>
                        <span className="font-black text-white tracking-tight uppercase text-lg group-hover:text-indigo-400 transition-colors truncate max-w-[180px]">{skill.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-white tracking-tighter italic">{skill.value}%</span>
                      </div>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden p-[3px] border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.value}%` }}
                        transition={{ duration: 1.5, delay: 0.8 + i * 0.1, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)] relative"
                      >
                         <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-full" />
                      </motion.div>
                    </div>
                  </div>
                ))}
                {masteryData.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-20 opacity-20">
                     <Target size={60} className="text-slate-600" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 text-center mt-6">No Mastery Registry Found</p>
                   </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
