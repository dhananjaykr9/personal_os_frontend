import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cpu, Activity, Zap, BrainCircuit } from 'lucide-react';
import { orin } from '../utils/orinVoice';
import { orinSound } from '../utils/orinMusic';

interface OrinSplashProps {
  onComplete: () => void;
}

const OrinSplash: React.FC<OrinSplashProps> = ({ onComplete }) => {
  const [loadingStep, setLoadingStep] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const steps = [
    { label: 'Initializing Orin Kernel', icon: Cpu },
    { label: 'Biometric Scan Sequence', icon: Activity },
    { label: 'Neural Link Synchronization', icon: BrainCircuit },
    { label: 'Shield Protocol Alpha-1', icon: Shield },
    { label: 'Cognitive Matrix Stabilization', icon: Zap },
  ];

  const handleInitialize = () => {
    setIsInitialized(true);
    orin.speak("Initializing Orin Protocol. Stand by.");
    //satisfies user interaction for audio
    orinSound.play().catch(() => {});
  };

  useEffect(() => {
    if (!isInitialized) return;

    const timer = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          orin.speak("Orin is online. Welcome back, Dhananjay. I am ready to assist.");
          setTimeout(onComplete, 1000);
          return prev;
        }

        const nextStep = prev + 1;
        if (nextStep === 1) orin.speak("Biometric scan in progress.");
        if (nextStep === 3) orin.speak("Shields engaged.");
        if (nextStep === 4) orin.speak("Cognitive matrix optimized.");

        return nextStep;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isInitialized, onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-800 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative mb-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-64 h-64 border-2 border-indigo-500/20 rounded-[35%] flex items-center justify-center p-8 relative"
        >
          <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-[35%] blur-sm animate-pulse" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full h-full bg-indigo-500/10 rounded-[30%] flex items-center justify-center backdrop-blur-3xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
          >
            <BrainCircuit size={60} className="text-indigo-400" />
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full max-w-sm space-y-6">
        {!isInitialized ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleInitialize}
            className="w-full group relative overflow-hidden p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all premium-shadow"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent group-hover:via-indigo-300 transition-all animate-pulse" />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                <Cpu size={32} />
              </div>
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Engage Orin Protocol</h2>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cognitive Interface Authorization</p>
              </div>
            </div>
          </motion.button>
        ) : (
          <>
            <div className="flex justify-between items-end mb-2">
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-white tracking-widest uppercase italic">Orin Intelligence</h1>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Auth Status: D_KHARKAR Verified</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-indigo-500 italic tracking-tighter">
                  {Math.round((loadingStep / (steps.length - 1)) * 100)}%
                </span>
              </div>
            </div>

            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(loadingStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="space-y-3 pt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingStep}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-4 py-3 px-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl"
                >
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                    {React.createElement(steps[loadingStep].icon, { size: 18 })}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                    {steps[loadingStep].label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2 text-slate-600 font-black uppercase tracking-widest text-[9px]">
        Orin Protocol Baseline V1.0.0
      </div>
    </div>
  );
};

export default OrinSplash;
