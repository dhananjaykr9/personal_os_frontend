/** ORIN Intelligence Interface - Production Build v1.0.2 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Zap, Square } from 'lucide-react';
import api from '../api';
import { orin } from '../utils/orinVoice';
import { useNavigate } from 'react-router-dom';

const OrinInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [orinResponse, setOrinResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;       // Keep listening until user stops
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript.trim() && !isProcessingRef.current) {
          handleSendCommand(finalTranscript.trim());
        }
      };

      recognition.onend = () => {
        // If still supposed to be listening (user didn't press stop), restart
        if (isListening && !isProcessingRef.current) {
          try { recognition.start(); } catch (_) {}
        } else {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setShowConsole(false);
    } else {
      setTranscript('');
      setOrinResponse('');
      setShowConsole(true);
      setIsListening(true);
      try {
        recognitionRef.current?.start();
        orin.speak("Listening.");
      } catch (_) {}
    }
  };

  const handleSendCommand = async (command: string) => {
    if (!command.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const response = await api.post('/api/orin/chat', { message: command });
      const { response: orinText, actions } = response.data;

      setOrinResponse(orinText);
      setIsProcessing(false);
      isProcessingRef.current = false;
      orin.speak(orinText);
      setTranscript('');

      // Execute navigation actions
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
      isProcessingRef.current = false;
      setOrinResponse("Cognitive uplink error. Backend may be offline.");
      orin.speak("Connection error.");
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
                 <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest opacity-50 italic">{isListening ? '⬤ Live' : 'Input'}</p>
                 <p className="text-xs font-medium text-slate-300 leading-relaxed italic">"{transcript || 'Speak a command...'}"</p>
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
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Processing...</span>
                 </div>
               )}

               {orinResponse && !isProcessing && (
                 <div className="space-y-1 border-t border-white/5 pt-3">
                   <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest opacity-60">Orin</p>
                   <p className="text-xs text-slate-200 leading-relaxed">{orinResponse}</p>
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
