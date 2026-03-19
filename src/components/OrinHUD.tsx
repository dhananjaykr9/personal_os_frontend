import React from 'react';
import { motion } from 'framer-motion';

const OrinHUD: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[500] pointer-events-none overflow-hidden select-none">
      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-24 h-24 border-t-2 border-l-2 border-indigo-500/30 rounded-tl-3xl shadow-[-5px_-5px_20px_rgba(99,102,241,0.1)]" />
      <div className="absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-indigo-500/30 rounded-tr-3xl shadow-[5px_-5px_20px_rgba(99,102,241,0.1)]" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-indigo-500/30 rounded-bl-3xl shadow-[-5px_5px_20px_rgba(99,102,241,0.1)]" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-b-2 border-r-2 border-indigo-500/30 rounded-br-3xl shadow-[5px_5px_20px_rgba(99,102,241,0.1)]" />

      {/* Scanning Line */}
      <motion.div
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent z-[501]"
      />

      {/* Side HUD Info */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 space-y-8 hidden md:block">
        <div className="space-y-1">
          <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.3em]">Orin.Core.Health</p>
          <div className="flex gap-0.5">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [4, 8, 4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-indigo-500/20 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-12 top-1/2 -translate-y-1/2 space-y-8 hidden md:block">
        <div className="space-y-1 text-right">
          <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.3em]">Cognitive.Freq</p>
          <p className="text-[10px] font-black text-indigo-500/30 italic">124.2 GHz</p>
        </div>
      </div>

      {/* Top Status Bar */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 group pointer-events-auto cursor-help">
        <div className="flex gap-0.5 items-end h-4 opacity-40 group-hover:opacity-100 transition-opacity">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [4, 12, 6, 16, 4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
              className="w-0.5 bg-indigo-500 rounded-full"
            />
          ))}
        </div>
        <span className="text-[7px] font-black text-indigo-500/40 uppercase tracking-[0.5em] group-hover:text-indigo-400/80 transition-colors">ORIN.ACTIVE.INTERFACE</span>
      </div>
    </div>
  );
};

export default OrinHUD;
