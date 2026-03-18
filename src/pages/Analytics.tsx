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
  Cpu 
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState({
    taskCompletion: 0,
    learningHours: 0,
    masteryLevel: 0,
    mistakeCount: 0
  });

  const [learningTrend, setLearningTrend] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [masteryData, setMasteryData] = useState<any[]>([]);

  useEffect(() => {
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
          const dailyLogs = logsRes.data.filter((l: any) => l.log_date === date || l.created_at.startsWith(date));
          const hours = dailyLogs.reduce((acc: number, l: any) => acc + l.hours_studied, 0);
          return Math.min(100, (hours / 8) * 100); 
        });
        setLearningTrend(dailyHours);

      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalyticsData();
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">System Diagnostics Live</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full w-fit">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Efficiency: Optimal</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic">
            Intelligence Briefing
          </h2>
          <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
            Neural mapping of mission objectives and knowledge acquisition velocity. Synchronized via <span className="text-indigo-400 font-black italic">QUANTUM-CORE</span>.
          </p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Task Velocity', value: `${stats.taskCompletion}%`, icon: Target, color: 'indigo' },
          { label: 'Knowledge Accrual', value: `${stats.learningHours}h`, icon: Activity, color: 'emerald' },
          { label: 'System Mastery', value: `${stats.masteryLevel}%`, icon: Cpu, color: 'amber' },
          { label: 'Error Density', value: stats.mistakeCount, icon: BarChart3, color: 'rose' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <GlassCard className="p-10 relative overflow-hidden group border border-white/5 hover:border-indigo-500/30 transition-all">
              {/* Neural/High-Tech background pattern */}
              <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-indigo-500/10 group-hover:scale-125 transition-all duration-700 -rotate-12 pointer-events-none">
                <stat.icon size={120} />
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-indigo-500/30 transition-all" />
              
              <div className="flex flex-col gap-4 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                <h3 className="text-5xl font-black text-white tracking-tighter">{stat.value}</h3>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard className="min-h-[500px] p-10 flex flex-col relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-10 text-indigo-500/5">
              <Layers size={150} />
            </div>

            <div className="flex justify-between items-center mb-12 relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-3 text-white tracking-tighter uppercase">
                  <BarChart3 className="text-indigo-500" size={28} />
                  Learning Trend
                </h3>
                <p className="text-sm text-slate-500 font-medium">Temporal skill acquisition frequency</p>
              </div>
            </div>

            <div className="flex-1 flex items-end justify-between px-4 pb-10 border-l border-b border-white/5 relative z-10">
              {learningTrend.map((height, i) => (
                <div key={i} className="w-6 md:w-10 group relative flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(2, height)}%` }}
                    transition={{ duration: 1.5, delay: 0.5 + i * 0.05, ease: [0.33, 1, 0.68, 1] }}
                    className="w-full bg-gradient-to-t from-indigo-600/20 to-indigo-500 rounded-t-xl"
                  />
                  <span className="absolute -bottom-8 text-[9px] font-black text-slate-600 uppercase tracking-tighter">T-{6 - i}D</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="p-10 relative overflow-hidden h-full">
            <div className="flex justify-between items-center mb-12 relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-3 text-white tracking-tighter uppercase">
                  <TrendingUp className="text-emerald-500" size={28} />
                  Mastery
                </h3>
                <p className="text-sm text-slate-500 font-medium">Domain competence distribution</p>
              </div>
            </div>

            <div className="space-y-10 relative z-10">
              {masteryData.map((skill, i) => (
                <div key={skill.label} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-200 tracking-tight uppercase text-sm truncate max-w-[150px]">{skill.label}</span>
                    <span className="text-white font-black text-lg tracking-tighter">{skill.value}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden p-[2px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value}%` }}
                      transition={{ duration: 1.5, delay: 0.8 + i * 0.1, ease: "circOut" }}
                      className={`h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full`}
                    />
                  </div>
                </div>
              ))}
              {masteryData.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 opacity-20">
                   <Target size={40} className="text-slate-600" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 text-center mt-4">No Mastery Data</p>
                 </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
