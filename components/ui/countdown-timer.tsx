'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: string;
  urgencyText: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate, urgencyText, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Calcular imediatamente
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className={`bg-red-500/10 border-b border-red-500/30 py-1 ${className}`}>
        <div className="text-center overflow-hidden">
          <p className="text-red-400 font-bold text-xs whitespace-nowrap">
            <span className="animate-pulse">🔥</span>
            {" "}Últimas 48h para garantir sua vaga GRATUITA!{" "}
            <span className="animate-pulse">🔥</span>
          </p>
        </div>
      </div>
    );
  }

  const timeComponents = [
    { value: timeLeft.days, label: 'DIAS' },
    { value: timeLeft.hours, label: 'HRS' },
    { value: timeLeft.minutes, label: 'MIN' },
    { value: timeLeft.seconds, label: 'SEG' }
  ];

  return (
    <div className={`bg-red-500/10 border-b border-red-500/30 py-1 ${className}`}>
      <div className="text-center overflow-hidden">
        <p className="text-red-400 font-bold text-xs whitespace-nowrap">
          <span className="animate-pulse">🔥</span>
          {" "}Últimas 48h para garantir sua vaga GRATUITA!{" "}
          <span className="animate-pulse">🔥</span>
        </p>
      </div>
    </div>
  );
}
