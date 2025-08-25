'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FloatingGrid } from '@/components/ui/floating-grid';
import { SonarBadge } from '@/components/ui/sonar-badge';
import { Suspense, useEffect, useState } from 'react';
import Head from 'next/head';

// Componente que usa useSearchParams
function ThankYouContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const [isAILabDomain, setIsAILabDomain] = useState(false);
  
  useEffect(() => {
    // Verificar se estamos no domínio antigo
    if (typeof window !== 'undefined') {
      // Forçar o domínio correto
      const currentUrl = window.location.href;
      const currentHost = window.location.hostname;
      
      if (currentHost.includes('ai-labs')) {
        setIsAILabDomain(true);
        // Redirecionar para o novo domínio mantendo os parâmetros da URL
        const newUrl = currentUrl.replace('ai-labs.cienciadosdados.com', 'ai-code-pro.cienciadosdados.com');
        window.location.href = newUrl;
        return;
      }
      
      // Remover qualquer referência ao domínio antigo na URL
      if (currentUrl.includes('ai-labs.cienciadosdados.com')) {
        const cleanUrl = new URL(window.location.href);
        // Limpar parâmetros que contenham referências ao domínio antigo
        cleanUrl.searchParams.forEach((value, key) => {
          if (value.includes('ai-labs.cienciadosdados.com')) {
            const newValue = value.replace('ai-labs.cienciadosdados.com', 'ai-code-pro.cienciadosdados.com');
            cleanUrl.searchParams.set(key, newValue);
          }
        });
        window.history.replaceState({}, '', cleanUrl);
      }
    }
    
    // Redirecionamento para o grupo após 12 segundos
    const timer = setTimeout(() => {
      window.location.href = 'https://sndflw.com/i/ai-code-pro';
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
              <div className="absolute inset-0 bg-[#a855f7]/20 rounded-xl blur-xl"></div>
              <div className="relative px-6 py-3 rounded-xl bg-black/40 border border-[#a855f7] backdrop-blur-sm">
                <h1 className="text-4xl md:text-5xl font-bold text-[#a855f7]">
                  AI Code Pro
                </h1>
                {isAILabDomain && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
                    Redirecionando...
                  </div>
                )}
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Inscrição Confirmada! 🎉
            </h2>
            
            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
              <p className="text-xl mb-4">
                Enviamos todos os detalhes para o seu e-mail: <span className="text-[#a855f7] font-semibold">{email}</span>
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
            <div className="absolute -inset-1 bg-gradient-to-r from-[#a855f7]/30 via-[#a855f7]/10 to-[#a855f7]/30 rounded-lg blur-md"></div>
            <h3 className="relative text-xl md:text-3xl font-bold py-2 px-4 bg-black/60 backdrop-blur-sm rounded-lg border border-[#a855f7]/40">
              <motion.span 
                className="text-[#a855f7]"
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
                2 passos que você precisa seguir agora:
              </motion.span>
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Entre no Grupo do WhatsApp",
                description: "Para garantir que você receberá todos os scripts dos projetos, é importante que esteja no grupo EXCLUSIVO, pois será nosso REPO oficial.",
                link: "https://sndflw.com/i/ai-code-pro",
                buttonText: "PARTICIPAR DO GRUPO EXCLUSIVO"
              },
              {
                title: "Responder a Pesquisa",
                description: "Ajude-nos a personalizar o conteúdo do AI Code Pro respondendo nossa pesquisa rápida. Suas respostas nos permitirão focar nos temas mais importantes para você.",
                link: `/pesquisa?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&isProgrammer=true`,
                buttonText: "RESPONDER PESQUISA"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7]/20 to-[#a855f7]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 group-hover:border-[#a855f7]/50 transition-colors duration-300 h-full flex flex-col">
                  <div className="mb-2 text-[#a855f7] font-bold text-xl">
                    {index + 1}.
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-white group-hover:text-[#a855f7] transition-colors duration-300">
                    {step.title}
                  </h4>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mb-4 flex-grow">
                    {step.description}
                  </p>
                  <Link 
                    href={step.link}
                    target="_blank"
                    className="inline-block bg-[#a855f7]/10 hover:bg-[#a855f7]/20 text-[#a855f7] font-medium py-2 px-4 rounded-lg border border-[#a855f7]/30 transition-colors duration-300 w-full text-center"
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
            Tem alguma dúvida? Entre em contato pelo e-mail <a href="mailto:suporte@cienciadosdados.com" className="text-[#a855f7] hover:underline">suporte@cienciadosdados.com</a>
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
  // Força a atualização do título da página para garantir que não mostre AI Lab
  useEffect(() => {
    // Forçar o título da página para AI Code Pro
    document.title = 'AI Code Pro - Inscrição Confirmada';
    
    // Remover qualquer meta tag que possa conter referências ao AI Lab
    const metaTags = document.getElementsByTagName('meta');
    for (let i = 0; i < metaTags.length; i++) {
      const tag = metaTags[i];
      if (tag.content && tag.content.includes('AI Lab')) {
        tag.content = tag.content.replace('AI Lab', 'AI Code Pro');
      }
    }
    
    // Verificar se há algum texto no DOM que contenha 'AI Lab' e substituir
    const replaceText = (node: Node): void => {
      if (node.nodeType === 3) { // Text node
        if (node.nodeValue && node.nodeValue.includes('AI Lab')) {
          node.nodeValue = node.nodeValue.replace(/AI Lab/g, 'AI Code Pro');
        }
      } else if (node.nodeType === 1) { // Element node
        Array.from(node.childNodes).forEach(replaceText);
      }
    };
    
    // Aplicar a substituição em todo o documento
    setTimeout(() => {
      replaceText(document.body);
    }, 100);
  }, []);
  
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <head>
        <title>AI Code Pro - Inscrição Confirmada</title>
        <meta name="description" content="Sua inscrição no AI Code Pro foi confirmada com sucesso!" />
        <meta property="og:title" content="AI Code Pro - Inscrição Confirmada" />
        <meta property="og:description" content="Sua inscrição no AI Code Pro foi confirmada com sucesso!" />
      </head>
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
