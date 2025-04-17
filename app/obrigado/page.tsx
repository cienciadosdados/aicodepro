'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FloatingGrid } from '@/components/ui/floating-grid';
import { SonarBadge } from '@/components/ui/sonar-badge';
import { Suspense, useEffect } from 'react';

// Componente que usa useSearchParams
function ThankYouContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = 'https://sendflow.pro/i/ai-lab';
    }, 12000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-16 relative z-10">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[#0c83fe]/20 rounded-xl blur-xl"></div>
              <div className="relative px-6 py-3 rounded-xl bg-black/40 border border-[#0c83fe] backdrop-blur-sm">
                <h1 className="text-4xl md:text-5xl font-bold text-[#0c83fe]">
                  AI Lab
                </h1>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Inscrição Confirmada! 🎉
            </h2>
            
            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
              <p className="text-xl mb-4">
                Enviamos todos os detalhes para o seu e-mail: <span className="text-[#0c83fe] font-semibold">{email}</span>
              </p>
              <p className="text-gray-400">
                (Verifique sua caixa de spam caso não encontre)
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex justify-center mb-4">
            <SonarBadge text="IMPORTANTE" className="mb-2" />
          </div>
          
          <div className="relative inline-block mb-8 w-full max-w-md mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0c83fe]/30 via-[#0c83fe]/10 to-[#0c83fe]/30 rounded-lg blur-md"></div>
            <h3 className="relative text-xl md:text-3xl font-bold py-2 px-4 bg-black/60 backdrop-blur-sm rounded-lg border border-[#0c83fe]/40">
              <motion.span 
                className="text-[#4db1ff]"
                animate={{
                  opacity: [0.7, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                3 passos que você precisa seguir agora:
              </motion.span>
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Entre no Grupo do WhatsApp",
                description: "Para garantir que você receberá todos os scripts dos projetos, é importante que esteja no grupo EXCLUSIVO, pois será nosso REPO oficial.",
                link: "https://sendflow.pro/i/ai-lab",
                buttonText: "PARTICIPAR DO GRUPO EXCLUSIVO"
              },
              {
                title: "Responda à Pesquisa",
                description: "O nosso objetivo é fazer com que você aproveite ao máximo esse evento! Queremos ouvir suas principais necessidades para garantir que o evento agregue em seus conhecimentos.",
                link: "https://forms.gle/fPz7UkdfnjzcBexX6",
                buttonText: "RESPONDER À PESQUISA"
              },
              {
                title: "Verifique seu E-mail",
                description: "Acesse seu e-mail e responda a pesquisa que te enviamos! Suas respostas são fundamentais para personalizarmos o conteúdo do evento.",
                link: `https://mail.google.com/mail/u/0/#search/from:cienciadosdados`,
                buttonText: "VERIFICAR E-MAIL"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c83fe]/20 to-[#0c83fe]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 group-hover:border-[#0c83fe]/50 transition-colors duration-300 h-full flex flex-col">
                  <div className="mb-2 text-[#0c83fe] font-bold text-xl">
                    {index + 1}.
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-white group-hover:text-[#0c83fe] transition-colors duration-300">
                    {step.title}
                  </h4>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mb-4 flex-grow">
                    {step.description}
                  </p>
                  <Link 
                    href={step.link}
                    target="_blank"
                    className="inline-block bg-[#0c83fe]/10 hover:bg-[#0c83fe]/20 text-[#0c83fe] font-medium py-2 px-4 rounded-lg border border-[#0c83fe]/30 transition-colors duration-300 w-full text-center"
                  >
                    {step.buttonText}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-gray-400 mb-4">
            Tem alguma dúvida? Entre em contato pelo e-mail <a href="mailto:suporte@cienciadosdados.com" className="text-[#0c83fe] hover:underline">suporte@cienciadosdados.com</a>
          </p>
          
          <div className="flex justify-center space-x-4 mt-8">
            <Link href="https://cienciadosdados.com/politica-privacidade" target="_blank" className="text-gray-400 hover:text-white text-sm">
              Políticas de Privacidade
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/" className="text-gray-400 hover:text-white text-sm">
              Voltar para Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Componente principal que envolve o conteúdo com Suspense
export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingGrid />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Carregando...</h2>
          </div>
        </div>
      }>
        <ThankYouContent />
      </Suspense>
    </main>
  );
}
