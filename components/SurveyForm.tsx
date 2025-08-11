'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SurveyData {
  email: string;
  phone: string;
  is_programmer: boolean;
  idade: string;
  genero: string;
  usa_rag_llm: string;
  conhece_frameworks_ia: string;
  ja_programa_python: string;
  usa_ml_dl: string;
  faixa_salarial: string;
  profissao_atual: string;
  como_conheceu: string;
  tempo_conhece: string;
  o_que_tira_sono: string;
  expectativas_treinamento: string;
  sonho_realizar: string;
  maior_dificuldade: string;
  pergunta_cafe: string;
  impedimento_sonho: string;
  maior_desafio_ia: string;
  comprometido_projeto: string;
}

interface SurveyFormProps {
  email: string;
  phone: string;
  isProgrammer: boolean;
  sessionId: string;
  onComplete: () => void;
}

export default function SurveyForm({ email, phone, isProgrammer, sessionId, onComplete }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<SurveyData>>({
    email,
    phone,
    is_programmer: isProgrammer
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof SurveyData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Capturar UTM parameters
      const urlParams = new URLSearchParams(window.location.search);
      const utmData = {
        utm_source: urlParams.get('utm_source') || 'direct',
        utm_medium: urlParams.get('utm_medium') || 'none',
        utm_campaign: urlParams.get('utm_campaign') || 'none'
      };

      const surveyPayload = {
        ...formData,
        session_id: sessionId,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        ...utmData
      };

      console.log('📋 Enviando pesquisa:', surveyPayload);

      const response = await fetch('/api/save-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyPayload),
      });

      if (response.ok) {
        console.log('✅ Pesquisa salva com sucesso!');
        onComplete();
      } else {
        console.error('❌ Erro ao salvar pesquisa:', response.statusText);
        // Mesmo com erro, continuar o fluxo para não bloquear o usuário
        onComplete();
      }
    } catch (error) {
      console.error('❌ Erro ao enviar pesquisa:', error);
      // Mesmo com erro, continuar o fluxo
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Dados Pessoais</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quantos anos você tem? *
        </label>
        <select
          value={formData.idade || ''}
          onChange={(e) => handleInputChange('idade', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Selecione sua idade</option>
          <option value="18-24">18 a 24 anos</option>
          <option value="25-34">25 a 34 anos</option>
          <option value="35-44">35 a 44 anos</option>
          <option value="45-54">45 a 54 anos</option>
          <option value="55+">Mais de 55 anos</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Qual seu gênero? *
        </label>
        <select
          value={formData.genero || ''}
          onChange={(e) => handleInputChange('genero', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Selecione</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="prefiro-nao-dizer">Prefiro não dizer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Qual sua faixa salarial atualmente?
        </label>
        <select
          value={formData.faixa_salarial || ''}
          onChange={(e) => handleInputChange('faixa_salarial', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="ate-1500">Até R$ 1.500,00</option>
          <option value="1500-3000">Entre R$ 1.500,00 a R$ 3.000,00</option>
          <option value="3000-5000">Entre R$ 3.000,00 a R$ 5.000,00</option>
          <option value="5000-7000">Entre R$ 5.000,00 a R$ 7.000,00</option>
          <option value="7000-9000">Entre R$ 7.000,00 a R$ 9.000,00</option>
          <option value="9000-11000">Entre R$ 9.000,00 a R$ 11.000,00</option>
          <option value="acima-11000">Acima de R$ 11.000,00</option>
        </select>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Conhecimento Técnico</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Você já usa RAG ou outras técnicas com LLM's?
        </label>
        <select
          value={formData.usa_rag_llm || ''}
          onChange={(e) => handleInputChange('usa_rag_llm', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
          <option value="nem-sei">Nem sei o que é isso</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Você já conhece CrewAI, LangGraph ou outro framework de Agentes de IA?
        </label>
        <select
          value={formData.conhece_frameworks_ia || ''}
          onChange={(e) => handleInputChange('conhece_frameworks_ia', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
          <option value="nunca-ouvi">Nunca ouvi falar</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Você já programa Python?
        </label>
        <select
          value={formData.ja_programa_python || ''}
          onChange={(e) => handleInputChange('ja_programa_python', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Você já usa Machine Learning e Deep Learning?
        </label>
        <select
          value={formData.usa_ml_dl || ''}
          onChange={(e) => handleInputChange('usa_ml_dl', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Profissão e Descoberta</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Qual sua Profissão Atual? *
        </label>
        <input
          type="text"
          value={formData.profissao_atual || ''}
          onChange={(e) => handleInputChange('profissao_atual', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Ex: Desenvolvedor, Analista, Estudante..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Por onde você me conheceu? *
        </label>
        <select
          value={formData.como_conheceu || ''}
          onChange={(e) => handleInputChange('como_conheceu', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Selecione</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="youtube">YouTube</option>
          <option value="indicacao">Indicação</option>
          <option value="portal">Portal cienciadosdados.com</option>
          <option value="anuncio">Anúncio para o Treinamento Gratuito AI Code Pro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Há quanto tempo você me conhece? *
        </label>
        <select
          value={formData.tempo_conhece || ''}
          onChange={(e) => handleInputChange('tempo_conhece', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Selecione</option>
          <option value="menos-2-meses">Menos de 2 meses</option>
          <option value="6-meses">6 meses</option>
          <option value="1-ano">1 ano</option>
          <option value="2-anos">2 anos</option>
          <option value="mais-2-anos">Mais de 2 anos</option>
        </select>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Motivações e Desafios</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          O que realmente faz você ir dormir pensando naquilo, e, muitas vezes, faz você perder o sono?
        </label>
        <textarea
          value={formData.o_que_tira_sono || ''}
          onChange={(e) => handleInputChange('o_que_tira_sono', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
          placeholder="Compartilhe seus pensamentos..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quais as suas expectativas com o treinamento? *
        </label>
        <textarea
          value={formData.expectativas_treinamento || ''}
          onChange={(e) => handleInputChange('expectativas_treinamento', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
          placeholder="O que você espera aprender..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Qual sonho você deseja realizar através do conhecimento adquirido aqui? *
        </label>
        <textarea
          value={formData.sonho_realizar || ''}
          onChange={(e) => handleInputChange('sonho_realizar', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
          placeholder="Seu sonho profissional..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Qual é a sua maior dificuldade hoje? *
        </label>
        <textarea
          value={formData.maior_dificuldade || ''}
          onChange={(e) => handleInputChange('maior_dificuldade', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
          placeholder="Sua maior dificuldade..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Está comprometido a Criar o Projeto de Agents de IA, com RAG, LLM's e o que vier neste treinamento?
        </label>
        <select
          value={formData.comprometido_projeto || ''}
          onChange={(e) => handleInputChange('comprometido_projeto', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="sim">SIM</option>
          <option value="nao">Não</option>
        </select>
      </div>
    </motion.div>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.idade && formData.genero;
      case 2:
        return true; // Campos opcionais
      case 3:
        return formData.profissao_atual && formData.como_conheceu && formData.tempo_conhece;
      case 4:
        return formData.expectativas_treinamento && formData.sonho_realizar && formData.maior_dificuldade;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Pesquisa AI Code Pro
        </h2>
        <p className="text-gray-300">
          Obrigado por estar participando desta pesquisa. Através das suas respostas vou compartilhar exatamente o que você quer e precisa.
        </p>
        <p className="text-green-400 text-sm mt-2">
          Não leva nem 1 minuto. Valeu!
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Etapa {currentStep} de {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Steps */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={handleNextStep}
            disabled={!isStepValid()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próximo
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isStepValid() || isSubmitting}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Enviando...' : 'Finalizar'}
          </button>
        )}
      </div>
    </div>
  );
}
