import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  ArrowUpRight,
  ArrowDownRight,
  Target,
  X,
  Activity,
  ShieldCheck,
  Trash2,
  ArrowRightLeft,
  User,
  PlusCircle,
  History,
  CheckCircle2,
  Clock,
  Settings2,
  LayoutGrid
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  note: string;
  timestamp: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  is_default: boolean;
}

interface Loan {
  id: string;
  type: 'given' | 'taken';
  person: string;
  amount: number;
  timestamp: string;
  due_date?: string;
  status: 'pending' | 'returned';
  note?: string;
}

const FinancePage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ expense: 0, income: 0, balance: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registry'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{ id: string; message: string } | null>(null);
  
  const [manualEntry, setManualEntry] = useState({
    amount: '',
    category: 'Personal',
    type: 'expense' as 'expense' | 'income',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const [loanEntry, setLoanEntry] = useState({
    type: 'given' as 'given' | 'taken',
    person: '',
    amount: '',
    due_date: '',
    note: ''
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchData = async () => {
    try {
      const summaryRes = await api.get(`/api/finance/summary?period=${period}`);
      const categoriesRes = await api.get('/api/finance/categories');
      const allTransRes = await api.get('/api/finance/transactions');
      const loansRes = await api.get('/api/finance/loans?status=pending');
      
      const totalIncome = allTransRes.data.reduce((acc: number, t: any) => t.type === 'income' ? acc + t.amount : acc, 0);
      const totalExpense = allTransRes.data.reduce((acc: number, t: any) => t.type === 'expense' ? acc + t.amount : acc, 0);

      setSummary({
        expense: summaryRes.data.expense || 0,
        income: summaryRes.data.income || 0,
        balance: totalIncome - totalExpense
      });
      
      setCategories(categoriesRes.data);
      setTransactions(allTransRes.data);
      setLoans(loansRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [period]);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/finance/transactions', {
        ...manualEntry,
        amount: parseFloat(manualEntry.amount),
        timestamp: new Date(manualEntry.date).toISOString()
      });
      setShowAddForm(false);
      setManualEntry({ amount: '', category: 'Personal', type: 'expense', note: '', date: format(new Date(), 'yyyy-MM-dd') });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleLoanAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/finance/loans', {
        ...loanEntry,
        amount: parseFloat(loanEntry.amount),
        due_date: loanEntry.due_date ? new Date(loanEntry.due_date).toISOString() : null
      });
      setShowLoanForm(false);
      setLoanEntry({ type: 'given', person: '', amount: '', due_date: '', note: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteTransaction = (id: string) => {
    setDeleteConfig({
      id,
      message: "Acknowledge: Void this financial transaction and purge it from the neural registry?"
    });
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!deleteConfig) return;
    try {
      await api.delete(`/api/finance/transactions/${deleteConfig.id}`);
      setShowDeleteModal(false);
      setDeleteConfig(null);
      fetchData();
    } catch (err) {
      console.error('Error during financial purge:', err);
    }
  };

  const updateLoanStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/finance/loans/${id}?status=${status}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const addCategory = async () => {
    if (!newCategoryName) return;
    try {
      await api.post('/api/finance/categories', { name: newCategoryName, icon: 'LayoutGrid', is_default: false });
      setNewCategoryName('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const filteredTransactions = selectedCategory === 'All' 
    ? transactions 
    : transactions.filter(t => t.category === selectedCategory);

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="fixed inset-0 neural-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-12">
        
        {/* HEADER */}
        <motion.header variants={item} className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Strategic Hub V2.1</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none gradient-text-emerald-white">Money Hub</h1>
              <p className="text-slate-500 text-lg font-black italic border-l-2 border-emerald-500/30 pl-4 tracking-widest">Neural financial orchestration</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowAddForm(true)} className="flex items-center gap-3 px-8 py-5 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <PlusCircle size={24} /> Sync Entry
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowLoanForm(true)} className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-3xl backdrop-blur-xl">
              <ArrowRightLeft size={24} /> Register Loan
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowCategorySettings(true)} className="p-5 bg-white/5 border border-white/10 text-slate-400 rounded-3xl backdrop-blur-xl hover:text-white transition-all">
              <Settings2 size={24} />
            </motion.button>
          </div>
        </motion.header>

        {/* FINANCIAL CORE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={item}>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-[2.5rem] border-l-4 border-l-emerald-500 flex flex-col justify-between h-48 relative group overflow-hidden premium-shadow backdrop-blur-xl">
              <div className="scanner-light" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex justify-between relative z-10">Net Worth <Target size={16} className="text-emerald-500" /></p>
              <h3 className="text-3xl font-black italic tabular-nums text-white group-hover:scale-105 origin-left transition-transform duration-500 relative z-10 tracking-tighter">₹{summary.balance.toLocaleString()}</h3>
              <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest relative z-10">Operational Surplus</p>
            </div>
          </motion.div>
          <motion.div variants={item}>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-[2.5rem] border-l-4 border-l-rose-500 flex flex-col justify-between h-48 relative group overflow-hidden premium-shadow backdrop-blur-xl">
              <div className="scanner-light" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex justify-between relative z-10">{period} Drain <TrendingDown size={16} className="text-rose-500" /></p>
              <h3 className="text-3xl font-black italic tabular-nums text-white group-hover:scale-105 origin-left transition-transform duration-500 relative z-10 tracking-tighter">₹{summary.expense.toLocaleString()}</h3>
              <div className="flex bg-white/5 rounded-xl p-1 w-fit mx-auto border border-white/5 relative z-10">
                {['daily', 'weekly', 'monthly'].map(p => (
                  <button key={p} onClick={() => setPeriod(p as any)} className={clsx("px-2 py-0.5 text-[7px] font-black uppercase rounded-lg transition-all", period === p ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-slate-600 hover:text-slate-400")}>{p}</button>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div variants={item}>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-[2.5rem] border-l-4 border-l-indigo-500 flex flex-col justify-between h-48 relative group overflow-hidden premium-shadow backdrop-blur-xl">
               <div className="scanner-light" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex justify-between relative z-10">Assets Out <ArrowUpRight size={16} className="text-indigo-500" /></p>
               <h3 className="text-3xl font-black italic tabular-nums text-white group-hover:scale-105 origin-left transition-transform duration-500 relative z-10 tracking-tighter">₹{loans.filter(l => l.type === 'given').reduce((a, b) => a + b.amount, 0).toLocaleString()}</h3>
               <p className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest relative z-10">Pending Recoveries</p>
            </div>
          </motion.div>
          <motion.div variants={item}>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-[2.5rem] border-l-4 border-l-amber-500 flex flex-col justify-between h-48 relative group overflow-hidden premium-shadow backdrop-blur-xl">
               <div className="scanner-light" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex justify-between relative z-10">Liabilities <ArrowDownRight size={16} className="text-amber-500" /></p>
               <h3 className="text-3xl font-black italic tabular-nums text-white group-hover:scale-105 origin-left transition-transform duration-500 relative z-10 tracking-tighter">₹{loans.filter(l => l.type === 'taken').reduce((a, b) => a + b.amount, 0).toLocaleString()}</h3>
               <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest relative z-10">Active Debts</p>
            </div>
          </motion.div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <motion.div variants={item} className="lg:col-span-4">
            <GlassCard className="p-10 h-full">
              <div className="flex items-center gap-3 mb-10">
                <PieChart className="text-emerald-500" />
                <h3 className="text-xl font-black uppercase italic tracking-widest">Sector Analysis</h3>
              </div>
              <div className="space-y-8">
                {categories.map(cat => {
                   const totalByCat = transactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((a, b) => a + b.amount, 0);
                   const percentage = summary.expense > 0 ? (totalByCat / summary.expense) * 100 : 0;
                   if (percentage === 0) return null;
                   return (
                     <div key={cat.id} className="space-y-3">
                       <div className="flex justify-between items-end">
                         <div className="flex items-center gap-3">
                           <Activity size={12} className="text-emerald-500" />
                           <p className="text-[10px] font-black uppercase text-slate-400">{cat.name}</p>
                         </div>
                         <p className="text-xs font-black italic text-white">₹{totalByCat.toLocaleString()}</p>
                       </div>
                       <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-emerald-500 rounded-full" />
                       </div>
                     </div>
                   );
                })}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-8">
            <GlassCard className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <History className="text-emerald-500" />
                  <h3 className="text-xl font-black uppercase italic tracking-widest">Operational Registry</h3>
                </div>
                <div className="flex gap-2">
                  {['dashboard', 'registry'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={clsx("px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all", activeTab === t ? "bg-emerald-500 text-black" : "text-slate-500 hover:text-white")}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-8">
                <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={clsx(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      selectedCategory === 'All' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white/5 text-slate-500 hover:text-white"
                    )}
                  >
                    All Sectors
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={clsx(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent",
                        selectedCategory === cat.name ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-slate-500 hover:text-white"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {(activeTab === 'dashboard' ? filteredTransactions.slice(0, 8) : filteredTransactions).map(t => (
                  <div key={t.id} className="group p-6 bg-white/[0.01] border border-white/5 hover:border-emerald-500/40 rounded-[2rem] flex items-center justify-between transition-all hover:bg-white/[0.03] premium-shadow overflow-hidden relative">
                    <div className="scanner-light" />
                    <div className="flex items-center gap-6 relative z-10">
                      <div className={clsx(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all",
                        t.type === 'expense' ? "bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:border-rose-500/40" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40"
                      )}>
                        {t.type === 'expense' ? <TrendingDown size={28} /> : <TrendingUp size={28} />}
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xl italic tracking-tighter leading-none mb-2">{t.category}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{format(new Date(t.timestamp), 'dd MMM, HH:mm')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 relative z-10">
                      <div className="text-right">
                        <p className={clsx("text-4xl font-black tabular-nums italic tracking-tighter", t.type === 'expense' ? "text-white" : "text-emerald-400")}>{t.type === 'expense' ? '-' : '+'}₹{t.amount.toLocaleString()}</p>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest max-w-[200px] truncate italic">{t.note || 'Neural Sync'}</p>
                      </div>
                      <button onClick={() => deleteTransaction(t.id)} className="p-4 bg-white/5 rounded-2xl text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5 hover:border-rose-500/20 opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
          </motion.div>
        </div>

        {/* LOANS SECTION */}
        <motion.div variants={item}>
          <GlassCard className="p-10 border-t-4 border-emerald-500/30">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" />
                <h3 className="text-2xl font-black uppercase italic tracking-widest">Active Loan Portfolio</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] border-l-2 border-emerald-500 pl-4 py-1">Capital Outbound (Loans Given)</p>
                <div className="space-y-4">
                  {loans.filter(l => l.type === 'given').map(l => (
                    <div key={l.id} className="p-6 bg-white/[0.03] border border-indigo-500/20 rounded-[2rem] flex items-center justify-between">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400"><User size={20} /></div>
                         <div>
                           <p className="text-xl font-black text-white italic tracking-tight">{l.person}</p>
                           <p className="text-[9px] font-black text-slate-600 uppercase">Registered: {format(new Date(l.timestamp), 'dd MMM yy')}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-2xl font-black text-indigo-400 italic">₹{l.amount.toLocaleString()}</p>
                        </div>
                        <button onClick={() => updateLoanStatus(l.id, 'returned')} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"><CheckCircle2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                  {loans.filter(l => l.type === 'given').length === 0 && <p className="text-center text-slate-700 uppercase font-black py-10">No pending recoveries</p>}
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] border-l-2 border-amber-500 pl-4 py-1">Liability Inbound (Loans Taken)</p>
                <div className="space-y-4">
                   {loans.filter(l => l.type === 'taken').map(l => (
                    <div key={l.id} className="p-6 bg-white/[0.03] border border-amber-500/20 rounded-[2rem] flex items-center justify-between">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400"><History size={20} /></div>
                         <div>
                           <p className="text-xl font-black text-white italic tracking-tight">{l.person}</p>
                           <p className="text-[9px] font-black text-slate-600 uppercase">Synchronized: {format(new Date(l.timestamp), 'dd MMM yy')}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-2xl font-black text-amber-400 italic">₹{l.amount.toLocaleString()}</p>
                          {l.due_date && <p className="text-[9px] font-black text-rose-500 uppercase italic flex items-center gap-1 justify-end"><Clock size={10} /> {format(new Date(l.due_date), 'dd MMM')}</p>}
                        </div>
                        <button onClick={() => updateLoanStatus(l.id, 'returned')} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 hover:bg-amber-500 hover:text-black transition-all"><CheckCircle2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                  {loans.filter(l => l.type === 'taken').length === 0 && <p className="text-center text-slate-700 uppercase font-black py-10">No active liabilities</p>}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

      </motion.div>

      {/* MODAL: New Entry */}
    <AnimatePresence>
      {showAddForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddForm(false)} className="absolute inset-0 bg-[#020617]/80 backdrop-blur-3xl" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem]">
            <div className="p-1 sm:p-px bg-gradient-to-br from-emerald-500/40 via-transparent to-rose-500/40 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] min-h-full">
              <div className="bg-[#020617] p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  
                  <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                      <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter">Neural Entry</h3>
                      <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Operational Pulse Sync</p>
                    </div>
                    <button onClick={() => setShowAddForm(false)} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"><X size={24} /></button>
                  </div>

                  <form onSubmit={handleManualAdd} className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setManualEntry(prev => ({ ...prev, type: 'expense' }))} className={clsx("py-6 rounded-2xl font-black uppercase text-xs border transition-all flex items-center justify-center gap-3", manualEntry.type === 'expense' ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]" : "bg-white/5 border-white/5 text-slate-600")}>
                        <TrendingDown size={16} /> Expense
                      </button>
                      <button type="button" onClick={() => setManualEntry(prev => ({ ...prev, type: 'income' }))} className={clsx("py-6 rounded-2xl font-black uppercase text-xs border transition-all flex items-center justify-center gap-3", manualEntry.type === 'income' ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-white/5 border-white/5 text-slate-600")}>
                        <TrendingUp size={16} /> Income
                      </button>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 pl-2">Capital Amount</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center text-3xl font-black italic text-emerald-500/40">₹</div>
                        <input type="number" required value={manualEntry.amount} onChange={e => setManualEntry(p => ({ ...p, amount: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 pl-14 text-4xl font-black italic text-white outline-none focus:border-emerald-500/40 focus:bg-white/10 transition-all" placeholder="0.00" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 pl-2">Context Date</label>
                         <input type="date" value={manualEntry.date} onChange={e => setManualEntry(p => ({ ...p, date: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black text-white outline-none focus:border-emerald-500/40" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 pl-2">Sector</label>
                         <select value={manualEntry.category} onChange={e => setManualEntry(p => ({ ...p, category: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black text-white outline-none uppercase appearance-none cursor-pointer focus:border-emerald-500/40">
                           {categories.map(c => <option key={c.id} value={c.name} className="bg-[#020617] text-white p-4 font-black">{c.name}</option>)}
                         </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 pl-2">Tactical Note</label>
                       <input type="text" value={manualEntry.note} onChange={e => setManualEntry(p => ({ ...p, note: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-bold text-slate-300 outline-none focus:border-emerald-500/40" placeholder="Optional mission details..." />
                    </div>

                    <button type="submit" className="w-full py-8 bg-emerald-500 text-black font-black uppercase tracking-[0.6em] rounded-full text-xl shadow-[0_0_60px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all">Authorize Sync</button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Sector Settings */}
      <AnimatePresence>
        {showCategorySettings && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategorySettings(false)} className="absolute inset-0 bg-[#020617]/80 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md">
              <div className="bg-[#020617] p-10 rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black uppercase italic text-white">Sector Management</h3>
                  <button onClick={() => setShowCategorySettings(false)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={24} /></button>
                </div>
                <div className="space-y-8">
                   <div className="flex gap-3">
                     <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New Sector Name..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/40" />
                     <button onClick={addCategory} className="px-6 py-4 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-2xl">Add</button>
                   </div>
                   <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                     {categories.map(c => (
                       <div key={c.id} className="flex justify-between items-center p-5 bg-white/5 border border-white/5 rounded-2xl group hover:border-emerald-500/20 transition-all">
                         <div className="flex items-center gap-4">
                           <LayoutGrid size={16} className="text-slate-600" />
                           <span className="text-xs font-black uppercase text-slate-300">{c.name}</span>
                         </div>
                         {!c.is_default && <button className="text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>}
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Loan Registry */}
      <AnimatePresence>
        {showLoanForm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLoanForm(false)} className="absolute inset-0 bg-[#020617]/80 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem]">
              <div className="bg-[#020617] p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] min-h-full">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter">Loan Registry</h3>
                    <p className="text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.2em]">Strategic Liability Sync</p>
                  </div>
                  <button onClick={() => setShowLoanForm(false)} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={24} /></button>
                </div>
                <form onSubmit={handleLoanAdd} className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setLoanEntry(prev => ({ ...prev, type: 'given' }))} className={clsx("py-6 rounded-2xl font-black uppercase text-xs border transition-all", loanEntry.type === 'given' ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" : "bg-white/5 border-white/5 text-slate-600")}>Loan Given</button>
                    <button type="button" onClick={() => setLoanEntry(prev => ({ ...prev, type: 'taken' }))} className={clsx("py-6 rounded-2xl font-black uppercase text-xs border transition-all", loanEntry.type === 'taken' ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-white/5 border-white/5 text-slate-600")}>Loan Taken</button>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 pl-2">{loanEntry.type === 'given' ? 'Debtor Name' : 'Creditor Name'}</label>
                    <input type="text" required value={loanEntry.person} onChange={e => setLoanEntry(p => ({ ...p, person: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-xl font-black text-white outline-none focus:border-indigo-500/40" placeholder="Identity..." />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 pl-2">Capital Amount</label>
                       <input type="number" required value={loanEntry.amount} onChange={e => setLoanEntry(p => ({ ...p, amount: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-2xl font-black text-white outline-none focus:border-indigo-500/40" placeholder="0.00" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 pl-2">Maturity Date</label>
                       <input type="date" value={loanEntry.due_date} onChange={e => setLoanEntry(p => ({ ...p, due_date: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm font-black text-white" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-8 bg-indigo-500 text-black font-black uppercase tracking-[0.6em] rounded-full text-xl shadow-[0_0_60px_rgba(99,102,241,0.3)] hover:scale-[1.02] transition-all">Authorize Setup</button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && deleteConfig && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-[3rem] p-10 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-6 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <Trash2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Protocol: Financial Purge</h3>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] leading-relaxed">
                  {deleteConfig.message}
                </p>
                <div className="flex gap-4 w-full pt-4">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 p-5 rounded-2xl bg-white/5 text-slate-500 font-black uppercase text-xs hover:text-white transition-all border border-white/5"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={executeDelete}
                    className="flex-1 p-5 rounded-2xl bg-rose-600 text-white font-black uppercase text-xs shadow-xl shadow-rose-600/30 hover:bg-rose-500 transition-all"
                  >
                    Confirm Void
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

export default FinancePage;
