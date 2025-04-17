'use client'

import { useEffect, useState } from 'react'
import { LeadForm } from "@/components/LeadForm"
import { FloatingGrid } from "@/components/ui/floating-grid"
import { FeatureCard } from "@/components/ui/feature-card"
import { Footer } from "@/components/Footer"
import { motion } from "framer-motion"
import { SonarBadge } from "@/components/ui/sonar-badge"

// Constantes para evitar problemas de hidratação
const MAIN_TITLE = "IA de Verdade. Para Quem Já Programa.";
const EVENT_DATE = "5 a 8 de maio";
const VERSION = Date.now(); // Forçar nova versão

export default function HomePage() { // Nome diferente da função para forçar nova compilação
  // Estado para controlar a renderização cliente/servidor
  const [mounted, setMounted] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Este useEffect só será executado no cliente
  useEffect(() => {
    setMounted(true);
    
    // Forçar atualização do DOM para garantir que o conteúdo mais recente seja exibido
    document.title = `AI Code Pro - ${MAIN_TITLE} (v${VERSION})`;
    
    // Forçar uma atualização após a montagem
    setTimeout(() => {
      setForceUpdate(prev => prev + 1);
    }, 100);
  }, []);

  // Versão simplificada para o servidor
  if (!mounted) {
    return (
      <main className="relative min-h-screen bg-black text-white overflow-hidden">
        <div className="container mx-auto px-4 pt-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="space-y-8">
              <div>
                <div className="relative inline-block mb-4">
                  <div className="px-6 py-3 rounded-xl bg-black/40 border border-[#0c83fe]">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0c83fe]">
                      AI Code Pro
                    </h1>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-sm text-gray-300">Construa o Futuro com IA</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold">
                  <span className="inline-block text-white">{MAIN_TITLE}</span>
                </h2>
              </div>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Aprenda na prática a desenvolver soluções avançadas com LLM, RAG e Agentes de IA.
              </p>

              <div className="w-full max-w-2xl mx-auto">
                <div className="relative">
                  <div className="bg-black/40 rounded-2xl border border-white/10 p-8">
                    <h3 className="text-2xl font-bold mb-6 text-center">Garanta Sua Vaga Agora! De {EVENT_DATE}</h3>
                    <p className="text-gray-400 mb-8 text-center">Vagas Limitadas - Turma Exclusiva - 100% online e Gratuito</p>
                    <div className="max-w-md mx-auto">
                      <LeadForm />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Versão completa com animações apenas no cliente
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden" key={`main-${forceUpdate}`}>
      <FloatingGrid />

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-[#0c83fe]/20 rounded-xl blur-xl"></div>
                  <div className="relative px-6 py-3 rounded-xl bg-black/40 border border-[#0c83fe] backdrop-blur-sm">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0c83fe]">
                      AI Code Pro
                    </h1>
                  </div>
                </div>
                <SonarBadge text="Construa o Futuro com IA" className="mb-6" />
                <h2 className="text-4xl md:text-6xl font-bold mobile-optimized-text">
                  <span className="inline-block text-white">{MAIN_TITLE}</span>
                </h2>
              </div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-300 max-w-2xl mx-auto description-text"
              >
                Aprenda na prática a desenvolver soluções avançadas com{" "}
                <span className="text-[#0c83fe]">LLM</span>,{" "}
                <span className="text-[#0c83fe]">RAG</span> e{" "}
                <span className="text-[#0c83fe]">Agentes de IA</span> usando ferramentas como{" "}
                <span className="text-[#0c83fe]">CrewAI</span>,{" "}
                <span className="text-[#0c83fe]">LangGraph</span>,{" "}
                <span className="text-[#0c83fe]">Composio</span> e{" "}
                <span className="text-[#0c83fe]">Deep Research</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full max-w-2xl mx-auto"
                id="lead-form-container"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0c83fe]/20 to-[#0c83fe]/20 rounded-2xl blur-2xl" />
                  <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                    <h3 className="text-2xl font-bold mb-6 text-center">Garanta Sua Vaga Agora! De {EVENT_DATE}</h3>
                    <p className="text-gray-400 mb-8 text-center">Vagas Limitadas - Turma Exclusiva - 100% online e Gratuito</p>
                    <div className="max-w-md mx-auto">
                      <LeadForm />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cronograma Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Cronograma Title */}
          <div className="text-center mb-16 mt-24">
            <h2 className="text-4xl font-bold mb-6">Cronograma Completo</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Quatro dias intensivos de aprendizado prático, construindo projetos reais com as tecnologias mais avançadas de IA.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                dia: "Dia 1",
                titulo: "Agentes de IA",
                descricao: "Crie e implemente agentes de IA com LLM e RAG, utilizando transformers, embeddings e bancos de dados vetoriais para automação inteligente e tomada de decisão."
              },
              {
                dia: "Dia 2",
                titulo: "LLM e RAG Avançado",
                descricao: "Aplicação avançada com LLM's de ponta, modelos de embeddings e vector DBs profissionais."
              },
              {
                dia: "Dia 3",
                titulo: "Aplicação Completa",
                descricao: "Integre LLM, RAG e Agentes em um projeto robusto com automação e deploy."
              },
              {
                dia: "Dia 4",
                titulo: "Projeto Avançado",
                descricao: "Demonstração de um projeto profissional e acesso especial ao AI Pro Expert."
              }
            ].map((dia, index) => (
              <FeatureCard
                key={index}
                title={dia.titulo}
                description={dia.descricao}
                delay={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c83fe]/20 to-[#0c83fe]/20 rounded-2xl blur-2xl" />
              <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-[#0c83fe]/20">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold mb-2">Garanta Sua Vaga Agora! De {EVENT_DATE}</h2>
                  <p className="text-gray-400">Vagas Limitadas - Turma Exclusiva - 100% online e Gratuito</p>
                </div>
                <LeadForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
