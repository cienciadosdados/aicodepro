'use client';

import { memo, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Importar SurveyForm dinamicamente para evitar problemas de SSR
const SurveyForm = dynamic(() => import('./SurveyForm'), { ssr: false });

interface WebhookData {
  email: string;
  phone: string;
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  isProgrammer: boolean;
  date: string;
  tags: string;
}

interface LeadData {
  email: string;
  phone: string;
  isProgrammer: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  timestamp?: string;
  savedLocally?: boolean;
}

const LeadForm = memo(function LeadForm() {
  // Referência para o campo de telefone
  const phoneInputRef = useRef<HTMLInputElement>(null);
  
  // Estados do formulário - usando abordagem simples e direta
  const [showQualificationStep, setShowQualificationStep] = useState(true);
  const [showContactStep, setShowContactStep] = useState(false);
  const [isProgrammer, setIsProgrammer] = useState<boolean | null>(null);
  const [showError, setShowError] = useState(false);

  // Estado para controlar leads salvos localmente
  const [localLeads, setLocalLeads] = useState<LeadData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para ID da sessão único
  const [sessionId, setSessionId] = useState<string>('');
  
  // Estados para controlar a pesquisa
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState<string>('');
  const [capturedPhone, setCapturedPhone] = useState<string>('');

  // Função para enviar logs para nossa API de debug
  const sendDebugLog = async (type: string, message: string, data?: any) => {
    try {
      await fetch('/api/debug-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      // Falha silenciosa para não interferir no fluxo
    }
  };

  // Gerar ID único da sessão no carregamento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Verificar se já existe um sessionId no localStorage
      let existingSessionId = localStorage.getItem('aicodepro_sessionId');
      
      if (!existingSessionId) {
        // Gerar novo sessionId único
        existingSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('aicodepro_sessionId', existingSessionId);
      }
      
      setSessionId(existingSessionId);
      console.log('🆔 Session ID:', existingSessionId);
      
      // Enviar log do sessionId
      sendDebugLog('session', 'SessionId gerado/carregado', {
        sessionId: existingSessionId,
        isNew: !localStorage.getItem('aicodepro_sessionId')
      });
    }
  }, []);

  // Função para salvar lead localmente quando o servidor falhar
  const saveLeadLocally = (leadData: LeadData) => {
    try {
      // Adicionar timestamp
      const leadWithTimestamp = {
        ...leadData,
        timestamp: new Date().toISOString(),
        savedLocally: true
      };
      
      // Recuperar leads salvos anteriormente
      const savedLeadsJSON = localStorage.getItem('aicodepro_backup_leads') || '[]';
      const savedLeads: LeadData[] = JSON.parse(savedLeadsJSON);
      
      // Adicionar novo lead
      savedLeads.push(leadWithTimestamp);
      
      // Salvar no localStorage
      localStorage.setItem('aicodepro_backup_leads', JSON.stringify(savedLeads));
      
      // Atualizar estado
      setLocalLeads(savedLeads);
      
      console.log('✅ Lead salvo localmente com sucesso:', leadWithTimestamp);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar lead localmente:', error);
      return false;
    }
  };
  
  // Função para tentar enviar leads salvos localmente
  const trySendLocalLeads = async () => {
    try {
      const savedLeadsJSON = localStorage.getItem('aicodepro_backup_leads') || '[]';
      const savedLeads: LeadData[] = JSON.parse(savedLeadsJSON);
      
      if (savedLeads.length === 0) return;
      
      console.log(`🔄 Tentando enviar ${savedLeads.length} leads salvos localmente...`);
      
      // Criar uma cópia para não modificar o array original durante a iteração
      const leadsCopy = [...savedLeads];
      const successfullySync: number[] = [];
      
      for (let i = 0; i < leadsCopy.length; i++) {
        const lead = leadsCopy[i];
        
        try {
          // Tentar enviar para o webhook
          const blob = new Blob([JSON.stringify(lead)], {type: 'application/json'});
          const success = navigator.sendBeacon('/api/webhook-lead', blob);
          
          if (success) {
            successfullySync.push(i);
            console.log(`✅ Lead #${i} sincronizado com sucesso:`, lead.email);
          }
        } catch (error) {
          console.error(`❌ Erro ao sincronizar lead #${i}:`, error);
        }
      }
      
      // Remover leads sincronizados com sucesso
      if (successfullySync.length > 0) {
        const remainingLeads = savedLeads.filter((_, index) => !successfullySync.includes(index));
        localStorage.setItem('aicodepro_backup_leads', JSON.stringify(remainingLeads));
        setLocalLeads(remainingLeads);
        console.log(`✅ ${successfullySync.length} leads sincronizados e removidos do armazenamento local`);
      }
    } catch (error) {
      console.error('❌ Erro ao processar leads locais:', error);
    }
  };

  // Função para limpar leads antigos do localStorage
  const cleanOldLocalLeads = () => {
    try {
      const savedLeadsJSON = localStorage.getItem('aicodepro_backup_leads') || '[]';
      const savedLeads: LeadData[] = JSON.parse(savedLeadsJSON);
      
      if (savedLeads.length === 0) return;
      
      // Manter backup flexível - remover apenas leads muito antigos (24 horas)
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      const recentLeads = savedLeads.filter(lead => {
        if (!lead.timestamp) return true; // Manter leads sem timestamp
        const leadTime = new Date(lead.timestamp).getTime();
        return leadTime > twentyFourHoursAgo;
      });
      
      if (recentLeads.length !== savedLeads.length) {
        localStorage.setItem('aicodepro_backup_leads', JSON.stringify(recentLeads));
        setLocalLeads(recentLeads);
        console.log(`🧹 Removidos ${savedLeads.length - recentLeads.length} leads muito antigos (24h+) do localStorage`);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar leads antigos:', error);
    }
  };

  // Função para capturar lead parcial (apenas qualificação)
  const capturePartialLead = async (isProgrammerValue: boolean) => {
    try {
      console.log('🎯 CAPTURANDO LEAD PARCIAL:', isProgrammerValue);
      
      if (!sessionId) {
        console.error('❌ SessionId não disponível para captura parcial');
        sendDebugLog('error', 'SessionId não disponível para captura parcial', { sessionId });
        return;
      }
      
      // Obter parâmetros UTM
      const utmParams = getUtmParameters();
      
      const partialData = {
        sessionId: sessionId,
        isProgrammer: isProgrammerValue,
        utmSource: utmParams.utmSource,
        utmMedium: utmParams.utmMedium,
        utmCampaign: utmParams.utmCampaign,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        ipAddress: 'auto' // Será detectado pelo servidor
      };
      
      console.log('📤 Enviando lead parcial:', partialData);
      sendDebugLog('partial_lead', 'Enviando lead parcial', partialData);
      
      const response = await fetch('/api/partial-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partialData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Lead parcial capturado com sucesso:', result);
        sendDebugLog('success', 'Lead parcial capturado com sucesso', result);
        
        // Salvar confirmação no localStorage
        localStorage.setItem('aicodepro_partialCaptured', 'true');
        localStorage.setItem('aicodepro_partialTimestamp', new Date().toISOString());
      } else {
        console.error('❌ Erro ao capturar lead parcial:', result);
        sendDebugLog('error', 'Erro ao capturar lead parcial', result);
      }
      
    } catch (error) {
      console.error('💥 Erro inesperado ao capturar lead parcial:', error);
      sendDebugLog('error', 'Erro inesperado ao capturar lead parcial', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  };

  // Função para enviar dados ao webhook do n8n de forma silenciosa
  const sendToWebhook = (email: string, phone: string): void => {
    try {
      // REMOVIDO: trySendLocalLeads() que causava envios duplicados
      // Leads locais serão enviados apenas em momento apropriado
      
      // Obter parâmetros UTM
      const utmParams = getUtmParameters();
      
      // 🔍 DEBUG: Log detalhado do estado isProgrammer
      console.log('🔍 DEBUG sendToWebhook - Estado isProgrammer:', {
        isProgrammer: isProgrammer,
        type: typeof isProgrammer,
        isTrue: isProgrammer === true,
        isFalse: isProgrammer === false,
        isNull: isProgrammer === null
      });
      
      const data: WebhookData = {
        email,
        phone,
        source: typeof window !== 'undefined' ? window.location.href : '',
        utm_source: utmParams.utmSource,
        utm_medium: utmParams.utmMedium,
        utm_campaign: utmParams.utmCampaign,
        isProgrammer: isProgrammer === true,
        date: new Date().toISOString(),
        tags: 'AI-Code-Pro-06-21'
      };

      console.log('📤 Enviando dados para webhook N8N:', data);
      console.log('🔍 isProgrammer no payload N8N:', data.isProgrammer, typeof data.isProgrammer);

      // Envio para webhook N8N específico (automações + Manychat)
      fetch('https://n8n-n8n.4j4kv9.easypanel.host/webhook/8ae18fa9-3b36-489b-b125-171305fd79ef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch((error) => {
        console.error('Erro ao enviar dados para webhook N8N:', error);
      });

      console.log('📤 Dados enviados para webhook N8N');

      // ÚNICO ENVIO para nosso endpoint interno usando sendBeacon
      // Isso garante que o lead seja salvo no Supabase apenas uma vez
      if (navigator.sendBeacon) {
        const internalData = {
          email,
          phone,
          sessionId: sessionId, // Incluir sessionId para buscar dados parciais
          isProgrammer: isProgrammer === true, // Fallback caso não encontre dados parciais
          utmSource: utmParams.utmSource,
          utmMedium: utmParams.utmMedium,
          utmCampaign: utmParams.utmCampaign
        };
        
        // Validação crítica do sessionId
        if (!sessionId || sessionId.trim() === '') {
          console.error('🚨 ERRO CRÍTICO: SessionId está vazio!');
          console.log('🔍 Estado atual do sessionId:', sessionId);
          console.log('🔍 localStorage sessionId:', localStorage.getItem('aicodepro_sessionId'));
          
          sendDebugLog('critical_error', 'SessionId vazio no momento da submissão', {
            sessionId,
            localStorageSessionId: localStorage.getItem('aicodepro_sessionId'),
            isProgrammer
          });
          
          // Tentar recuperar do localStorage
          const recoveredSessionId = localStorage.getItem('aicodepro_sessionId');
          if (recoveredSessionId) {
            console.log('🔄 Recuperando sessionId do localStorage:', recoveredSessionId);
            setSessionId(recoveredSessionId);
            // Usar o sessionId recuperado
            internalData.sessionId = recoveredSessionId;
          } else {
            console.error('❌ Não foi possível recuperar sessionId. Enviando sem sessionId.');
            sendDebugLog('critical_error', 'Impossível recuperar sessionId', {});
          }
        }

        console.log('📤 Enviando dados para Supabase via sendBeacon:', internalData);
        console.log('🔍 isProgrammer no payload Supabase:', internalData.isProgrammer, typeof internalData.isProgrammer);
        console.log('🆔 SessionId no payload:', internalData.sessionId);
        
        // Enviar log detalhado
        sendDebugLog('form_submit', 'Enviando dados completos para Supabase', {
          email: internalData.email,
          hasSessionId: !!internalData.sessionId,
          sessionId: internalData.sessionId,
          isProgrammer: internalData.isProgrammer,
          isProgrammerType: typeof internalData.isProgrammer
        });
        
        const blob = new Blob([JSON.stringify(internalData)], {type: 'application/json'});
        const success = navigator.sendBeacon('/api/webhook-lead', blob);
        console.log('✅ Envio único para Supabase via sendBeacon:', success ? 'Sucesso' : 'Falha');
        
        sendDebugLog('beacon_result', 'Resultado do sendBeacon', { success });
        
        // APENAS salvar localmente se o envio falhar
        if (!success) {
          console.log('⚠️ Envio falhou, salvando localmente para retry posterior');
          saveLeadLocally(internalData);
        } else {
          console.log('✅ Envio bem-sucedido, não salvando localmente');
        }
      }
    } catch (error) {
      console.error('Erro ao enviar dados para webhook:', error);
    }
  };
  
  // Função para obter parâmetros UTM
  const getUtmParameters = () => {
    if (typeof window === 'undefined') {
      return {
        utmSource: 'default_source',
        utmMedium: 'default_medium',
        utmCampaign: 'default_campaign'
      };
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    
    // Valores padrão para teste
    return {
      utmSource: urlParams.get('utm_source') || 'dev_test',
      utmMedium: urlParams.get('utm_medium') || 'local_testing',
      utmCampaign: urlParams.get('utm_campaign') || 'dev_campaign'
    };
  };

  // Função para formatar o número de telefone - versão mais robusta
  const formatPhoneNumber = (value: string) => {
    // Remover tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Garantir que temos pelo menos alguns dígitos
    if (numbers.length === 0) return '';
    
    // Aplicar a máscara conforme a quantidade de dígitos
    // Formato internacional para compatibilidade
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      // Limitar a 11 dígitos (DDD + 9 dígitos) para celulares brasileiros
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Verificar domínio e redirecionar se necessário
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('ai-labs')) {
      window.location.href = 'https://ai-code-pro.cienciadosdados.com' + window.location.pathname + window.location.search;
    }
  }, []);

  // Aplicar máscara de telefone com tratamento de erros
  useEffect(() => {
    const phoneInput = phoneInputRef.current;
    
    if (phoneInput) {
      const handleInput = (e: Event) => {
        try {
          const input = e.target as HTMLInputElement;
          const formattedValue = formatPhoneNumber(input.value);
          
          // Só atualizar se o valor formatado for diferente
          if (input.value !== formattedValue) {
            // Preservar a posição do cursor
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const oldLength = input.value.length;
            
            input.value = formattedValue;
            
            // Ajustar a posição do cursor após a formatação
            const newLength = input.value.length;
            const cursorPos = start && start + (newLength - oldLength) > 0 ? start + (newLength - oldLength) : newLength;
            
            try {
              input.setSelectionRange(cursorPos, cursorPos);
            } catch (err) {
              console.warn('Erro ao ajustar cursor:', err);
            }
          }
        } catch (error) {
          console.error('Erro na formatação do telefone:', error);
          // Não fazer nada em caso de erro para não bloquear o usuário
        }
      };
      
      phoneInput.addEventListener('input', handleInput);
      return () => phoneInput.removeEventListener('input', handleInput);
    }
  }, []);

  // Tentar enviar leads salvos localmente apenas no carregamento da página
  useEffect(() => {
    // Aguardar um pouco para garantir que a página carregou completamente
    const timer = setTimeout(() => {
      // Limpar leads antigos (mais de 24 horas) antes de tentar reenviar
      cleanOldLocalLeads();
      trySendLocalLeads();
    }, 2000);

    return () => clearTimeout(timer);
  }, []); // Executar apenas uma vez no carregamento

  // Capturar submissão do formulário
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const form = document.querySelector('form[klicksend-form-id="jruEyoV"]') as HTMLFormElement;
    
    if (form) {
      const originalSubmitHandler = form.onsubmit;
      
      form.addEventListener('submit', function(e) {
        // Prevenir múltiplas submissões
        if (isSubmitting) {
          console.log('⚠️ Submissão já em andamento, ignorando...');
          e.preventDefault();
          return false;
        }
        
        setIsSubmitting(true);
        
        // Reset do estado após 5 segundos (timeout de segurança)
        setTimeout(() => {
          setIsSubmitting(false);
        }, 5000);
        
        const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;
        const isProgrammerInput = form.querySelector('input[name="isProgrammer"]') as HTMLInputElement;
        
        // Log para depuração
        console.log('✅ Submissão do formulário iniciada!');
        console.log('📧 Email:', emailInput?.value);
        console.log('📱 Telefone:', phoneInput?.value);
        console.log('🔍 Campo hidden isProgrammer:', isProgrammerInput?.value);
        console.log('🔍 Estado React isProgrammer:', isProgrammer);
        console.log('🔍 Tipo do estado isProgrammer:', typeof isProgrammer);
        console.log('🔍 isProgrammer === true?', isProgrammer === true);
        console.log('🔍 isProgrammer === false?', isProgrammer === false);
        console.log('🔍 isProgrammer === null?', isProgrammer === null);
        
        // Verificar localStorage também
        try {
          const localStorageValue = localStorage.getItem('aicodepro_isProgrammer');
          console.log('🔍 localStorage isProgrammer:', localStorageValue);
        } catch (error) {
          console.log('⚠️ Erro ao ler localStorage:', error);
        }
        
        // Garantir que temos os dados necessários
        if (emailInput && phoneInput) {
          try {
            // Salvar o valor de isProgrammer no localStorage antes da navegação
            // Isso pode ajudar na depuração posterior
            localStorage.setItem('aicodepro_last_submission', JSON.stringify({
              email: emailInput.value,
              phone: phoneInput.value,
              isProgrammer: isProgrammer,
              timestamp: new Date().toISOString()
            }));
          } catch (storageError) {
            console.error('Erro ao salvar em localStorage:', storageError);
          }
          
          // Enviar para webhook do Hotmart e para nosso endpoint interno
          // Esta função agora também envia para o endpoint /api/webhook-lead
          sendToWebhook(emailInput.value, phoneInput.value);
          
          // REMOVIDO: Salvamento local redundante
          // O sendToWebhook já salva localmente apenas se o envio falhar
        }
        
        if (originalSubmitHandler) {
          return originalSubmitHandler.call(form, e);
        }
        return true;
      });
    }
  }, []);

  // Função para lidar com a seleção de qualificação
  const handleQualificationSelection = (value: boolean) => {
    console.log('🎯 INÍCIO handleQualificationSelection');
    console.log('🔍 Parâmetro recebido:', value, typeof value);
    console.log('🔍 Estado atual antes da mudança:', isProgrammer);
    
    // Definir valor booleano explicitamente
    console.log('📝 Seleção de qualificação:', value, typeof value);
    
    // Garantir que o valor seja um booleano explícito
    const boolValue = value === true;
    console.log('🔍 Valor após conversão (value === true):', boolValue, typeof boolValue);
    
    // Atualizar o estado
    setIsProgrammer(boolValue);
    console.log('✅ Estado isProgrammer atualizado para:', boolValue);
    
    // Atualizar também o campo oculto se ele já existir
    setTimeout(() => {
      try {
        const hiddenField = document.getElementById('isProgrammerField') as HTMLInputElement;
        if (hiddenField) {
          hiddenField.value = boolValue ? 'true' : 'false';
          hiddenField.setAttribute('data-value-type', typeof boolValue);
          hiddenField.setAttribute('data-is-programmer-state', String(boolValue));
          console.log('📝 Campo oculto atualizado com:', hiddenField.value);
          console.log('📝 Atributos do campo oculto:', {
            value: hiddenField.value,
            dataValueType: hiddenField.getAttribute('data-value-type'),
            dataIsProgrammerState: hiddenField.getAttribute('data-is-programmer-state')
          });
        } else {
          console.log('⚠️ Campo oculto isProgrammerField não encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar campo oculto:', error);
      }
    }, 0);
    
    // Atualizar a UI
    setShowQualificationStep(false);
    setShowContactStep(true);
    setShowError(false);
    
    // Salvar a seleção em localStorage para persistência
    try {
      localStorage.setItem('aicodepro_isProgrammer', String(boolValue));
      console.log('💾 Valor isProgrammer salvo em localStorage:', boolValue);
    } catch (error) {
      console.error('❌ Erro ao salvar em localStorage:', error);
    }
    
    // Capturar lead parcial
    capturePartialLead(boolValue);
    
    console.log('🏁 FIM handleQualificationSelection');
  };

  // Função para lidar com a conclusão da pesquisa
  const handleSurveyComplete = () => {
    console.log('✅ Pesquisa concluída, redirecionando...');
    setSurveyCompleted(true);
    
    // Redirecionar para a página de obrigado com o email
    const redirectUrl = `/obrigado?email=${encodeURIComponent(capturedEmail)}`;
    console.log('🔄 Redirecionando para:', redirectUrl);
    
    // Usar timeout para dar tempo de salvar a pesquisa
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1000);
  };

  // Se a pesquisa deve ser exibida, mostrar o componente SurveyForm
  if (showSurvey && !surveyCompleted) {
    return (
      <div className="survey-container">
        <SurveyForm
          email={capturedEmail}
          phone={capturedPhone}
          isProgrammer={isProgrammer || false}
          sessionId={sessionId}
          onComplete={handleSurveyComplete}
        />
      </div>
    );
  }

  return (
    <div className="hotmart-form-container">
      <form 
        klicksend-form-id='jruEyoV' 
        autoComplete='off' 
        method="post" 
        action="//handler.send.hotmart.com/subscription/jruEyoV?redirectTo=https://ai-code-pro.cienciadosdados.com/obrigado"
        className="space-y-4"
        id="lead-form"
        onSubmit={(e) => {
          // Verificar se respondeu à pergunta de qualificação
          if (isProgrammer === null) {
            e.preventDefault();
            setShowQualificationStep(true);
            setShowContactStep(false);
            setShowError(true);
            console.log('Formulário bloqueado: usuário não respondeu à pergunta de qualificação');
            return false;
          }

          // Interceptar submissão para mostrar pesquisa
          e.preventDefault();
          
          // Capturar dados do formulário
          const formData = new FormData(e.currentTarget);
          const email = formData.get('email') as string;
          const phone = formData.get('phone') as string;
          
          console.log('📝 Dados capturados:', { email, phone, isProgrammer });
          
          // Salvar dados capturados
          setCapturedEmail(email);
          setCapturedPhone(phone);
          
          // Enviar dados para os webhooks existentes
          sendToWebhook(email, phone);
          
          // Mostrar pesquisa
          setShowSurvey(true);
          setShowQualificationStep(false);
          setShowContactStep(false);
          
          console.log('📋 Exibindo pesquisa para:', email);
        }}
      >
        {/* Etapa de qualificação */}
        {showQualificationStep && (
          <div className="qualification-step mb-4">
            <div className="text-center mb-3">
              <p className="text-white text-sm font-medium">Você já programa?</p>
              {showError && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  Responda antes de prosseguir
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => {
                  console.log('🟢 CLIQUE BOTÃO SIM - Antes da seleção');
                  console.log('🔍 Estado atual isProgrammer:', isProgrammer);
                  // Usar true literal para garantir valor booleano correto
                  const trueValue = true;
                  console.log('🔍 Valor que será passado:', trueValue, typeof trueValue);
                  handleQualificationSelection(trueValue);
                  console.log('🟢 CLIQUE BOTÃO SIM - Após handleQualificationSelection');
                }}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${isProgrammer === true ? 'bg-[#22c55e] border-[#22c55e] text-white' : 'bg-black/20 border-white/20 text-white/70 hover:bg-black/30 hover:border-white/30'}`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('🔴 CLIQUE BOTÃO NÃO - Antes da seleção');
                  console.log('🔍 Estado atual isProgrammer:', isProgrammer);
                  // Usar false literal para garantir valor booleano correto
                  const falseValue = false;
                  console.log('🔍 Valor que será passado:', falseValue, typeof falseValue);
                  handleQualificationSelection(falseValue);
                  console.log('🔴 CLIQUE BOTÃO NÃO - Após handleQualificationSelection');
                }}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${isProgrammer === false ? 'bg-[#22c55e] border-[#22c55e] text-white' : 'bg-black/20 border-white/20 text-white/70 hover:bg-black/30 hover:border-white/30'}`}
              >
                Não
              </button>
            </div>
          </div>
        )}

        {/* Etapa de contato */}
        {showContactStep && (
          <div className="contact-step">
            <div>
              <input
                type="email"
                autoComplete="off"
                name="email"
                id="email"
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 transition-all duration-200"
              />
            </div>
            
            <div className="mt-4">
              <input
                type="tel"
                autoComplete="tel"
                name="phone"
                id="phone"
                ref={phoneInputRef}
                placeholder="(00) 00000-0000"
                required
                pattern=".*[0-9]{8,}.*"
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 transition-all duration-200"
              />
            </div>

            {/* Campo oculto para o honeypot anti-spam */}
            <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
              <input type="text" autoComplete='new-password' name="b_jruEyoV" tabIndex={-1} value="" />
            </div>
            
            {/* Campo oculto para armazenar a resposta de qualificação */}
            <input 
              type="hidden" 
              name="isProgrammer" 
              id="isProgrammerField"
              value={isProgrammer === null ? '' : isProgrammer === true ? 'true' : 'false'} 
              data-value-type={typeof isProgrammer}
              data-is-programmer-state={String(isProgrammer)}
            />

            <button
              type="submit"
              klicksend-form-submit-id='jruEyoV'
              disabled={isSubmitting}
              className={`w-full px-8 py-4 mt-4 rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-medium transition-all duration-200 relative overflow-hidden ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? 'Enviando...' : 'Quero me inscrever'}
              </span>
            </button>
          </div>
        )}
      </form>

      {/* Script para capturar UTMs e garantir o redirecionamento correto */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          var form = document.querySelector('form[klicksend-form-id="jruEyoV"]');
          if (!form) return;
          
          var pageParams = new URLSearchParams(window.location.search);
          
          // Garantir que o redirecionamento seja para o domínio correto
          form.action = "//handler.send.hotmart.com/subscription/jruEyoV?redirectTo=https://ai-code-pro.cienciadosdados.com/obrigado";
          
          // Adicionar UTMs e outros parâmetros da URL
          if (pageParams.toString()) {
            form.action += "&" + pageParams.toString();
          }
        });
      `}} />
    </div>
  );
});

export { LeadForm };
