import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Cpu,
  Zap,
  Lock
} from 'lucide-react';

const Settings: React.FC = () => {
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
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  const settingsGrid = [
    { 
      title: 'Neural Profile', 
      desc: 'Manager user identity and biometric access parameters.', 
      icon: User, 
      color: 'indigo',
      items: ['Edit Identifier', 'Multi-factor Authorization', 'Access History']
    },
    { 
      title: 'Signal Protocol', 
      desc: 'Configure notification priority and delivery vectors.', 
      icon: Bell, 
      color: 'emerald',
      items: ['Critical Alerts', 'Standard Sync', 'Quiet Hours']
    },
    { 
      title: 'Core Security', 
      desc: 'Hardening system integrity and encryption layers.', 
      icon: Lock, 
      color: 'rose',
      items: ['Privacy Vault', 'API Key Rotation', 'Breach Registry']
    },
    { 
      title: 'Visual Matrix', 
      desc: 'Tailor the glassmorphism aesthetic and UI resonance.', 
      icon: Palette, 
      color: 'purple',
      items: ['Glow Intensity', 'Mesh Gradient Density', 'Typography Weight']
    },
    { 
      title: 'Data Sovereignty', 
      desc: 'Manage local database clusters and intelligence exports.', 
      icon: Database, 
      color: 'amber',
      items: ['Archive All Nodes', 'Vacuum Database', 'Export Intelligence']
    },
    { 
      title: 'System Kernel', 
      desc: 'Underlying hardware integration and performance tuning.', 
      icon: Cpu, 
      color: 'blue',
      items: ['Cache Invalidation', 'Worker Threads', 'Auto-Sync Delay']
    },
  ];

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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Core Parameters Active</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full w-fit">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Integrity: Verified</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic">
            Configuration
          </h2>
          <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
            Hardening the ecosystem and optimizing operational workflows. Synchronized via <span className="text-indigo-400 font-black italic">KERNEL-LEVEL</span> access.
          </p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {settingsGrid.map((section) => (
          <motion.div key={section.title} variants={item}>
            <GlassCard className="p-8 h-full border border-white/5 hover:border-indigo-500/30 transition-all group flex flex-col relative overflow-hidden">
              {/* Neural Background visualization */}
              <div className="absolute -right-8 -top-8 text-white/5 group-hover:text-indigo-500/10 group-hover:scale-150 transition-all duration-700 -rotate-12 pointer-events-none">
                <section.icon size={180} />
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-indigo-500/30 transition-all" />
              <div className="flex items-center gap-5 mb-8">
                <div className={`p-4 rounded-3xl bg-${section.color}-500/10 text-${section.color}-500 group-hover:scale-110 transition-transform`}>
                  <section.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">{section.title}</h3>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{section.items.length} Modules</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 flex-1">
                {section.desc}
              </p>

              <div className="space-y-2">
                {section.items.map((action) => (
                  <button key={action} className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.08] transition-all flex items-center justify-between group/action">
                    <span className="text-xs font-bold text-slate-300 group-hover/action:text-white">{action}</span>
                    <Zap size={14} className="text-slate-600 group-hover/action:text-indigo-400 transition-colors" />
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <motion.section variants={item}>
        <GlassCard className="p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 text-indigo-500/5 pointer-events-none">
            <Shield size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-4xl font-black text-white tracking-tighter">Mission Critical Override</h3>
              <p className="text-slate-400 font-medium max-w-xl">Resetting the ecosystem will purge all intelligence nodes and operational data. This action is irreversible.</p>
            </div>
            <button className="px-10 py-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-rose-600/20 active:scale-95 whitespace-nowrap">
              Purge All Data
            </button>
          </div>
        </GlassCard>
      </motion.section>
    </motion.div>
  );
};

export default Settings;
