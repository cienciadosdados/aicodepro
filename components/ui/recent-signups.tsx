'use client';

import { useState, useEffect } from 'react';

interface RecentSignupsProps {
  className?: string;
}

interface Signup {
  id: number;
  name: string;
  timeAgo: string;
  location?: string;
}

const signupData: Signup[] = [
  { id: 1, name: "João Silva", timeAgo: "agora mesmo", location: "São Paulo" },
  { id: 2, name: "Maria Santos", timeAgo: "há 2 min", location: "Rio de Janeiro" },
  { id: 3, name: "Pedro Costa", timeAgo: "há 3 min", location: "Belo Horizonte" },
  { id: 4, name: "Ana Oliveira", timeAgo: "há 5 min", location: "Porto Alegre" },
  { id: 5, name: "Carlos Ferreira", timeAgo: "há 7 min", location: "Brasília" },
  { id: 6, name: "Juliana Lima", timeAgo: "há 8 min", location: "Salvador" },
  { id: 7, name: "Roberto Alves", timeAgo: "há 10 min", location: "Curitiba" },
  { id: 8, name: "Fernanda Rocha", timeAgo: "há 12 min", location: "Fortaleza" },
  { id: 9, name: "Lucas Martins", timeAgo: "há 15 min", location: "Recife" },
  { id: 10, name: "Camila Souza", timeAgo: "há 18 min", location: "Manaus" }
];

export function RecentSignups({ className = '' }: RecentSignupsProps) {
  const [currentSignup, setCurrentSignup] = useState<Signup>(signupData[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * signupData.length);
        setCurrentSignup(signupData[randomIndex]);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-80 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      <div className="bg-[#0c83fe]/10 backdrop-blur-sm border border-[#0c83fe]/20 rounded-2xl px-6 py-3 shadow-xl">
        <div className="flex items-center justify-center gap-3">
          <div className="w-3 h-3 bg-[#0c83fe] rounded-full flex-shrink-0 animate-pulse" />
          
          <div className="text-center">
            <p className="text-white font-medium text-sm">
              <span className="font-bold text-[#0c83fe]">{currentSignup.name}</span>
              {currentSignup.location && (
                <span className="text-gray-300"> de {currentSignup.location}</span>
              )}
            </p>
            
            <p className="text-[#0c83fe]/80 text-xs">
              acabou de se inscrever {currentSignup.timeAgo}
            </p>
          </div>
          
          <div className="text-[#0c83fe] text-lg flex-shrink-0">
            ✅
          </div>
        </div>
      </div>
    </div>
  );
}
