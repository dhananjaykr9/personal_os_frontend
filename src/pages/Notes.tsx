import React, { useState, useEffect } from 'react';
import api from '../api';
import GlassCard from '../components/GlassCard';
import { Plus, Search, FileText, BrainCircuit, X, Zap, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Note {
  id: string;
  title: string;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ title: '', category: 'technical', content: '' });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/api/notes/?search=${searchQuery}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
    const refreshHandler = () => fetchNotes();
    window.addEventListener('data-refreshed', refreshHandler);
    return () => window.removeEventListener('data-refreshed', refreshHandler);
  }, [searchQuery]);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeNote) {
        await api.put(`/api/notes/${activeNote.id}`, noteForm);
      } else {
        await api.post('/api/notes/', noteForm);
      }
      setShowAddModal(false);
      setNoteForm({ title: '', category: 'technical', content: '' });
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/api/notes/${noteId}`);
      setActiveNote(null);
      setShowDeleteConfirm(null);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const startNewNote = () => {
    setActiveNote(null);
    setNoteForm({ title: '', category: 'technical', content: '' });
    setShowAddModal(true);
  };

  const startEditing = (note: Note) => {
    setActiveNote(note);
    setNoteForm({ title: note.title, category: note.category, content: note.content });
    setShowAddModal(true);
  };

  const getComplexity = (content: string) => {
    const len = content?.length || 0;
    if (len > 500) return { label: 'Deep Neural Net', color: 'text-indigo-400' };
    if (len > 200) return { label: 'Cognitive Link', color: 'text-emerald-400' };
    return { label: 'Synapse', color: 'text-slate-500' };
  };

  return (
    <>
      <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20 max-w-7xl mx-auto h-[calc(100vh-120px)] overflow-hidden"
    >
      <motion.div variants={item} className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Knowledge Stratum Live</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Archive Nodes: {notes.length}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <h2 className="text-7xl font-black text-gradient tracking-tighter leading-tight italic">
              Neural Archive
            </h2>
            <p className="text-slate-400 text-xl font-medium max-w-xl leading-relaxed">
              Systematic indexing of technical findings and operational intelligence. Synchronized via <span className="text-indigo-400 font-black italic">KNOWLEDGE-HUB</span>.
            </p>
          </div>
          <button 
            onClick={startNewNote}
            className="group relative flex items-center gap-3 px-8 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.2)] font-black uppercase tracking-widest text-xs active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus size={18} />
            <span>Capture Insight</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Query semantic index..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-indigo-500/50 transition-all text-white font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-20">
            {notes.map((note) => {
              const isActive = activeNote?.id === note.id;
              return (
                <motion.div key={note.id} variants={item} onClick={() => { setActiveNote(note); }}>
                  <GlassCard className={`p-6 cursor-pointer border transition-all ${isActive ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5'} hover:border-indigo-500/20`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-xl ${isActive ? 'bg-indigo-500 text-white' : 'bg-white/5 text-indigo-400'}`}>
                        <FileText size={18} />
                      </div>
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{format(new Date(note.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <h4 className="text-xl font-black text-white group-hover:text-indigo-400 truncate tracking-tight uppercase">{note.title}</h4>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-400/20 px-2 py-0.5 rounded-lg">{note.category}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${getComplexity(note.content).color}`}>{getComplexity(note.content).label}</span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
              {notes.length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <FileText className="mx-auto mb-4" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Archive Empty</p>
                </div>
              )}
          </div>
        </div>

        <div className="lg:col-span-8 overflow-hidden h-full">
           <GlassCard className="h-full flex flex-col p-0 border border-white/5 relative bg-white/[0.01]">
             {activeNote ? (
                <div className="flex flex-col h-full p-12 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                         <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-400/5 px-4 py-1.5 rounded-lg border border-indigo-400/10">{activeNote.category}</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{format(new Date(activeNote.created_at), 'MMM d, yyyy')}</span>
                       </div>
                       <h3 className="text-5xl font-black text-white tracking-tighter uppercase leading-tight">{activeNote.title}</h3>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setShowDeleteConfirm(activeNote.id)} className="p-3.5 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                       <button onClick={() => startEditing(activeNote)} className="px-10 py-3.5 rounded-xl bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/30 active:scale-95 transition-all">Modify Node</button>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none mb-20">
                     <div className="text-xl text-slate-300 leading-relaxed font-medium markdown-content">
                       <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-40">
                  <div className="p-10 rounded-[3rem] bg-indigo-500/5 border border-white/5">
                     <BrainCircuit size={80} className="text-indigo-400" />
                  </div>
                  <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500">Select Intelligence Cluster</p>
                </div>
              )}
           </GlassCard>
        </div>
      </div>
    </motion.div>

    <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl glass-card p-12 border border-white/10 premium-shadow relative overflow-hidden my-auto"
            >
              <div className="absolute -right-20 -top-20 text-indigo-500/5 pointer-events-none">
                <FileText size={300} />
              </div>

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/30">
                    <Zap className="text-white" size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none italic">{activeNote ? 'Modify Node' : 'Initialize Node'}</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Neural archive entry protocol active.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-slate-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-8 relative z-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Headline Identification</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 font-bold focus:border-indigo-500/50 transition-all outline-none" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} placeholder="e.g. Cryptographic Subsystem Audit" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vertical Classification</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 font-bold focus:border-indigo-500/50 transition-all outline-none" value={noteForm.category} onChange={e => setNoteForm({...noteForm, category: e.target.value})} placeholder="e.g. Security" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Intelligence Body</label>
                  <textarea required className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-slate-300 min-h-[300px] focus:border-indigo-500/50 transition-all outline-none leading-relaxed font-medium resize-none custom-scrollbar" value={noteForm.content} onChange={e => setNoteForm({...noteForm, content: e.target.value})} placeholder="Specify findings and connections..." />
                </div>

                <div className="flex gap-6 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all border border-white/5">Abort Command</button>
                  <button type="submit" className="flex-1 p-5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Zap size={14} />
                    Commit Node
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card p-10 border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)] text-center space-y-8"
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertTriangle className="text-rose-500" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Purge Intelligence?</h3>
                <p className="text-slate-500 font-medium">This action will permanently erase the selected neural node from the archive.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 p-4 rounded-xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                <button onClick={() => handleDeleteNote(showDeleteConfirm)} className="flex-1 p-4 rounded-xl bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-600/30 active:scale-95 transition-all">Confirm Purge</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Notes;
