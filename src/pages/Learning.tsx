import React, { useState, useEffect } from 'react';
import api from '../api';
import { format } from 'date-fns';
import GlassCard from '../components/GlassCard';
import { Plus, Clock, Target, CheckCircle2, BookOpen, Map as MapIcon, ArrowUpRight, AlertTriangle, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LearningTopic {
  id: string;
  topic: string;
  category: string;
  completion_percentage: number;
  hours_spent: number;
  status: string;
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

import { useLocation } from 'react-router-dom';

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
      await api.post('/api/mistakes/', newMistake);
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      <motion.div variants={item} className="space-y-6">
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
      </motion.div>

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
                variants={item}
                whileHover={{ y: -5 }}
              >
                <GlassCard className="relative overflow-hidden group glass-glow p-8 premium-shadow h-full border border-white/5 hover:border-indigo-500/30 transition-all">
                  {/* Neural Background visualization */}
                  <div className="absolute -right-8 -top-8 text-white/5 group-hover:text-indigo-500/10 group-hover:scale-150 transition-all duration-700 -rotate-12 pointer-events-none">
                    <BookOpen size={180} />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-indigo-500/30 transition-all" />
                  <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] mb-2 block">{topic.category}</span>
                        <h4 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {topic.topic}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 text-slate-300 px-4 py-2 rounded-xl border border-white/10 text-sm font-bold shadow-inner">
                        <Clock size={14} className="text-indigo-400" />
                        <span>{topic.hours_spent}h Spent</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px]">Mastery Efficiency</span>
                        <span className="text-white bg-indigo-500/10 px-3 py-1 rounded-lg">{topic.completion_percentage}%</span>
                      </div>
                      <div className="h-4 bg-white/5 rounded-full overflow-hidden p-[3px] border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.completion_percentage}%` }}
                          transition={{ duration: 1.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-purple-500 rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse opacity-10" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className={`text-[10px] uppercase font-bold px-4 py-2 rounded-xl border tracking-widest ${topic.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                        {topic.status.replace('_', ' ')}
                      </span>
                      <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-indigo-500 transition-all border border-white/5">
                        <ArrowUpRight size={20} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            <motion.div variants={item}>
              <GlassCard
                onClick={() => setShowTopicModal(true)}
                className="flex flex-col items-center justify-center p-12 border-dashed border-white/10 opacity-60 hover:opacity-100 transition-all cursor-pointer group hover:bg-white/5 h-full min-h-[260px] premium-shadow"
                animate={false}
              >
                <div className="p-6 rounded-3xl bg-white/5 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white transition-all shadow-xl group-hover:shadow-indigo-600/40 border border-white/5 group-hover:border-indigo-400/30">
                  <Plus size={36} />
                </div>
                <p className="mt-8 font-bold text-slate-400 group-hover:text-white transition-colors text-lg">Initialize Skill Protocol</p>
              </GlassCard>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {['Basic', 'Intermediate', 'Advanced'].map((level, levelIdx) => (
                <div key={level} className="space-y-8">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-4 flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,1)]" />
                    {level} Tier
                  </h3>
                  <div className="space-y-5">
                    {roadmap.filter(skill => skill.difficulty === level.toLowerCase()).map((skill, i) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: levelIdx * 0.15 + i * 0.08 }}
                        whileHover={{ x: 5 }}
                      >
                        <GlassCard className="group border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer glass-glow premium-shadow p-5">
                          <div className="flex items-center gap-5">
                            <div className={`p-3.5 rounded-2xl shadow-xl transition-all duration-500 ${skill.status === 'completed'
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : 'bg-white/5 text-slate-600 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
                              }`}>
                              {skill.status === 'completed' ? <CheckCircle2 size={22} /> : <Target size={22} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{skill.skill_name}</h4>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${skill.importance === 'high' ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' :
                                    skill.importance === 'medium' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                                      'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                                  }`}>
                                  {skill.importance}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 uppercase tracking-[0.1em] mt-1.5 font-bold group-hover:text-slate-400 transition-colors">{skill.category}</p>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                    {roadmap.filter(skill => skill.difficulty === level.toLowerCase()).length === 0 && (
                      <div className="p-8 rounded-3xl border border-dashed border-white/5 flex items-center justify-center">
                        <p className="text-xs text-slate-600 italic">No objectives defined</p>
                      </div>
                    )}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Latest Intelligence Sessions</h3>
              <button
                onClick={() => setShowLogModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-indigo-600/20"
              >
                <Plus size={16} />
                New Log
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {logs.map((log) => (
                <GlassCard key={log.id} className="p-6 premium-shadow glass-glow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white tracking-tight">{log.topic_name}</h4>
                          <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} className="text-indigo-400" />
                              {log.hours_studied} Hours
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-800" />
                            <span>{log.log_date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-3xl pl-16">
                        {log.what_learned}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${log.difficulty === 'hard' ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' :
                        log.difficulty === 'medium' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                          'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                      }`}>
                      {log.difficulty} Intensity
                    </div>
                  </div>
                </GlassCard>
              ))}
              {logs.length === 0 && (
                <div className="h-60 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-600 gap-4">
                  <Clock size={40} className="opacity-20" />
                  <p className="font-bold uppercase tracking-[0.3em] text-[10px]">No intelligence logs recorded</p>
                </div>
              )}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Mistake Analysis Registry</h3>
              <button
                onClick={() => setShowMistakeModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-rose-600/20"
              >
                <Plus size={16} />
                Record Mistake
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mistakes.map((mistake) => (
                <GlassCard key={mistake.id} className="p-8 premium-shadow border-rose-500/10 hover:border-rose-500/30 transition-all group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-rose-500/10 transition-all" />
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] text-rose-400 font-black uppercase tracking-[0.2em]">{mistake.topic}</span>
                        <h4 className="text-xl font-bold text-white leading-tight pr-10">{mistake.mistake_content}</h4>
                      </div>
                      <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle size={20} />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        <CheckCircle2 size={12} />
                        Correct Understanding
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{mistake.correct_understanding}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <span>{mistake.date}</span>
                      <span className={`px-2 py-1 rounded-md border ${mistake.importance === 'high' ? 'text-rose-400 border-rose-400/20' : 'text-slate-500 border-white/5'
                        }`}>
                        {mistake.importance} Priority
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
              {mistakes.length === 0 && (
                <div className="md:col-span-2 h-60 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-600 gap-4">
                  <Brain size={40} className="opacity-20" />
                  <p className="font-bold uppercase tracking-[0.3em] text-[10px]">Registry is empty. Flawless execution.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg glass-card p-12 border border-white/10 premium-shadow">
            <h3 className="text-3xl font-black text-white mb-8">Record Intelligence Session</h3>
            <form onSubmit={handleCreateLog} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="log-topic" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topic</label>
                <input id="log-topic" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={newLog.topic_name} onChange={e => setNewLog({ ...newLog, topic_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="log-hours" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hours</label>
                  <input id="log-hours" type="number" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={newLog.hours_studied} onChange={e => setNewLog({ ...newLog, hours_studied: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="log-intensity" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intensity</label>
                  <select id="log-intensity" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={newLog.difficulty} onChange={e => setNewLog({ ...newLog, difficulty: e.target.value })}>
                    <option value="easy" className="bg-slate-900">Easy</option>
                    <option value="medium" className="bg-slate-900">Medium</option>
                    <option value="hard" className="bg-slate-900">Hard</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="log-findings" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Findings</label>
                <textarea id="log-findings" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white min-h-[100px]" value={newLog.what_learned} onChange={e => setNewLog({ ...newLog, what_learned: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 p-4 rounded-2xl bg-white/5 text-slate-400 font-bold uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 p-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs shadow-lg shadow-indigo-600/20">Submit Record</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Mistake Modal */}
      {showMistakeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg glass-card p-12 border border-white/10 premium-shadow">
            <h3 className="text-3xl font-black text-white mb-8 text-rose-500">Register Operational Flaw</h3>
            <form onSubmit={handleCreateMistake} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="mistake-topic" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Context/Topic</label>
                <input id="mistake-topic" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={newMistake.topic} onChange={e => setNewMistake({ ...newMistake, topic: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label htmlFor="mistake-content" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">The Error</label>
                <textarea id="mistake-content" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white min-h-[80px]" value={newMistake.mistake_content} onChange={e => setNewMistake({ ...newMistake, mistake_content: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label htmlFor="mistake-correction" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correction Pathway</label>
                <textarea id="mistake-correction" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white min-h-[80px]" value={newMistake.correct_understanding} onChange={e => setNewMistake({ ...newMistake, correct_understanding: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowMistakeModal(false)} className="flex-1 p-4 rounded-2xl bg-white/5 text-slate-400 font-bold uppercase text-xs">Abort</button>
                <button type="submit" className="flex-1 p-4 rounded-2xl bg-rose-600 text-white font-black uppercase text-xs shadow-lg shadow-rose-600/20">Archive Analysis</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg glass-card p-12 border border-white/10 premium-shadow">
            <h3 className="text-3xl font-black text-white mb-8">Initialize New Topic</h3>
            <form onSubmit={handleCreateTopic} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="topic-name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topic Identification</label>
                <input id="topic-name" required placeholder="e.g. Distributed Systems Architecture" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={newTopic.topic} onChange={e => setNewTopic({ ...newTopic, topic: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="topic-category" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Classification</label>
                  <input id="topic-category" required placeholder="e.g. Technical" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={newTopic.category} onChange={e => setNewTopic({ ...newTopic, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="topic-status" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Status</label>
                  <select id="topic-status" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={newTopic.status} onChange={e => setNewTopic({ ...newTopic, status: e.target.value })}>
                    <option value="not_started" className="bg-slate-900">Not Started</option>
                    <option value="in_progress" className="bg-slate-900">In Progress</option>
                    <option value="completed" className="bg-slate-900">Synchronized</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowTopicModal(false)} className="flex-1 p-4 rounded-2xl bg-white/5 text-slate-400 font-bold uppercase text-xs">Abort</button>
                <button type="submit" className="flex-1 p-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs shadow-lg shadow-indigo-600/20">Forge Node</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Learning;
