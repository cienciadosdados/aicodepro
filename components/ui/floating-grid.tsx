'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function FloatingGrid() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  // Reduce number of floating elements on mobile
  const particleCount = isMobile ? 5 : 20;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] hero-gradient opacity-30" />
      </motion.div>
      
      {/* Floating Elements - reduced complexity for mobile */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          animate={{
            y: [
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            ],
            x: [
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            ],
          }}
          transition={{
            duration: isMobile ? Math.random() * 15 + 30 : Math.random() * 10 + 20, // Slower on mobile
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            filter: isMobile ? "blur(4px)" : "blur(8px)", // Less blur on mobile
          }}
        />
      ))}
    </div>
  );
}
