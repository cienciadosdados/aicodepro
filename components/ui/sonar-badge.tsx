'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SonarBadgeProps {
  text?: string;
  className?: string;
}

export function SonarBadge({ text = "Construa o Futuro com IA", className = "" }: SonarBadgeProps) {
  // Usando useState para garantir que o componente seja renderizado da mesma forma no servidor e no cliente
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Este useEffect só será executado no cliente, não no servidor
  useEffect(() => {
    setMounted(true);
    
    // Verificar se é dispositivo móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Renderização simples para o servidor
  if (!mounted) {
    return (
      <div className={`relative inline-flex items-center gap-2 ${className}`}>
        <div className="relative px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 bg-[#22c55e] rounded-full" />
          </div>
          <span className="text-sm text-gray-300">
            {text}
          </span>
        </div>
      </div>
    );
  }

  // Renderização completa com animações apenas no cliente
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative inline-flex items-center gap-2 ${className}`}
    >
      {!isMobile && (
        <>
          {/* Primeira onda sonar */}
          <motion.div 
            className="absolute inset-0 bg-[#22c55e]/20 rounded-full"
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, 2.5],
              opacity: [0.8, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }
            }}
          />
          {/* Segunda onda sonar */}
          <motion.div 
            className="absolute inset-0 bg-[#22c55e]/15 rounded-full"
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, 3],
              opacity: [0.6, 0],
              transition: {
                duration: 2,
                delay: 0.5,
                repeat: Infinity,
                ease: "easeOut"
              }
            }}
          />
        </>
      )}
      <div className="relative px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center gap-2">
        <div className="relative">
          <div className="w-2 h-2 bg-[#22c55e] rounded-full" />
          {/* Pulso principal do ponto */}
          <motion.div
            className="absolute inset-0 bg-[#22c55e] rounded-full"
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, 3],
              opacity: [1, 0]
            }}
            transition={{
              duration: isMobile ? 2.5 : 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          {/* Segundo pulso do ponto */}
          <motion.div
            className="absolute inset-0 bg-[#22c55e] rounded-full"
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, 4],
              opacity: [0.6, 0]
            }}
            transition={{
              duration: isMobile ? 2.5 : 1.5,
              delay: 0.3,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </div>
        <span className="text-sm text-gray-300">
          {text}
        </span>
      </div>
    </motion.div>
  );
}
