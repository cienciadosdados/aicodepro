'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  delay?: number;
  className?: string;
}

export function FeatureCard({ title, description, icon, delay = 0, className = "" }: FeatureCardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: isMobile ? 0 : delay * 0.1 // No delay on mobile for faster rendering
      }}
      whileHover={isMobile ? {} : { scale: 1.02 }} // Disable hover animation on mobile
      className={`relative group ${className}`}
    >
      {/* Simplified blur effect for mobile */}
      <div className={`absolute inset-0 bg-gradient-to-r from-[#22c55e]/20 to-[#22c55e]/20 rounded-xl ${
        isMobile ? 'blur-md' : 'blur-xl group-hover:blur-2xl'
      } transition-all duration-300 opacity-0 group-hover:opacity-100`} />
      
      <div className="relative p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 group-hover:border-[#22c55e]/50 transition-colors duration-300">
        {icon && (
          <div className="w-12 h-12 mb-4 text-[#22c55e] group-hover:text-[#22c55e]/80 transition-colors duration-300">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-[#22c55e] transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
