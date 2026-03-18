import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Terminal, Command, Zap, Play, Square } from 'lucide-react';
import api from '../api';
import { orin } from '../utils/orinVoice';
import { useNavigate } from 'react-router-dom';

const OrinInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);
        
        if (event.results[current].isFinal) {
          handleSendCommand(resultTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
      orin.speak("Listening.");
    }
  };

  const handleSendCommand = async (command: string) => {
    if (!command.trim()) return;
    setIsProcessing(true);
    setShowConsole(true);

    try {
      const response = await api.post('/api/orin/chat', { message: command });
      const { response: orinText, actions } = response.data;

      setIsProcessing(false);
      orin.speak(orinText);

      // Execute actions
      if (actions) {
        actions.forEach((action: any) => {
          if (action.type === 'navigate') {
            navigate(action.path);
          }
        });
      }
    } catch (error) {
      console.error('Orin communication error:', error);
      setIsProcessing(false);
      orin.speak("I am having trouble connecting to my cognitive core.");
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[600] flex flex-col items-end gap-4">
      {/* Orin Console Output */}
      <AnimatePresence>
        {showConsole && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 glass-card p-6 border border-white/10 shadow-2xl mb-2 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orin Uplink</span>
               </div>
               <button onClick={() => setShowConsole(false)} className="text-slate-600 hover:text-white transition-colors">
                 <Square size={12} />
               </button>
             </div>
             
             <div className="space-y-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
               <div className="space-y-1">
                 <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest opacity-50 italic">User Input</p>
                 <p className="text-xs font-medium text-slate-300 leading-relaxed italic">"{transcript || 'Waiting for input...'}"</p>
               </div>
               
               {isProcessing && (
                 <div className="flex items-center gap-3">
                   <motion.div 
                     animate={{ rotate: 360 }} 
                     transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                     className="text-indigo-500"
                   >
                     <Zap size={14} />
                   </motion.div>
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Processing Cognitive Cycle...</span>
                 </div>
               )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orin Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 relative group overflow-hidden ${
          isListening 
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]' 
            : 'glass-effect border-white/10 text-indigo-400 hover:border-indigo-500/50'
        }`}
      >
        {isListening ? (
          <div className="relative z-10">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <MicOff size={24} />
            </motion.div>
          </div>
        ) : (
          <div className="relative z-10">
            <Mic size={24} className="group-hover:scale-110 transition-transform" />
          </div>
        )}
        
        {/* Ring Animation when listening */}
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-2xl border-2 border-rose-500"
          />
        )}
        
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>
    </div>
  );
};

export default OrinInterface;
