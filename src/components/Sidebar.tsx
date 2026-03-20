import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  RotateCcw, 
  FileText, 
  BarChart3, 
  Settings,
  Zap,
  Terminal as TerminalIcon,
  ChevronLeft,
  ChevronRight,
  Command,
  BrainCircuit,
  Cpu,
  AlertTriangle,
  Target,
  Headphones,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Soundscape from './Soundscape';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navGroups = [
  {
    title: 'Tactical Command',
    icon: Command,
    items: [
      { icon: LayoutDashboard, label: 'Home', path: '/' },
      { icon: Zap, label: 'Dashboard', path: '/dashboard' },
      { icon: CheckSquare, label: 'Objectives', path: '/tasks' },
      { icon: RotateCcw, label: 'Bio-Sync', path: '/habits' },
    ]
  },
  {
    title: 'Intelligence',
    icon: BrainCircuit,
    items: [
      { icon: Target, label: 'Roadmap', path: '/roadmap' },
      { icon: Headphones, label: 'Music Hub', path: '/music' },
      { icon: BookOpen, label: 'Learning', path: '/learning' },
      { icon: AlertTriangle, label: 'Mistake Registry', path: '/learning?tab=mistakes' },
      { icon: FileText, label: 'Neural Notes', path: '/notes' },
    ]
  },
  {
    title: 'Systems',
    icon: Cpu,
    items: [
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      { icon: Wallet, label: 'Finance Hub', path: '/finance' },
      { icon: TerminalIcon, label: 'Kernel Console', path: '/terminal', active: true },
    ]
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [hoveredPath, setHoveredPath] = React.useState<string | null>(null);

  const container = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <aside 
      className={cn(
        "h-screen glass-effect border-r border-white/5 fixed left-0 top-0 flex flex-col z-50 transition-all duration-500 ease-[0.23, 1, 0.32, 1] overflow-hidden",
        isCollapsed ? "w-24 p-4" : "w-72 p-6"
      )}
    >
      {/* Radar Sweep Animation */}
      <motion.div 
        animate={{ y: ['0%', '100%'], opacity: [0, 0.15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-indigo-500/50 blur-[2px] z-0 pointer-events-none"
      />
      {/* Brand & Toggle Header */}
      <div className={cn("mb-10 flex items-center", isCollapsed ? "justify-center" : "justify-between px-2")}>
        <motion.div 
          layout
          className="flex items-center gap-4"
        >
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-400/30 shrink-0">
            <Zap className="text-white fill-white/20" size={24} />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-2xl font-black text-white tracking-tighter italic leading-none">
                DHANANJAY
              </h1>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-1 whitespace-nowrap">Strategic HUD</span>
            </motion.div>
          )}
        </motion.div>

        {!isCollapsed && (
          <button 
            onClick={() => onToggle(true)}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button 
          onClick={() => onToggle(false)}
          className="mb-10 mx-auto p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white border border-white/10 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      )}
      
      <motion.nav 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2 mb-6"
      >
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            {!isCollapsed && (
              <div className="flex items-center gap-3 px-4 opacity-40">
                <group.icon size={12} className="text-indigo-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{group.title}</span>
              </div>
            )}
            
            <div className="space-y-1">
              {group.items.map((nav) => (
                <motion.div key={nav.path} variants={itemAnim}>
                  <NavLink
                    to={nav.path}
                    onMouseEnter={() => setHoveredPath(nav.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                      isCollapsed ? "justify-center p-3.5" : "px-5 py-3.5",
                      isActive 
                        ? "bg-indigo-500/20 text-white border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]" 
                        : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Tooltip for Collapsed Mode */}
                        <AnimatePresence>
                          {isCollapsed && hoveredPath === nav.path && (
                            <motion.div 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 20 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="absolute left-full ml-4 px-3 py-1.5 glass-effect border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest pointer-events-none whitespace-nowrap z-[100] shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                            >
                              {nav.label}
                              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#0F172A] border-l border-b border-white/10 rotate-45" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Hover Telemetry */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {!isCollapsed && (
                          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-indigo-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                        )}
                        
                        <div className="relative">
                          <nav.icon size={18} className={cn("transition-all duration-500 group-hover:scale-110 relative z-10", isActive && "text-indigo-400")} />
                          {nav.active && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          )}
                        </div>

                        {!isCollapsed && (
                          <div className="flex-1 flex flex-col min-w-0">
                            <span className="font-black text-[12px] uppercase tracking-widest relative z-10 truncate">{nav.label}</span>
                            <div className="h-[2px] w-full bg-white/5 rounded-full mt-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.div 
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="h-full w-1/3 bg-indigo-500/40"
                              />
                            </div>
                          </div>
                        )}
                        
                        <AnimatePresence>
                          {isActive && !isCollapsed && (
                            <motion.div 
                              layoutId="sidebar-active-line"
                              className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[2px_0_15px_rgba(99,102,241,0.6)]"
                              initial={{ opacity: 0, scaleY: 0 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              exit={{ opacity: 0, scaleY: 0 }}
                            />
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-auto space-y-4"
      >
        <div className={cn("transition-all duration-500", isCollapsed ? "opacity-0 invisible h-0" : "opacity-100 visible")}>
          <Soundscape />
        </div>

        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center gap-3 rounded-2xl transition-all duration-300 group",
            isCollapsed ? "p-3 justify-center" : "px-4 py-3",
            isActive ? "bg-white/5 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
          {!isCollapsed && <span className="font-medium text-[15px]">Settings</span>}
        </NavLink>
      </motion.div>
    </aside>
  );
};

export default Sidebar;
