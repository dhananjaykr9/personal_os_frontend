import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, animate = true, onClick }) => {
  const Card = (
    <div className={cn("glass-card p-6 relative group overflow-hidden", className)} onClick={onClick}>
      {/* Premium Scanner Light Effect */}
      <div className="scanner-light" />
      
      {/* Corner Brackets for HUD feel */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/5 group-hover:border-indigo-500/50 transition-colors" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/5 group-hover:border-indigo-500/50 transition-colors" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/5 group-hover:border-indigo-500/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/5 group-hover:border-indigo-500/50 transition-colors" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (!animate) return Card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {Card}
    </motion.div>
  );
};

export default GlassCard;
