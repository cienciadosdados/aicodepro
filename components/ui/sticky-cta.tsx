'use client';

import { motion } from 'framer-motion';

interface StickyCTAProps {
  className?: string;
}

export function StickyCTA({ className = '' }: StickyCTAProps) {
  const scrollToForm = () => {
    const formElement = document.getElementById('lead-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md ${className}`}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col items-center text-center space-y-2">
          <motion.p 
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white font-bold text-xs sm:text-sm"
          >
            🔥 Últimas vagas disponíveis!
          </motion.p>
          
          <motion.button
            onClick={scrollToForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#0c83fe] text-white font-bold px-6 py-2 rounded-lg shadow-lg hover:bg-[#0c83fe]/90 transition-all duration-200 text-sm"
          >
            GARANTIR VAGA
          </motion.button>
          
          <p className="text-gray-300 text-xs">
            Não perca esta oportunidade única
          </p>
        </div>
      </div>
    </motion.div>
  );

// FORCE CACHE BUST - v2.0
}
