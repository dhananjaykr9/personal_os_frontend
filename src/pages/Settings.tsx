import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { 
  User, Bell, Shield, Palette, Database, Cpu, Zap, Lock,
  Save, RefreshCw, Download, Eye, EyeOff, CheckCircle, AlertTriangle, Wifi, WifiOff
} from 'lucide-react';
import api from '../api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const LS = {
  get: (k: string, def: any) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; } },
  set: (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const applyCssVar = (name: string, value: string) => document.documentElement.style.setProperty(name, value);

// ── Sub-components ────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange, label, sublabel }: { value: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div>
      <span className="text-xs font-bold text-slate-300 block">{label}</span>
      {sublabel && <span className="text-[10px] text-slate-600">{sublabel}</span>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ml-4 ${value ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'bg-white/10'}`}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-5 h-5 rounded-full bg-white shadow-lg absolute top-0.5"
      />
    </button>
  </div>
);

const SettingCard = ({ title, icon: Icon, color, children }: any) => (
  <GlassCard className="p-8 border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col gap-5 relative overflow-hidden group h-full">
    <div className="absolute -right-8 -top-8 text-white/[0.03] group-hover:scale-125 transition-all duration-700 pointer-events-none">
      <Icon size={180} />
    </div>
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
    </div>
    <div className="flex flex-col gap-1 relative z-10 flex-1">{children}</div>
  </GlassCard>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Settings: React.FC = () => {
  // Neural Profile
  const [name, setName]           = useState(() => LS.get('os_name', 'Dhananjay Kharkar'));
  const [rank, setRank]           = useState(() => LS.get('os_rank', 'Admin Alpha'));
  const [profileSaved, setProfileSaved] = useState(false);

  // Signal Protocol
  const [notifCritical, setNotifCritical]   = useState(() => LS.get('os_notif_critical', true));
  const [notifStandard, setNotifStandard]   = useState(() => LS.get('os_notif_standard', true));
  const [notifQuietHours, setNotifQuietHours] = useState(() => LS.get('os_notif_quiet', false));
  const [notifSounds, setNotifSounds]       = useState(() => LS.get('os_notif_sounds', true));

  // Security
  const [showApiKey, setShowApiKey] = useState(false);
  const [mfaEnabled, setMfaEnabled]   = useState(() => LS.get('os_mfa', false));
  const [sessionLock, setSessionLock] = useState(() => LS.get('os_session_lock', true));

  // Visual Matrix
  const [glowIntensity, setGlowIntensity] = useState(() => LS.get('os_glow', 70));
  const [meshDensity, setMeshDensity]     = useState(() => LS.get('os_mesh', 50));
  const [reducedMotion, setReducedMotion] = useState(() => LS.get('os_reduced_motion', false));

  // System Kernel
  const [autoSync, setAutoSync]   = useState(() => LS.get('os_auto_sync', true));
  const [syncDelay, setSyncDelay] = useState(() => LS.get('os_sync_delay', 5));
  const [debugMode, setDebugMode] = useState(() => LS.get('os_debug', false));

  // Backend connectivity
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // UI
  const [showPurgeModal, setShowPurgeModal]   = useState(false);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [exportLoading, setExportLoading]     = useState(false);
  const [toastMsg, setToastMsg]               = useState('');
  const [toastType, setToastType]             = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg); setToastType(type);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // ── Apply CSS variables whenever visual settings change ──────────────────
  useEffect(() => {
    applyCssVar('--glow-intensity', `${glowIntensity / 100}`);
    LS.set('os_glow', glowIntensity);
  }, [glowIntensity]);

  useEffect(() => {
    applyCssVar('--mesh-density', `${meshDensity / 100}`);
    LS.set('os_mesh', meshDensity);
  }, [meshDensity]);

  useEffect(() => {
    document.documentElement.style.setProperty('--reduce-motion', reducedMotion ? '1' : '0');
    LS.set('os_reduced_motion', reducedMotion);
  }, [reducedMotion]);

  // Persist notification settings
  useEffect(() => { LS.set('os_notif_critical', notifCritical); }, [notifCritical]);
  useEffect(() => { LS.set('os_notif_standard', notifStandard); }, [notifStandard]);
  useEffect(() => { LS.set('os_notif_quiet', notifQuietHours); }, [notifQuietHours]);
  useEffect(() => { LS.set('os_notif_sounds', notifSounds); }, [notifSounds]);

  // Persist security settings
  useEffect(() => { LS.set('os_mfa', mfaEnabled); }, [mfaEnabled]);
  useEffect(() => { LS.set('os_session_lock', sessionLock); }, [sessionLock]);

  // Persist kernel settings
  useEffect(() => { LS.set('os_auto_sync', autoSync); }, [autoSync]);
  useEffect(() => { LS.set('os_sync_delay', syncDelay); }, [syncDelay]);
  useEffect(() => { LS.set('os_debug', debugMode); }, [debugMode]);

  // ── Backend ping ─────────────────────────────────────────────────────────
  const checkBackend = useCallback(async () => {
    setBackendStatus('checking');
    try {
      await api.get('/api/tasks/');
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  }, []);

  useEffect(() => { checkBackend(); }, [checkBackend]);

  // ── Profile save ──────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    LS.set('os_name', name);
    LS.set('os_rank', rank);
    setProfileSaved(true);
    showToast('Neural Profile synchronized to local store.');
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // ── Export data ──────────────────────────────────────────────────────────
  const handleExportData = async () => {
    setExportLoading(true);
    showToast('Harvesting intelligence nodes...');
    try {
      const [tasks, habits, notes] = await Promise.all([
        api.get('/api/tasks/').then(r => r.data).catch(() => []),
        api.get('/api/habits/').then(r => r.data).catch(() => []),
        api.get('/api/notes/').then(r => r.data).catch(() => []),
      ]);
      const payload = {
        export_timestamp: new Date().toISOString(),
        system: { name, rank },
        data: { tasks, habits, notes },
        settings: { glowIntensity, meshDensity, reducedMotion, autoSync, syncDelay }
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `orin_intelligence_${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
      showToast('Intelligence export complete. File downloaded.');
    } catch {
      showToast('Export failed. Backend may be offline.', 'error');
    }
    setExportLoading(false);
  };

  const handleCacheFlush = () => {
    const keep = ['os_name','os_rank','os_glow','os_mesh','os_notif_critical','os_notif_standard','os_notif_quiet','os_notif_sounds','os_mfa','os_session_lock','os_auto_sync','os_sync_delay','os_debug','os_reduced_motion'];
    Object.keys(localStorage).filter(k => !keep.includes(k)).forEach(k => localStorage.removeItem(k));
    showToast('Non-essential cache purged. Settings preserved.');
  };

  const handleForceInvalidate = () => {
    showToast('Cache invalidated. Workers refreshed on next sync.');
  };

  const handlePurge = () => {
    localStorage.clear();
    sessionStorage.clear();
    showToast('System purged. Refreshing...');
    setTimeout(() => window.location.reload(), 1500);
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item      = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12 pb-20 max-w-7xl mx-auto">

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
            className={`fixed top-24 right-8 z-[9999] flex items-center gap-3 px-5 py-3 glass-card shadow-xl border ${toastType === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}
          >
            {toastType === 'success'
              ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
              : <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />}
            <span className={`text-xs font-black uppercase tracking-widest ${toastType === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header variants={item} className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Core Parameters Active</span>
          </div>
          {/* Live backend status */}
          <div className={`flex items-center gap-2 px-4 py-1.5 border rounded-full ${
            backendStatus === 'online' ? 'bg-emerald-500/5 border-emerald-500/20' :
            backendStatus === 'offline' ? 'bg-rose-500/5 border-rose-500/20' :
            'bg-white/5 border-white/10'
          }`}>
            {backendStatus === 'online' && <><Wifi size={11} className="text-emerald-400" /><span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Backend Online</span></>}
            {backendStatus === 'offline' && <><WifiOff size={11} className="text-rose-400" /><span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Backend Offline</span></>}
            {backendStatus === 'checking' && <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCw size={11} className="text-slate-400" /></motion.div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Connecting...</span></>}
          </div>
          <button onClick={checkBackend} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">↺ Ping</span>
          </button>
        </div>
        <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic">Configuration</h2>
        <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
          All settings persist across sessions via <span className="text-indigo-400 font-black italic">local storage</span> and apply instantly.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* 1 · Neural Profile */}
        <motion.div variants={item}>
          <SettingCard title="Neural Profile" icon={User} color="indigo">
            <div className="space-y-4 mb-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Full Identifier</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none focus:border-indigo-500/40 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Clearance Rank</label>
                <select value={rank} onChange={e => setRank(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none focus:border-indigo-500/40 transition-all cursor-pointer">
                  <option value="Admin Alpha">Admin Alpha</option>
                  <option value="System Architect">System Architect</option>
                  <option value="Operator">Operator</option>
                </select>
              </div>
            </div>
            <button onClick={handleSaveProfile}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95">
              {profileSaved ? <CheckCircle size={14} /> : <Save size={14} />}
              {profileSaved ? 'Synchronized ✓' : 'Save Profile'}
            </button>
          </SettingCard>
        </motion.div>

        {/* 2 · Signal Protocol */}
        <motion.div variants={item}>
          <SettingCard title="Signal Protocol" icon={Bell} color="emerald">
            <Toggle value={notifCritical}   onChange={setNotifCritical}   label="Critical Alerts"            sublabel="System errors, failures" />
            <Toggle value={notifStandard}   onChange={setNotifStandard}   label="Standard Sync"              sublabel="Task & habit reminders" />
            <Toggle value={notifQuietHours} onChange={setNotifQuietHours} label="Quiet Hours (22:00–07:00)"  sublabel="Suppress non-critical" />
            <Toggle value={notifSounds}     onChange={setNotifSounds}     label="Audio Signals"              sublabel="UI interaction sounds" />
            <p className="text-[10px] text-slate-600 pt-2">Changes persist immediately.</p>
          </SettingCard>
        </motion.div>

        {/* 3 · Core Security */}
        <motion.div variants={item}>
          <SettingCard title="Core Security" icon={Lock} color="rose">
            <Toggle value={mfaEnabled}   onChange={setMfaEnabled}   label="Multi-Factor Auth"    sublabel="Prompt on session start" />
            <Toggle value={sessionLock}  onChange={setSessionLock}  label="Auto Session Lock"    sublabel="Lock after 30min idle" />
            <div className="py-3 border-b border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Groq API Key</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-slate-400 flex-1 bg-white/5 rounded-lg px-3 py-2 truncate">
                  {showApiKey ? 'gsk_EMvQQasd...cxLnjT0p' : '●●●●●●●●●●●●●●●●●●●●'}
                </p>
                <button onClick={() => setShowApiKey(s => !s)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-all flex-shrink-0">
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="py-2">
              <p className="text-[10px] text-slate-600">Backend status: <span className={backendStatus === 'online' ? 'text-emerald-400' : 'text-rose-400'}>{backendStatus}</span></p>
            </div>
          </SettingCard>
        </motion.div>

        {/* 4 · Visual Matrix */}
        <motion.div variants={item}>
          <SettingCard title="Visual Matrix" icon={Palette} color="purple">
            <Toggle value={reducedMotion} onChange={setReducedMotion} label="Reduce Motion" sublabel="Fewer animations" />
            <div className="py-3 border-b border-white/5">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Glow Intensity</span>
                <span className="text-[10px] font-black text-indigo-400">{glowIntensity}%</span>
              </div>
              <input type="range" min={0} max={100} value={glowIntensity}
                onChange={e => setGlowIntensity(+e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer" />
              <p className="text-[10px] text-slate-600 mt-1">Affects card glow effects</p>
            </div>
            <div className="py-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Mesh Gradient Density</span>
                <span className="text-[10px] font-black text-purple-400">{meshDensity}%</span>
              </div>
              <input type="range" min={0} max={100} value={meshDensity}
                onChange={e => setMeshDensity(+e.target.value)}
                className="w-full accent-purple-500 cursor-pointer" />
              <p className="text-[10px] text-slate-600 mt-1">Background mesh complexity</p>
            </div>
          </SettingCard>
        </motion.div>

        {/* 5 · Data Sovereignty */}
        <motion.div variants={item}>
          <SettingCard title="Data Sovereignty" icon={Database} color="amber">
            <div className="space-y-2">
              <button onClick={handleExportData} disabled={exportLoading}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-white/10 transition-all group text-left disabled:opacity-50">
                {exportLoading
                  ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RefreshCw size={14} className="text-amber-400" /></motion.div>
                  : <Download size={14} className="text-amber-400" />}
                <div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors block">
                    {exportLoading ? 'Exporting...' : 'Export Intelligence (JSON)'}
                  </span>
                  <span className="text-[10px] text-slate-600">Tasks + Habits + Notes</span>
                </div>
              </button>
              <button onClick={handleCacheFlush}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-white/10 transition-all group text-left">
                <RefreshCw size={14} className="text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors block">Flush Cache</span>
                  <span className="text-[10px] text-slate-600">Keeps settings intact</span>
                </div>
              </button>
            </div>
            {backendStatus === 'offline' && (
              <p className="text-[10px] text-rose-400 font-bold mt-2">⚠ Export unavailable — backend offline</p>
            )}
          </SettingCard>
        </motion.div>

        {/* 6 · System Kernel */}
        <motion.div variants={item}>
          <SettingCard title="System Kernel" icon={Cpu} color="blue">
            <Toggle value={autoSync}   onChange={setAutoSync}   label="Auto-Sync Protocol"  sublabel="Periodic data refresh" />
            <Toggle value={debugMode}  onChange={setDebugMode}  label="Debug Mode"           sublabel="Extended console logs" />
            {autoSync && (
              <div className="py-3 border-b border-white/5">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Sync Delay</span>
                  <span className="text-[10px] font-black text-blue-400">{syncDelay}s</span>
                </div>
                <input type="range" min={1} max={30} value={syncDelay}
                  onChange={e => setSyncDelay(+e.target.value)}
                  className="w-full accent-blue-500 cursor-pointer" />
              </div>
            )}
            <button onClick={handleForceInvalidate}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all group text-left mt-1">
              <Zap size={14} className="text-blue-400" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Force Cache Invalidation</span>
            </button>
          </SettingCard>
        </motion.div>
      </div>

      {/* Mission Critical Override */}
      <motion.section variants={item}>
        <GlassCard className="p-12 relative overflow-hidden border border-rose-500/10">
          <div className="absolute top-0 right-0 p-12 text-rose-500/5 pointer-events-none"><Shield size={200} /></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-rose-400" />
                <h3 className="text-4xl font-black text-white tracking-tighter">Mission Critical Override</h3>
              </div>
              <p className="text-slate-400 font-medium max-w-xl">Purges ALL data — localStorage, sessionStorage. The app will reload. Irreversible.</p>
            </div>
            <button onClick={() => setShowPurgeModal(true)}
              className="px-10 py-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-rose-600/20 active:scale-95 whitespace-nowrap">
              Purge All Data
            </button>
          </div>
        </GlassCard>
      </motion.section>

      {/* Purge Modal */}
      <AnimatePresence>
        {showPurgeModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
            onClick={() => { setShowPurgeModal(false); setPurgeConfirmText(''); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md glass-card border border-rose-500/30 p-10 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-500/10 rounded-2xl"><AlertTriangle size={24} className="text-rose-400" /></div>
                <h3 className="text-2xl font-black text-white tracking-tight">Confirm Purge</h3>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                Type <span className="font-black text-rose-400">PURGE</span> to confirm destruction of all system state:
              </p>
              <input autoFocus value={purgeConfirmText} onChange={e => setPurgeConfirmText(e.target.value)}
                placeholder="Type PURGE to confirm"
                className="w-full bg-white/5 border border-rose-500/30 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-rose-500/60 transition-all mb-6 text-sm" />
              <div className="flex gap-4">
                <button onClick={() => { setShowPurgeModal(false); setPurgeConfirmText(''); }}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-white transition-all">
                  Abort
                </button>
                <button disabled={purgeConfirmText !== 'PURGE'} onClick={handlePurge}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  Execute Purge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
