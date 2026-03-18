import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Cpu, Shield, Globe, HardDrive, Wifi, Radio } from 'lucide-react';

interface LogEntry {
  type: 'command' | 'response' | 'error' | 'system';
  content: string;
  timestamp: string;
}

const INITIAL_BOOT_LOGS: Omit<LogEntry, 'timestamp'>[] = [
  { type: 'system', content: '>>> DHANANJAY KERNEL [Version 4.12.0-STABLE]' },
  { type: 'system', content: '>>> INITIALIZING BIOMETRIC HANDSHAKE... SUCCESS' },
  { type: 'system', content: '>>> LOADING NEURAL INTERFACE PROTOCOLS... 100%' },
  { type: 'system', content: '>>> MOUNTING HUD DATA PACKETS... COMPLETED' },
  { type: 'system', content: '>>> DHANANJAY_OS V1.0.0 READY FOR COMMAND INPUT' },
];

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < INITIAL_BOOT_LOGS.length) {
        setLogs(prev => [
          ...prev, 
          { 
            ...INITIAL_BOOT_LOGS[currentLog], 
            timestamp: new Date().toLocaleTimeString() 
          } as LogEntry
        ]);
        currentLog++;
      } else {
        setIsBooting(false);
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Focus input when booting ends
  useEffect(() => {
    if (!isBooting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBooting]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const commandLog: LogEntry = { 
      type: 'command', 
      content: input, 
      timestamp: new Date().toLocaleTimeString() 
    };
    
    let response = '';
    let responseType: 'response' | 'error' = 'response';

    switch (cmd) {
      case 'ls':
        response = 'BIN\nCORE\nMODULES: [TASKS, LEARNING, HABITS, NOTES, ANALYTICS]\nSYSTEM_CONFIG\nMEM_CACHE';
        break;
      case 'whoami':
        response = 'USER: DHANANJAY KHARKAR\nROLE: SYSTEM ARCHITECT / DATA ENGINEER\nIDENTITY STATUS: VERIFIED';
        break;
      case 'clear':
        setLogs([]);
        setInput('');
        return;
      case 'system':
        response = `OS: Dhananjay's System v1.0.0\nKERNEL: Jarvis 4.12-LTS\nUPTIME: 4h 12m\nCPU: Intelligence Core i9 (Neural Optimized)\nMEMORY: 128.0 GiB HUD-VRAM`;
        break;
      case 'status':
        response = 'DHANANJAY HUD: [ONLINE]\nDATABASE: [CONNECTED]\nNEON_POSTGRES: [STABLE]\nVOICE_PROTOCOL: [ACTIVE]';
        break;
      case 'logs':
        response = 'fetching system intercepts...\n[AUTH] 23:14:02 - Access Granted to DHANANJAY\n[SYSM] 23:14:05 - Neural Map Updated\n[SYSM] 23:15:01 - Routine Backup Complete';
        break;
      case 'help':
        response = 'AVAILABLE COMMANDS:\n- ls: List system modules\n- whoami: Display user identity\n- system: Core hardware diagnostics\n- status: HUD integrity check\n- logs: Display intercept history\n- clear: Purge terminal buffer';
        break;
      default:
        response = `bash: command not found: ${cmd}. Type 'help' for instructions.`;
        responseType = 'error';
    }

    setLogs(prev => [
      ...prev, 
      commandLog, 
      { type: responseType, content: response, timestamp: new Date().toLocaleTimeString() }
    ]);
    setInput('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8 min-h-screen pb-20"
    >
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
            <TerminalIcon className="text-indigo-400" size={48} />
            Kernel Console
          </h2>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] mt-2 ml-1">Sub-System Diagnostic CLI</p>
        </div>
        
        <div className="flex gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
            <Cpu size={20} className="text-indigo-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPU Load: 12%</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
            <Shield size={20} className="text-emerald-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kernel: Secure</span>
          </div>
        </div>
      </div>

      <div className="h-[65vh] flex flex-col glass-card border border-white/10 relative overflow-hidden bg-slate-950/40 shadow-2xl rounded-3xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 shrink-0 relative z-20">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            root@dhananjay:~ shell
          </div>
          <div className="flex items-center gap-3">
            <Wifi size={14} className="text-indigo-400" />
            <Radio size={14} className="text-indigo-400 animate-pulse" />
          </div>
        </div>

        {/* Console Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 font-mono text-sm space-y-4 custom-scrollbar relative z-10"
        >
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 items-start border-l-2 border-transparent hover:border-indigo-500/30 pl-2 transition-all">
              <span className="text-slate-600 shrink-0 font-black text-[10px] mt-0.5">[{log.timestamp}]</span>
              {log.type === 'command' && <span className="text-indigo-400 font-bold">$ {log.content}</span>}
              {log.type === 'response' && <span className="text-slate-300 whitespace-pre-wrap leading-relaxed">{log.content}</span>}
              {log.type === 'error' && <span className="text-rose-400 font-bold italic">! {log.content}</span>}
              {log.type === 'system' && <span className="text-emerald-400 font-black italic opacity-80">{log.content}</span>}
            </div>
          ))}
          {isBooting && (
            <div className="flex items-center gap-3 text-emerald-400 animate-pulse font-bold italic">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              Initializing Intelligence Core...
            </div>
          )}
        </div>

        {/* Input Area */}
        {!isBooting && (
          <form onSubmit={handleCommand} className="p-6 bg-white/5 border-t border-white/10 flex items-center gap-4 shrink-0 relative z-20">
            <div className="text-emerald-400 font-black tracking-widest text-xs">root@dhananjay:~$</div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-slate-700 text-sm"
              placeholder="Enter system command (type 'help' for options)..."
            />
          </form>
        )}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { icon: HardDrive, label: 'Storage Integrity', value: '98.4%', color: 'text-indigo-400' },
          { icon: Globe, label: 'Net Protocols', value: 'STABLE', color: 'text-emerald-400' },
          { icon: Radio, label: 'Signal Gain', value: '-42dBm', color: 'text-rose-400' },
          { icon: Shield, label: 'Firewall Layer', value: 'ACTIVE', color: 'text-amber-400' },
        ].map((item, i) => (
          <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2 group hover:border-indigo-500/30 transition-all">
            <div className={`flex items-center gap-2 ${item.color} mb-1`}>
              <item.icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
            </div>
            <p className="text-2xl font-black text-white group-hover:scale-105 transition-transform origin-left">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Terminal;
