import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu,
  Zap,
  TrendingUp,
  Brain, 
  Target,
  ArrowRight,
  ChevronRight,
  Activity
} from 'lucide-react';
import api from '../api';

const TelemetryHUD: React.FC<{ telemetry: any }> = ({ telemetry }) => {
  const bandwidth = Math.min(100, (telemetry.tasksCount + telemetry.topicsCount) * 5 + 60);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-3xl premium-shadow relative overflow-hidden group">
      <div className="scanner-light" />
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Neural Bandwidth</p>
          <span className="text-xs font-black text-white italic">{bandwidth.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${bandwidth}%` }} 
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" 
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Sync Stability</p>
          <span className="text-xs font-black text-white italic">99.9%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: '99.9%' }} 
            className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_#6366f1]" 
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">System Pulse</p>
          <span className="text-xs font-black text-white italic">Active</span>
        </div>
        <div className="flex gap-1 h-1.5">
          {[1,2,3,4,5,6,7,8].map(i => (
            <motion.div 
              key={i}
              animate={{ height: [4, 12, 4], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              className="flex-1 bg-rose-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const HomeTerminal: React.FC<{ telemetry: any }> = ({ telemetry }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const systemLogs = [
    ">>> INITIALIZING NEURAL INTERFACE...",
    ">>> KERNEL VERSION 4.12.0-STABLE",
    ">>> BIOMETRIC AUTHENTICATION: ADMIN VERIFIED",
    `>>> SCANNING FINANCIAL REGISTRY... [OK]`,
    `>>> NET WORTH: ₹${telemetry.balance?.toLocaleString()} | SECTORS: SYNCED`,
    `>>> LOADING EVOLUTION MAP... ${telemetry.topicsCount} NODES ACTIVE`,
    `>>> TASK HUB: ${telemetry.tasksCount} OPERATIONAL OBJECTIVES`,
    ">>> HABIT ENGINE: RUNNING AT 84% EFFICIENCY",
    ">>> SYSTEM READY. WELCOME ARCHITECT.",
    ">>> ------------------------------------------",
    ">>> AWAITING OPERATIONAL DIRECTIVES..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < systemLogs.length) {
        setLogs(prev => [...prev, systemLogs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-6 font-mono text-[10px] h-64 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
        <div className="w-2 h-2 rounded-full bg-rose-500/50" />
        <div className="w-2 h-2 rounded-full bg-amber-500/50" />
        <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2">System Console</span>
      </div>
      <div ref={scrollRef} className="space-y-1 overflow-y-auto h-[180px] custom-scrollbar">
        {logs.map((log, index) => (
          <div key={index} className="flex gap-2">
            <span className="text-emerald-500/50 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
            <span className={log?.includes('[OK]') ? "text-emerald-400" : "text-slate-400"}>{log}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState({
    tasksCount: 0,
    balance: 0,
    topicsCount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const [tasks, _finance, learning] = await Promise.all([
          api.get('/api/tasks/'),
          api.get('/api/finance/summary?period=monthly'),
          api.get('/api/learning/')
        ]);
        
        // Count active tasks
        const activeTasks = tasks.data.filter((t: any) => t.status !== 'done').length;
        
        // Sum total balance (calculating balance from transactions instead of just summary)
        const allTrans = await api.get('/api/finance/transactions');
        const netBalance = allTrans.data.reduce((acc: number, t: any) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

        setTelemetry({
          tasksCount: activeTasks,
          balance: netBalance,
          topicsCount: learning.data.length,
          loading: false
        });
      } catch (err) {
        console.error('Telemetry Sync Failure:', err);
      }
    };
    fetchTelemetry();
  }, []);
  
  // 3D Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), { stiffness: 100, damping: 30 });

  function handleMouse(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="relative min-h-screen pt-20 pb-32 overflow-hidden bg-[#020617]">
      <div className="fixed inset-0 neural-grid opacity-20 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none z-0" />
      
      {/* 3D HERO SECTION */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        <motion.div 
          className="lg:col-span-7 space-y-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">System Identity: Admin Alpha</span>
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-[8rem] font-black text-white italic tracking-tighter leading-none uppercase gradient-text-emerald">Neural</h1>
              <h1 className="text-[8rem] font-black text-white italic tracking-tighter leading-none uppercase -mt-8 outline-text">Interface</h1>
            </div>
            
            <p className="text-xl font-medium text-slate-500 max-w-2xl leading-relaxed tracking-wide italic border-l-4 border-emerald-500/30 pl-8">
              Welcome back, Architect. Your personal life OS has reached full synchronization. 
              Operation protocols are ready for initialization.
            </p>
          </div>

          <div className="flex gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-10 py-6 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center gap-4 transition-all"
            >
              Control Center <ArrowRight size={20} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/terminal')}
              className="px-10 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-3xl backdrop-blur-xl flex items-center gap-4 transition-all"
            >
              Kernel CLI
            </motion.button>
          </div>

          <HomeTerminal telemetry={telemetry} />
        </motion.div>

        {/* 3D TILT CARDS */}
        <div className="lg:col-span-5 relative h-[600px] perspective-2000 hidden lg:block">
          <motion.div 
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY }}
            className="w-full h-full relative preserve-3d"
          >
            {/* Main Card */}
            <div className="absolute inset-x-0 top-20 h-[450px] bg-[#020617]/40 border border-white/10 rounded-[3rem] backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-12 text-center group transition-all translate-z-20">
              <div className="scanner-light" />
              <div className="mb-8 p-8 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform duration-500">
                <Brain size={80} className="text-emerald-500" />
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Core Synapse</h3>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Operational Readiness: 100%</p>
              
              <div className="mt-12 flex gap-4 w-full">
                <div className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Uptime</p>
                  <p className="text-lg font-black text-white italic">142h</p>
                </div>
                <div className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Health</p>
                  <p className="text-lg font-black text-emerald-400 italic">Optimum</p>
                </div>
              </div>
            </div>

            {/* Floaties */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/20 border border-indigo-500/30 rounded-[2.5rem] backdrop-blur-2xl p-6 flex flex-col justify-between translate-z-40"
            >
              <Cpu className="text-indigo-400" />
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Processing</p>
                <p className="text-xl font-black text-white italic">Neural</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-2/3 -left-10 w-44 h-44 bg-rose-500/20 border border-rose-500/30 rounded-[2.5rem] backdrop-blur-2xl p-6 flex flex-col justify-between translate-z-60"
            >
              <Zap className="text-rose-400" />
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Energy</p>
                <p className="text-xl font-black text-white italic">Active</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* TELEMETRY HUD */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-16">
        <TelemetryHUD telemetry={telemetry} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-20">
        <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-10 border-l-2 border-emerald-500 pl-4">Sector Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: TrendingUp, label: 'Capital Hub', path: '/finance', color: 'border-emerald-500/30', text: 'Financial Sync' },
            { icon: Brain, label: 'Evolution Map', path: '/learning', color: 'border-indigo-500/30', text: 'Cognitive Growth' },
            { icon: Target, label: 'Task Hub', path: '/tasks', color: 'border-rose-500/30', text: 'Operational Goals' },
            { icon: Activity, label: 'Habit Engine', path: '/habits', color: 'border-amber-500/30', text: 'Routine Mastery' }
          ].map((action, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02, y: -10 }}
              onClick={() => navigate(action.path)}
              className={`p-10 bg-white/[0.02] border ${action.color} rounded-[3rem] backdrop-blur-xl cursor-pointer group premium-shadow overflow-hidden relative`}
            >
              <div className="scanner-light" />
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <action.icon className="text-white group-hover:scale-110 transition-transform" />
                </div>
                <ChevronRight className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">{action.label}</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{action.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
