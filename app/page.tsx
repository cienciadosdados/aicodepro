'use client'

import { useEffect, useState } from 'react'
import { LeadForm } from "@/components/LeadForm"
import { FloatingGrid } from "@/components/ui/floating-grid"
import { FeatureCard } from "@/components/ui/feature-card"
import { Footer } from "@/components/Footer"
import { motion } from "framer-motion"
import { SonarBadge } from "@/components/ui/sonar-badge"

// Constantes para evitar problemas de hidratação
const MAIN_TITLE_LINE1 = "IA de Verdade.";  
const MAIN_TITLE_LINE2 = "Para Quem Já Programa.";
const EVENT_DATE = "01 a 04 de setembro";
const VERSION = Date.now(); // Forçar nova versão

export default function HomePage() { // Nome diferente da função para forçar nova compilação
  // Estado para controlar a renderização cliente/servidor
  const [mounted, setMounted] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Este useEffect só será executado no cliente
  useEffect(() => {
    setMounted(true);
    
    // Forçar atualização do DOM para garantir que o conteúdo mais recente seja exibido
    document.title = `AI Code Pro - ${MAIN_TITLE_LINE1} ${MAIN_TITLE_LINE2} (v${VERSION})`;
    
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
                  <div className="px-6 py-3 rounded-xl bg-black/40 border border-[#22c55e]">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#22c55e]">
                      AI Code Pro
                    </h1>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-sm text-gray-300">Construa o Futuro com IA</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold flex flex-col">
                  <span className="inline-block text-white">{MAIN_TITLE_LINE1}</span>
                  <span className="inline-block text-gray-400 text-3xl md:text-4xl">{MAIN_TITLE_LINE2}</span>
                </h2>
              </div>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Aprenda na prática a desenvolver soluções avançadas com LLM, RAG e Agentes de IA.
              </p>

              <div className="w-full max-w-2xl mx-auto">
                <div className="relative">
                  <div className="bg-black/40 rounded-2xl border border-[#22c55e]/20 p-8">
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
                  <div className="absolute inset-0 bg-[#22c55e]/20 rounded-xl blur-xl"></div>
                  <div className="relative px-6 py-3 rounded-xl bg-black/40 border border-[#22c55e] backdrop-blur-sm">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#22c55e]">
                      AI Code Pro
                    </h1>
                  </div>
                </div>
                <SonarBadge text="Construa o Futuro com IA" className="mb-6" />
                <h2 className="text-4xl md:text-6xl font-bold mobile-optimized-text flex flex-col">
                  <span className="inline-block text-white">{MAIN_TITLE_LINE1}</span>
                  <span className="inline-block text-gray-400 text-3xl md:text-4xl">{MAIN_TITLE_LINE2}</span>
                </h2>
              </div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-300 max-w-2xl mx-auto description-text"
              >
                Aprenda na prática a desenvolver soluções avançadas com{" "}
                <span className="text-[#22c55e]">LLM</span>,{" "}
                <span className="text-[#22c55e]">MCP</span>,{" "}
                <span className="text-[#22c55e]">RAG</span>,{" "}
                <span className="text-[#22c55e]">VectorDB</span>,{" "}
                <span className="text-[#22c55e]">Embedding</span> e{" "}
                <span className="text-[#22c55e]">Agentes de IA</span>{" "}
                <span className="text-[#22c55e]">usando ferramentas como</span>{" "}
                <span className="text-[#22c55e]">CrewAI</span>,{" "}
                <span className="text-[#22c55e]">LangGraph</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full max-w-2xl mx-auto"
                id="lead-form-container"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e]/20 to-[#22c55e]/20 rounded-2xl blur-2xl" />
                  <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl border border-[#22c55e]/20 p-8">
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

      {/* O Que Você Vai Aprender Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">O Que Você Vai Aprender</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Domine as tecnologias mais avançadas de IA através de projetos práticos e hands-on.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* LLMs e RAG */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(12, 131, 254, 0.3)" }}
              transition={{ duration: 0.3 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl border border-[#22c55e]/20 p-8 cursor-pointer hover:border-[#22c55e]/50"
            >
              <h3 className="text-2xl font-bold mb-4 text-[#22c55e]">LLMs e RAG</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Claude, Openai, DeepSeek e muito mais</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Implementação de RAG</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Vector Databases</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Fine-tuning e Otimização</span>
                </li>
              </ul>
            </motion.div>

            {/* Agentes Autônomos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(12, 131, 254, 0.3)" }}
              transition={{ duration: 0.3 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl border border-[#22c55e]/20 p-8 cursor-pointer hover:border-[#22c55e]/50"
            >
              <h3 className="text-2xl font-bold mb-4 text-[#22c55e]">Agentes Autônomos</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Arquitetura de Agentes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>CrewAI e LangGraph</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Integração de Tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Automação de Tarefas</span>
                </li>
              </ul>
            </motion.div>

            {/* Projetos Práticos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(12, 131, 254, 0.3)" }}
              transition={{ duration: 0.3 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl border border-[#22c55e]/20 p-8 cursor-pointer hover:border-[#22c55e]/50"
            >
              <h3 className="text-2xl font-bold mb-4 text-[#22c55e]">Projetos Práticos</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>RAG e Deep Search avançado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Agentes de Busca</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Automação com IA</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#22c55e] mr-2">•</span>
                  <span>Deploy em Produção</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* O Que Dizem Nossos Alunos Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">O Que Dizem Nossos Alunos</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Histórias de sucesso de quem já participou dos treinamentos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(12, 131, 254, 0.3)" }}
              transition={{ duration: 0.3 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl border border-[#22c55e]/20 p-8 cursor-pointer hover:border-[#22c55e]/50"
            >
              <div className="mb-6">
                <p className="italic text-gray-300">"A Ciência dos Dados me deu as ferramentas práticas que eu precisava para implementar soluções de IA no mundo real."</p>
              </div>
              <div>
                <p className="font-bold">Aparecido Diniz</p>
                <p className="text-sm text-gray-400">Consultor @ Dinizq Consultores Associados</p>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(12, 131, 254, 0.3)" }}
              transition={{ duration: 0.3 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl border border-[#22c55e]/20 p-8 cursor-pointer hover:border-[#22c55e]/50"
            >
              <div className="mb-6">
                <p className="italic text-gray-300">"A abordagem hands-on do curso do Eduardo é fantástica. Consegui implementar um agente de IA logo na primeira semana."</p>
              </div>
              <div>
                <p className="font-bold">Claudiomir José</p>
                <p className="text-sm text-gray-400">Tech @ cjs@agent Crypto</p>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(12, 131, 254, 0.3)" }}
              transition={{ duration: 0.3 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl border border-[#22c55e]/20 p-8 cursor-pointer hover:border-[#22c55e]/50"
            >
              <div className="mb-6">
                <p className="italic text-gray-300">"O conhecimento em RAG e LLMs que adquiri com a Ciência dos Dados transformou a maneira como construir aplicações."</p>
              </div>
              <div>
                <p className="font-bold">Paulo Mazzia</p>
                <p className="text-sm text-gray-400">Head de Inteligência de Negócios @ Paipe</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e]/20 to-[#22c55e]/20 rounded-2xl blur-2xl" />
              <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-[#22c55e]/20">
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
