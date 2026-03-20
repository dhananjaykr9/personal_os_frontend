import React, { useState, useEffect } from 'react';
import api from '../api';
import { format } from 'date-fns';
import { 
  Target, 
  Plus, 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Check,
  BookOpen,
  Map as MapIcon,
  TrendingUp,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';

interface LearningSyllabus {
  goal: string;
  sections: {
    title: string;
    items: (string | { text: string; completed: boolean })[];
  }[];
}

interface LearningTopic {
  id: string;
  topic: string;
  category: string;
  completion_percentage: number;
  hours_spent: number;
  status: string;
  syllabus?: LearningSyllabus;
  last_studied_at?: string;
  created_at: string;
}

interface RoadmapSkill {
  id: string;
  skill_name: string;
  category: string;
  difficulty: string;
  importance: 'low' | 'medium' | 'high';
  status: string;
  completion_date: string | null;
}

interface LearningLog {
  id: string;
  topic_name: string;
  hours_studied: number;
  what_learned: string;
  difficulty: string;
  log_date: string;
  created_at: string;
}

interface Mistake {
  id: string;
  topic: string;
  mistake_content: string;
  correct_understanding: string;
  importance: 'low' | 'medium' | 'high';
  date: string;
  created_at: string;
}

const Learning: React.FC = () => {
  const location = useLocation();
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapSkill[]>([]);
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [activeTab, setActiveTab] = useState<'topics' | 'roadmap' | 'logs' | 'mistakes'>('topics');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showMistakeModal, setShowMistakeModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null);

  const [newTopic, setNewTopic] = useState({
    topic: '',
    category: 'Technical',
    completion_percentage: 0,
    hours_spent: 0,
    status: 'not_started'
  });

  const [newLog, setNewLog] = useState({
    topic_name: '',
    hours_studied: 1,
    what_learned: '',
    difficulty: 'medium',
    log_date: format(new Date(), 'yyyy-MM-dd')
  });

  const [newMistake, setNewMistake] = useState({
    topic: '',
    mistake_content: '',
    correct_understanding: '',
    importance: 'medium',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    category: 'Technical',
    difficulty: 'basic',
    importance: 'medium' as 'low' | 'medium' | 'high'
  });

  const [deleteConfig, setDeleteConfig] = useState<{
    id: string;
    type: 'topic' | 'log' | 'skill' | 'mistake';
    message: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const CircularProgress: React.FC<{ percentage: number; size?: number; color?: string }> = ({ percentage, size = 60, color = "#6366f1" }) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="currentColor" strokeWidth={strokeWidth}
            fill="transparent" className="text-white/5"
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[10px] font-black text-white">{percentage}%</span>
      </div>
    );
  };

  const toggleSyllabusItem = async (sectionIdx: number, itemIdx: number) => {
    if (!selectedTopic || !selectedTopic.syllabus) return;

    const newSyllabus = JSON.parse(JSON.stringify(selectedTopic.syllabus));
    const section = newSyllabus.sections[sectionIdx];
    const currentItem = section.items[itemIdx];

    const newItem = typeof currentItem === 'string' 
      ? { text: currentItem, completed: true }
      : { ...currentItem, completed: !currentItem.completed };

    section.items[itemIdx] = newItem;

    let totalItems = 0;
    let completedItems = 0;
    newSyllabus.sections.forEach((s: any) => {
      s.items.forEach((item: any) => {
        totalItems++;
        if (typeof item !== 'string' && item.completed) completedItems++;
      });
    });

    const newPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    try {
      const response = await api.patch(`/api/learning/${selectedTopic.id}/progress`, {
        syllabus: newSyllabus,
        completion_percentage: newPercentage,
        status: newPercentage === 100 ? 'completed' : newPercentage > 0 ? 'in_progress' : 'not_started'
      });

      setSelectedTopic(response.data);
      setTopics(topics.map(t => t.id === selectedTopic.id ? response.data : t));
    } catch (error) {
      console.error("Failed to update syllabus progress:", error);
    }
  };

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const fetchData = async () => {
    try {
      const [topicsRes, roadmapRes, logsRes, mistakesRes] = await Promise.all([
        api.get('/api/learning/'),
        api.get('/api/roadmap/'),
        api.get('/api/learning-logs/'),
        api.get('/api/mistakes/')
      ]);
      setTopics(topicsRes.data);
      setRoadmap(roadmapRes.data);
      setLogs(logsRes.data);
      setMistakes(mistakesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['topics', 'roadmap', 'logs', 'mistakes'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [location]);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/learning-logs/', newLog);
      setShowLogModal(false);
      setNewLog({
        topic_name: '',
        hours_studied: 1,
        what_learned: '',
        difficulty: 'medium',
        log_date: format(new Date(), 'yyyy-MM-dd')
      });
      fetchData();
    } catch (error) {
      console.error('Error creating log:', error);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/learning/', newTopic);
      setShowTopicModal(false);
      setNewTopic({
        topic: '',
        category: 'Technical',
        completion_percentage: 0,
        hours_spent: 0,
        status: 'not_started'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const handleCreateMistake = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Remove date if empty or invalid
      const payload = { ...newMistake } as any;
      if (!payload.date) {
        delete payload.date;
      }
      await api.post('/api/mistakes/', payload);
      setShowMistakeModal(false);
      setNewMistake({
        topic: '',
        mistake_content: '',
        correct_understanding: '',
        importance: 'medium',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      fetchData();
    } catch (error) {
      console.error('Error creating mistake:', error);
    }
  };
  

  const executeDelete = async () => {
    if (!deleteConfig) return;
    try {
      const { id, type } = deleteConfig;
      if (type === 'mistake') await api.delete(`/api/mistakes/${id}`);
      else if (type === 'log') await api.delete(`/api/learning-logs/${id}`);
      else if (type === 'topic') await api.delete(`/api/learning/${id}`);
      else if (type === 'skill') await api.delete(`/api/roadmap/${id}`);
      
      setShowDeleteModal(false);
      setDeleteConfig(null);
      fetchData();
    } catch (error) {
      console.error('Error during deletion protocol:', error);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/roadmap/', { ...newSkill, status: 'not_started' });
      setShowRoadmapModal(false);
      setNewSkill({
        skill_name: '',
        category: 'Technical',
        difficulty: 'basic',
        importance: 'medium'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating skill:', error);
    }
  };

  const toggleSkillStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
      await api.patch(`/api/roadmap/${id}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating skill status:', error);
    }
  };

  const deleteTask = (id: string, type: 'topic' | 'log' | 'skill' | 'mistake') => {
    let message = "";
    if (type === 'skill') message = "Acknowledge: This tactical skill objective will be removed from your roadmap?";
    else if (type === 'topic') message = "Acknowledge: This entire knowledge node and its syllabus progress will be purged?";
    else if (type === 'log') message = "Acknowledge: This session record will be permanently purged from the neural archive?";
    else if (type === 'mistake') message = "Purge this operational flaw from the registry?";
    
    setDeleteConfig({ id, type, message });
    setShowDeleteModal(true);
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 neural-grid opacity-20 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 z-[-1]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-12 pb-20"
      >
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <motion.div variants={itemVariants}>
              <h1 className="text-6xl font-black text-white tracking-tighter italic flex items-center gap-4">
                <Brain className="text-indigo-500 animate-pulse-slow" size={48} />
                NEURAL <span className="text-indigo-500">HUB</span>
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs mt-2 pl-1">Operational Strategic Intelligence Module</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="glass-card-premium p-4 rounded-2xl flex items-center gap-4 border border-indigo-500/20">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Mastery</span>
                  <span className="text-2xl font-black text-white italic">
                    {topics.length > 0 
                      ? Math.round(topics.reduce((acc, t) => acc + t.completion_percentage, 0) / topics.length) 
                      : 0}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Intelligence Engine Active</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full w-fit">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Registry Status: Synchronized</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3">
              <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic">
                Knowledge Engine
              </h2>
              <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
                Architecting evolution through structured mastery. All neural pathways verified for <span className="text-indigo-400 font-black italic">OPTIMAL-LEARNING</span>.
              </p>
            </div>
            <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-2xl premium-shadow">
              <button
                onClick={() => setActiveTab('topics')}
                className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px] ${activeTab === 'topics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:text-white'}`}
              >
                <BookOpen size={14} />
                Focus Areas
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px] ${activeTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:text-white'}`}
              >
                <MapIcon size={14} />
                Evolution Map
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px] ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:text-white'}`}
              >
                <Clock size={14} />
                Intelligence Logs
              </button>
              <button
                onClick={() => setActiveTab('mistakes')}
                className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px] ${activeTab === 'mistakes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:text-white'}`}
              >
                <Brain size={14} />
                Mistake Analysis
              </button>
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {activeTab === 'topics' ? (
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {topics.map((topic) => (
                <motion.div
                  key={topic.id}
                  variants={itemVariants}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setShowSyllabusModal(true);
                  }}
                  className={clsx(
                    "group relative overflow-hidden rounded-[2.5rem] p-8 transition-all cursor-pointer border border-white/5 h-full flex flex-col justify-between",
                    topic.completion_percentage === 100 ? "mastered-glow bg-emerald-500/5 hover:bg-emerald-500/10" : "neuro-glow bg-white/5 hover:bg-white/[0.08]"
                  )}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-3">
                        <div className="p-4 rounded-2xl bg-white/5 text-indigo-400 group-hover:scale-110 transition-transform">
                          <Brain size={24} />
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(topic.id, 'topic');
                          }}
                          className="p-4 rounded-2xl bg-white/5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <CircularProgress percentage={topic.completion_percentage} color={topic.completion_percentage === 100 ? "#10b981" : "#6366f1"} />
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">{topic.category}</span>
                        <h4 className="text-2xl font-black text-white italic group-hover:text-indigo-400 transition-colors uppercase leading-tight">{topic.topic}</h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-8">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">{topic.hours_spent}h Spent</span>
                      </div>
                      <div className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        topic.completion_percentage === 100 ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
                      )}>
                        {topic.completion_percentage === 100 ? "Neuralized" : "Syncing"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400 group-hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                      Access Node <ChevronRight size={14} />
                    </div>
                  </div>
                  <div className="scanner-light" />
                </motion.div>
              ))}

              <motion.div 
                variants={itemVariants}
                onClick={() => setShowTopicModal(true)}
                className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-[2.5rem] opacity-60 hover:opacity-100 transition-all cursor-pointer group hover:bg-white/5 h-full min-h-[260px] premium-shadow"
              >
                <div className="p-6 rounded-3xl bg-white/5 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white transition-all shadow-xl group-hover:shadow-indigo-600/40 border border-white/5 group-hover:border-indigo-400/30">
                  <Plus size={36} />
                </div>
                <p className="mt-8 font-bold text-slate-400 group-hover:text-white transition-colors text-lg uppercase tracking-widest">Initialize Skill Protocol</p>
              </motion.div>
            </motion.div>
          ) : activeTab === 'roadmap' ? (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Intelligence Strata</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed max-w-lg">Neural mapping of the cognitive evolution path. Each node represents a strategic milestone in the mastery of the tactical landscape.</p>
                </div>
                <button
                  onClick={() => setShowRoadmapModal(true)}
                  className="group relative flex items-center gap-3 px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.2)] font-black uppercase tracking-widest text-[9px] active:scale-95"
                >
                  <Plus size={16} />
                  Initialize Evolution Node
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {['Basic', 'Intermediate', 'Advanced'].map((level, levelIdx) => (
                  <div key={level} className="space-y-8">
                    <div className="flex items-center justify-between px-6 py-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4">
                        <span className={`w-2.5 h-2.5 rounded-full ${level === 'Basic' ? 'bg-indigo-500' : level === 'Intermediate' ? 'bg-amber-500' : 'bg-rose-500'} shadow-[0_0_12px_rgba(99,102,241,0.5)]`} />
                        {level} Tier
                      </h4>
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{roadmap.filter(s => s.difficulty === level.toLowerCase()).length} Nodes</span>
                    </div>

                    <div className="space-y-5">
                      {roadmap.filter(skill => skill.difficulty === level.toLowerCase()).map((skill, i) => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: levelIdx * 0.15 + i * 0.08 }}
                          className="group"
                        >
                          <div className={clsx(
                            "relative border border-white/5 bg-white/5 rounded-3xl p-6 transition-all luxury-glow premium-shadow overflow-hidden",
                            skill.status === 'completed' ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.05)]" : "hover:border-indigo-500/40 hover:bg-white/10"
                          )}>
                            <div className="scanner-light" />
                            <div className="relative z-10 space-y-5">
                              <div className="flex justify-between items-start">
                                <div className={clsx(
                                  "p-3 rounded-2xl transition-all duration-500 border",
                                  skill.status === 'completed' ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/40' : 'bg-white/5 border-white/5 text-slate-600 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
                                )}>
                                  {skill.status === 'completed' ? <CheckCircle2 size={24} /> : <Brain size={24} />}
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => deleteTask(skill.id, 'skill')}
                                    className="p-3 bg-white/5 rounded-xl text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5 opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <h4 className="text-xl font-black text-white italic group-hover:text-indigo-400 transition-colors uppercase leading-none">{skill.skill_name}</h4>
                                <div className="flex items-center gap-3">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{skill.category}</span>
                                  <span className={clsx(
                                    "w-1 h-1 rounded-full",
                                    skill.importance === 'high' ? 'bg-rose-500' : skill.importance === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                  )} />
                                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">{skill.importance} impact</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <button 
                                  onClick={() => toggleSkillStatus(skill.id, skill.status)}
                                  className={clsx(
                                    "w-full py-3 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] transition-all",
                                    skill.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20" : "bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-400"
                                  )}
                                >
                                  {skill.status === 'completed' ? 'Operationalized' : 'Authorize Sync'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === 'logs' ? (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center text-white">
                <h3 className="text-xl font-bold uppercase tracking-widest">Intelligence Sessions</h3>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-indigo-600/20"
                >
                  <Plus size={16} /> New Record
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {logs.map((log) => (
                  <div key={log.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl premium-shadow glass-glow">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white tracking-tight">{log.topic_name}</h4>
                            <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">
                              <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-400" />{log.hours_studied} Hours</span>
                              <span className="w-1 h-1 rounded-full bg-slate-800" />
                              <span>{log.log_date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-3xl pl-16">{log.what_learned}</p>
                      </div>
                      <div className={clsx(
                        "flex flex-col items-end gap-3"
                      )}>
                        <div className={clsx(
                          "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                          log.difficulty === 'hard' ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' :
                          log.difficulty === 'medium' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                          'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                        )}>
                          {log.difficulty} Intensity
                        </div>
                        <button 
                          onClick={() => deleteTask(log.id, 'log')}
                          className="p-2.5 rounded-xl bg-white/5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mistakes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center text-white">
                <h3 className="text-xl font-bold uppercase tracking-widest">Mistake Analysis</h3>
                <button
                  onClick={() => setShowMistakeModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-rose-600/20"
                >
                  <Plus size={16} /> Record Flaw
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {mistakes.map((mistake) => (
                  <div key={mistake.id} className="p-8 bg-white/5 border border-rose-500/10 rounded-[2.5rem] premium-shadow hover:border-rose-500/30 transition-all group relative overflow-hidden">
                    <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] text-rose-400 font-black uppercase tracking-[0.2em]">{mistake.topic}</span>
                          <h4 className="text-xl font-bold text-white leading-tight pr-10">{mistake.mistake_content}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(mistake.id, 'mistake');
                            }}
                            className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle size={20} />
                          </div>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400"><CheckCircle2 size={12} />Correct Understanding</div>
                        <p className="text-sm text-slate-300 leading-relaxed italic">"{mistake.correct_understanding}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* SYLLABUS MODAL */}
      <AnimatePresence>
        {showSyllabusModal && selectedTopic && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-6xl max-h-[85vh] overflow-hidden bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl flex flex-col">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">{selectedTopic.category}</span>
                  <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">{selectedTopic.topic}</h3>
                </div>
                <button onClick={() => setShowSyllabusModal(false)} className="p-4 rounded-full bg-white/5 text-slate-500 hover:text-white transition-all border border-white/10">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 luxury-scroll">
                <AnimatePresence mode="popLayout">
                  {selectedTopic.syllabus ? (
                    <motion.div 
                      key="syllabus-content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-12"
                    >
                      <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Brain size={120} /></div>
                        <h5 className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest"><Target size={14} />Neural Protocol Objective</h5>
                        <p className="text-2xl text-slate-200 font-bold italic leading-relaxed relative z-10">"{selectedTopic.syllabus.goal}"</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {selectedTopic.syllabus.sections && selectedTopic.syllabus.sections.length > 0 ? (
                          selectedTopic.syllabus.sections.map((section, idx) => (
                            <motion.div 
                              key={idx} 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className="space-y-6 p-8 rounded-[2.5rem] bg-slate-800/20 border border-white/5 hover:bg-white/[0.08] transition-all group"
                            >
                              <h6 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors flex items-center gap-4">
                                <span className="text-indigo-500/20 text-4xl font-black italic">0{idx + 1}</span>{section.title}
                              </h6>
                              <ul className="space-y-4">
                                {section.items.map((bullet, bIdx) => {
                                  const isCompleted = typeof bullet !== 'string' && bullet.completed;
                                  const text = typeof bullet === 'string' ? bullet : bullet.text;
                                  return (
                                    <li key={bIdx} onClick={() => toggleSyllabusItem(idx, bIdx)} className={clsx("flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border", isCompleted ? "bg-indigo-500/10 border-indigo-500/30" : "hover:bg-white/5 border-transparent")}>
                                      <div className={clsx("w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all shadow-inner", isCompleted ? "bg-indigo-500 border-indigo-500 text-white" : "border-white/20 text-transparent")}>
                                        <Check size={14} strokeWidth={4} />
                                      </div>
                                      <span className={clsx("text-sm font-medium transition-all leading-relaxed", isCompleted ? "text-indigo-200 line-through opacity-50" : "text-slate-300")}>{text}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </motion.div>
                          ))
                        ) : (
                          <div className="lg:col-span-2 p-12 rounded-[2.5rem] bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 gap-4">
                            <Plus size={48} className="opacity-20 rotate-45" />
                            <p className="font-bold uppercase tracking-widest text-xs">No protocol sections detected</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div key="no-syllabus" className="h-full flex flex-col items-center justify-center text-slate-600 gap-6 py-20">
                      <AlertTriangle size={64} className="text-indigo-500/40 animate-pulse" />
                      <div className="text-center space-y-2">
                        <p className="font-bold uppercase tracking-[0.3em] text-sm text-indigo-400">Node Sync Failed</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Neural breakdown not available for this objective</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-8 bg-white/5 border-t border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ready for Synchronization
                </div>
                <button 
                  onClick={() => setShowSyllabusModal(false)} 
                  className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all"
                >
                  Close Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOG MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-slate-900 p-12 border border-white/10 rounded-[3rem] shadow-2xl">
            <h3 className="text-3xl font-black text-white mb-8 italic">RECORD SESSION</h3>
            <form onSubmit={handleCreateLog} className="space-y-6">
              <input required placeholder="Topic Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold" value={newLog.topic_name} onChange={e => setNewLog({ ...newLog, topic_name: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required placeholder="Hours" className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold" value={newLog.hours_studied} onChange={e => setNewLog({ ...newLog, hours_studied: parseFloat(e.target.value) })} />
                <select className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold" value={newLog.difficulty} onChange={e => setNewLog({ ...newLog, difficulty: e.target.value })}>
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
              </div>
              <textarea required placeholder="What was learned?" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white min-h-[120px] font-bold" value={newLog.what_learned} onChange={e => setNewLog({ ...newLog, what_learned: e.target.value })} />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-500 font-black uppercase text-xs">Abort</button>
                <button type="submit" className="flex-1 p-5 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs shadow-xl shadow-indigo-600/30">Sync Record</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* TOPIC MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-slate-900 p-12 border border-white/10 rounded-[3rem] shadow-2xl">
            <h3 className="text-3xl font-black text-white mb-8 italic uppercase">Forge New Node</h3>
            <form onSubmit={handleCreateTopic} className="space-y-6">
              <input required placeholder="Topic Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold" value={newTopic.topic} onChange={e => setNewTopic({ ...newTopic, topic: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Category" className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold" value={newTopic.category} onChange={e => setNewTopic({ ...newTopic, category: e.target.value })} />
                <select className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold" value={newTopic.status} onChange={e => setNewTopic({ ...newTopic, status: e.target.value })}>
                  <option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="completed">Synchronized</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowTopicModal(false)} className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-500 font-black uppercase text-xs">Abort</button>
                <button type="submit" className="flex-1 p-5 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs shadow-xl shadow-emerald-600/30">Initialize Node</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MISTAKE MODAL */}
      {showMistakeModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-slate-900 p-12 border border-white/10 rounded-[3rem] shadow-2xl border-rose-500/20">
            <h3 className="text-3xl font-black text-white mb-8 italic uppercase text-rose-500">Record Operational Flaw</h3>
            <form onSubmit={handleCreateMistake} className="space-y-6">
              <input required placeholder="Context/Topic" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold" value={newMistake.topic} onChange={e => setNewMistake({ ...newMistake, topic: e.target.value })} />
              <textarea required placeholder="The Mistake" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white min-h-[100px] font-bold" value={newMistake.mistake_content} onChange={e => setNewMistake({ ...newMistake, mistake_content: e.target.value })} />
              <textarea required placeholder="Correct Pathway" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white min-h-[100px] font-bold" value={newMistake.correct_understanding} onChange={e => setNewMistake({ ...newMistake, correct_understanding: e.target.value })} />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowMistakeModal(false)} className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-500 font-black uppercase text-xs">Abort</button>
                <button type="submit" className="flex-1 p-5 rounded-2xl bg-rose-600 text-white font-black uppercase text-xs shadow-xl shadow-rose-600/30">Record Flaw</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* ROADMAP MODAL */}
      <AnimatePresence>
        {showRoadmapModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-slate-900 p-12 border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="scanner-light" />
              <h3 className="text-3xl font-black text-white mb-8 italic uppercase tracking-tighter">Initialize Evolution Node</h3>
              <form onSubmit={handleCreateSkill} className="space-y-6 relative z-10">
                <input required placeholder="Skill/Objective Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold focus:border-indigo-500/50 outline-none transition-all" value={newSkill.skill_name} onChange={e => setNewSkill({ ...newSkill, skill_name: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Intelligence Stratum</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold cursor-pointer" value={newSkill.difficulty} onChange={e => setNewSkill({ ...newSkill, difficulty: e.target.value })}>
                      <option value="basic">Basic Tier</option>
                      <option value="intermediate">Intermediate Tier</option>
                      <option value="advanced">Advanced Tier</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Strategic Impact</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold cursor-pointer" value={newSkill.importance} onChange={e => setNewSkill({ ...newSkill, importance: e.target.value as any })}>
                      <option value="low">Low Impact</option>
                      <option value="medium">Medium Impact</option>
                      <option value="high">High Impact</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Operational Category</label>
                  <input required placeholder="e.g. Technical, Tactical, Logic" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold focus:border-indigo-500/50 outline-none transition-all" value={newSkill.category} onChange={e => setNewSkill({ ...newSkill, category: e.target.value })} />
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setShowRoadmapModal(false)} className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-500 font-black uppercase text-xs hover:bg-white/10 transition-all border border-white/5">Abort</button>
                  <button type="submit" className="flex-1 p-5 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all">Authorize Node</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && deleteConfig && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-[3rem] p-10 shadow-[0_0_50px_rgba(225,29,72,0.2)]"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-6 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_20px_rgba(225,29,72,0.1)]">
                  <Trash2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Protocol: Data Purge</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  {deleteConfig.message}
                </p>
                <div className="flex gap-4 w-full pt-4">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-500 font-black uppercase text-xs hover:bg-white/10 transition-all border border-white/5"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={executeDelete}
                    className="flex-1 p-5 rounded-2xl bg-rose-600 text-white font-black uppercase text-xs shadow-xl shadow-rose-600/30 hover:bg-rose-500 transition-all"
                  >
                    Purge Node
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Learning;
