'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { FloatingGrid } from '@/components/ui/floating-grid';

interface SurveyData {
  // Dados de identificação
  email: string;
  phone: string;
  is_programmer: boolean;
  
  // Demográficos
  idade: string;
  genero: string;
  faixa_salarial: string;
  
  // Conhecimento técnico
  usa_rag_llm: string;
  conhece_frameworks_ia: string;
  ja_e_programador: string;
  ja_programa_python: string;
  usa_ml_dl: string;
  
  // Profissional
  profissao_atual: string;
  como_conheceu: string;
  tempo_conhece: string;
  
  // Motivações e desafios (textos livres)
  o_que_tira_sono: string;
  expectativas_treinamento: string;
  sonho_realizar: string;
  maior_dificuldade: string;
  pergunta_cafe: string;
  impedimento_sonho: string;
  maior_desafio_ia: string;
  
  // Comprometimento
  comprometido_projeto: string;
  
  // Index signature para permitir acesso dinâmico
  [key: string]: string | boolean | any;
}

function PesquisaContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Dados vindos da URL (email e phone)
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const isProgrammer = searchParams.get('isProgrammer') === 'true';
  
  const [surveyData, setSurveyData] = useState<SurveyData>({
    email,
    phone,
    is_programmer: isProgrammer,
    
    // Dados demográficos
    idade: '',
    genero: '',
    faixa_salarial: '',
    
    // Conhecimento técnico
    usa_rag_llm: '',
    conhece_frameworks_ia: '',
    ja_e_programador: isProgrammer ? 'Sim' : 'Não',
    ja_programa_python: '',
    usa_ml_dl: '',
    
    // Profissional
    profissao_atual: '',
    como_conheceu: '',
    tempo_conhece: '',
    
    // Motivações e desafios
    o_que_tira_sono: '',
    expectativas_treinamento: '',
    sonho_realizar: '',
    maior_dificuldade: '',
    pergunta_cafe: '',
    impedimento_sonho: '',
    maior_desafio_ia: '',
    
    // Comprometimento
    comprometido_projeto: ''
  });

  const handleInputChange = (field: keyof SurveyData, value: string | boolean) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Verificar se campos obrigatórios estão preenchidos
    const missingFields = [];
    if (!surveyData.email || surveyData.email.trim() === '') {
      missingFields.push('email');
    }
    if (!surveyData.phone || surveyData.phone.trim() === '') {
      missingFields.push('phone');
    }
    if (surveyData.is_programmer === undefined || surveyData.is_programmer === null) {
      missingFields.push('is_programmer');
    }
    if (!surveyData.profissao_atual || surveyData.profissao_atual.trim() === '') {
      missingFields.push('profissao_atual');
    }
    if (!surveyData.como_conheceu || surveyData.como_conheceu.trim() === '') {
      missingFields.push('como_conheceu');
    }
    if (!surveyData.tempo_conhece || surveyData.tempo_conhece.trim() === '') {
      missingFields.push('tempo_conhece');
    }

    // Se faltam campos obrigatórios, ir para etapa de identificação
    if (missingFields.length > 0) {
      console.log('⚠️ Campos obrigatórios faltando:', missingFields);
      setCurrentStep(6); // Nova etapa de identificação
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('/api/save-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...surveyData,
          session_id: Date.now().toString(),
          ip_address: 'unknown',
          user_agent: navigator.userAgent,
          utm_source: 'direct',
          utm_medium: 'website',
          utm_campaign: 'ai-code-pro'
        }),
      });

      const result = await response.json();
      console.log('📥 Resposta da API:', result);

      if (response.ok || result.success || result.backup) {
        setIsCompleted(true);
        console.log('✅ Pesquisa salva com sucesso!', result);
        
        // Redirecionar para página de obrigado após 4 segundos
        setTimeout(() => {
          window.location.href = '/obrigado?pesquisa=concluida';
        }, 4000);
      } else {
        console.error('❌ Erro ao salvar pesquisa:', result);
        alert(`Erro ao salvar pesquisa: ${result.error || 'Tente novamente'}`);
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      alert('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 6) {
      // Etapa de identificação, tentar submeter novamente
      handleSubmit();
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return surveyData.idade && surveyData.genero;
      case 2:
        return surveyData.ja_e_programador;
      case 3:
        return surveyData.profissao_atual && surveyData.como_conheceu && surveyData.tempo_conhece;
      case 4:
        return surveyData.expectativas_treinamento && surveyData.sonho_realizar && surveyData.maior_dificuldade;
      case 5:
        return true; // Campos opcionais
      case 6:
        return surveyData.email && surveyData.email.trim() !== '' && 
               surveyData.phone && surveyData.phone.trim() !== '' &&
               surveyData.is_programmer !== undefined; // Etapa de identificação
      default:
        return false;
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <FloatingGrid />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-4 text-[#0c83fe]">
            Pesquisa Concluída!
          </h1>
          <p className="text-gray-300 mb-4">
            Obrigado por suas respostas! Isso nos ajudará muito a personalizar o conteúdo.
          </p>
          <p className="text-sm text-gray-400">
            Redirecionando em alguns segundos...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingGrid />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-[#0c83fe]">AI Code Pro</span> - Pesquisa
            </h1>
            <p className="text-gray-300">
              Ajude-nos a personalizar o conteúdo para você
            </p>
            
            {/* Progress Bar */}
            <div className="mt-6 bg-gray-800 rounded-full h-2">
              <div 
                className="bg-[#0c83fe] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Math.min(currentStep, 5) / 5) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {currentStep <= 5 ? `Etapa ${currentStep} de 5` : 'Finalizando cadastro'}
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            
            {/* Etapa 1 - Dados Pessoais */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-[#0c83fe]">
                  Dados Pessoais
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quantos anos você tem? *
                    </label>
                    <select
                      value={surveyData.idade}
                      onChange={(e) => handleInputChange('idade', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="18-24">18-24 anos</option>
                      <option value="25-34">25-34 anos</option>
                      <option value="35-44">35-44 anos</option>
                      <option value="45-54">45-54 anos</option>
                      <option value="55+">55+ anos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Qual seu gênero? *
                    </label>
                    <select
                      value={surveyData.genero}
                      onChange={(e) => handleInputChange('genero', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Prefiro não dizer">Prefiro não dizer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Faixa salarial
                    </label>
                    <select
                      value={surveyData.faixa_salarial}
                      onChange={(e) => handleInputChange('faixa_salarial', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Até R$ 1.500">Até R$ 1.500</option>
                      <option value="R$ 1.500 - R$ 3.000">R$ 1.500 - R$ 3.000</option>
                      <option value="R$ 3.000 - R$ 5.000">R$ 3.000 - R$ 5.000</option>
                      <option value="R$ 5.000 - R$ 10.000">R$ 5.000 - R$ 10.000</option>
                      <option value="Acima de R$ 10.000">Acima de R$ 10.000</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Etapa 2 - Conhecimento Técnico */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-[#0c83fe]">
                  Conhecimento Técnico
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Você já usa RAG ou outras técnicas com LLM's?
                    </label>
                    <select
                      value={surveyData.usa_rag_llm}
                      onChange={(e) => handleInputChange('usa_rag_llm', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="Nem sei o que é isso">Nem sei o que é isso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Você já conhece CrewAI, LangGraph?
                    </label>
                    <select
                      value={surveyData.conhece_frameworks_ia}
                      onChange={(e) => handleInputChange('conhece_frameworks_ia', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="Nunca ouvi falar">Nunca ouvi falar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Você já é programador? *
                    </label>
                    <select
                      value={surveyData.ja_e_programador}
                      onChange={(e) => handleInputChange('ja_e_programador', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Você já programa Python?
                    </label>
                    <select
                      value={surveyData.ja_programa_python}
                      onChange={(e) => handleInputChange('ja_programa_python', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Você já usa ML e DL?
                    </label>
                    <select
                      value={surveyData.usa_ml_dl}
                      onChange={(e) => handleInputChange('usa_ml_dl', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Etapa 3 - Profissão e Descoberta */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-[#0c83fe]">
                  Profissão e Descoberta
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Qual sua Profissão Atual? *
                    </label>
                    <input
                      type="text"
                      value={surveyData.profissao_atual}
                      onChange={(e) => handleInputChange('profissao_atual', e.target.value)}
                      placeholder="Ex: Desenvolvedor, Analista, Estudante..."
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Por onde você me conheceu? *
                    </label>
                    <select
                      value={surveyData.como_conheceu}
                      onChange={(e) => handleInputChange('como_conheceu', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="YouTube">YouTube</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Google">Google</option>
                      <option value="Indicação de amigo">Indicação de amigo</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Há quanto tempo você me conhece? *
                    </label>
                    <select
                      value={surveyData.tempo_conhece}
                      onChange={(e) => handleInputChange('tempo_conhece', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Menos de 2 meses">Menos de 2 meses</option>
                      <option value="2-6 meses">2-6 meses</option>
                      <option value="6 meses - 1 ano">6 meses - 1 ano</option>
                      <option value="Mais de 1 ano">Mais de 1 ano</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Etapa 4 - Motivações e Expectativas */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-[#0c83fe]">
                  Motivações e Expectativas
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      O que faz você perder o sono?
                    </label>
                    <textarea
                      value={surveyData.o_que_tira_sono}
                      onChange={(e) => handleInputChange('o_que_tira_sono', e.target.value)}
                      placeholder="Conte-nos o que te preocupa..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expectativas com o treinamento? *
                    </label>
                    <textarea
                      value={surveyData.expectativas_treinamento}
                      onChange={(e) => handleInputChange('expectativas_treinamento', e.target.value)}
                      placeholder="O que você espera aprender?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Qual sonho deseja realizar? *
                    </label>
                    <textarea
                      value={surveyData.sonho_realizar}
                      onChange={(e) => handleInputChange('sonho_realizar', e.target.value)}
                      placeholder="Compartilhe seu sonho profissional..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Maior dificuldade hoje? *
                    </label>
                    <textarea
                      value={surveyData.maior_dificuldade}
                      onChange={(e) => handleInputChange('maior_dificuldade', e.target.value)}
                      placeholder="Qual sua maior dificuldade atual?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Etapa 5 - Perguntas Finais */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-[#0c83fe]">
                  Perguntas Finais
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Se pudesse tomar um café comigo qual pergunta faria?
                    </label>
                    <textarea
                      value={surveyData.pergunta_cafe}
                      onChange={(e) => handleInputChange('pergunta_cafe', e.target.value)}
                      placeholder="Que pergunta você faria?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Principal razão impedindo sonho profissional?
                    </label>
                    <textarea
                      value={surveyData.impedimento_sonho}
                      onChange={(e) => handleInputChange('impedimento_sonho', e.target.value)}
                      placeholder="O que te impede de realizar seu sonho?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Maior desafio quando assunto é IA?
                    </label>
                    <textarea
                      value={surveyData.maior_desafio_ia}
                      onChange={(e) => handleInputChange('maior_desafio_ia', e.target.value)}
                      placeholder="Qual seu maior desafio com IA?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Comprometido com projeto Agents IA?
                    </label>
                    <select
                      value={surveyData.comprometido_projeto}
                      onChange={(e) => handleInputChange('comprometido_projeto', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/80 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="SIM">SIM</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Etapa 6 - Identificação (quando dados estão faltando) */}
            {currentStep === 6 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-[#0c83fe]">
                  Dados de Identificação
                </h2>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500 text-lg">⚠️</span>
                    <h3 className="text-yellow-500 font-medium">Informações necessárias</h3>
                  </div>
                  <p className="text-yellow-100 text-sm">
                    Para finalizar sua pesquisa, precisamos de algumas informações básicas de identificação.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={surveyData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Telefone/WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={surveyData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Você já programa? *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('is_programmer', true);
                          handleInputChange('ja_e_programador', 'Sim');
                        }}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          surveyData.is_programmer === true
                            ? 'border-[#0c83fe] bg-[#0c83fe]/10 text-[#0c83fe]'
                            : 'border-white/20 bg-black/20 text-gray-300 hover:border-white/40'
                        }`}
                      >
                        <div className="text-2xl mb-2">👨‍💻</div>
                        <div className="font-medium">Sim</div>
                        <div className="text-xs opacity-70">Já programo</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('is_programmer', false);
                          handleInputChange('ja_e_programador', 'Não');
                        }}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          surveyData.is_programmer === false
                            ? 'border-[#0c83fe] bg-[#0c83fe]/10 text-[#0c83fe]'
                            : 'border-white/20 bg-black/20 text-gray-300 hover:border-white/40'
                        }`}
                      >
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="font-medium">Não</div>
                        <div className="text-xs opacity-70">Quero aprender</div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Botões de Navegação */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Anterior
              </button>

              <button
                onClick={nextStep}
                disabled={!isStepValid() || isSubmitting}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  !isStepValid() || isSubmitting
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0c83fe] text-white hover:bg-[#0c83fe]/90'
                }`}
              >
                {isSubmitting ? 'Enviando...' : currentStep === 5 ? 'Finalizar' : 'Próximo'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PesquisaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c83fe] mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando pesquisa...</p>
        </div>
      </div>
    }>
      <PesquisaContent />
    </Suspense>
  );
}
