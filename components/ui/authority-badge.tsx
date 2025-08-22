'use client';

import { motion } from 'framer-motion';

interface AuthorityBadgeProps {
  className?: string;
}

export function AuthorityBadge({ className = '' }: AuthorityBadgeProps) {
  const stats = [
    {
      number: "100.000+",
      text: "programadores já treinados",
      icon: "👨‍💻"
    },
    {
      number: "120.000+",
      text: "participantes na comunidade",
      icon: "🚀"
    }
  ];

  return (
    <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-[#0c83fe]/20 to-[#0c83fe]/20 backdrop-blur-sm border border-[#0c83fe]/30 rounded-xl p-4 text-center min-w-[200px]"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              className="text-2xl"
            >
              {stat.icon}
            </motion.span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
              className="text-2xl font-bold text-[#0c83fe]"
            >
              {stat.number}
            </motion.span>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
            className="text-white text-sm font-medium"
          >
            {stat.text}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}

// FORCE CACHE BUST - v2.0
