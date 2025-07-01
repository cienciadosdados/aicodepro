import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowingButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function GlowingButton({ children, onClick, className = "", disabled = false }: GlowingButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative group
        px-8 py-4 rounded-xl
        bg-gradient-to-r from-purple-600 to-purple-400
        text-white font-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
      
      {/* Button Content */}
      <div className="relative flex items-center justify-center gap-2">
        {children}
      </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
      </div>
    </motion.button>
  );
}
