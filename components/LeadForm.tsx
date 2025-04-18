'use client';

import { memo, useEffect, useRef, useState } from 'react';

interface WebhookData {
  email: string;
  phone: string;
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  isProgrammer: boolean;
  date: string;
}

const LeadForm = memo(function LeadForm() {
  // Referência para o campo de telefone
  const phoneInputRef = useRef<HTMLInputElement>(null);
  
  // Estados do formulário - usando abordagem simples e direta
  const [showQualificationStep, setShowQualificationStep] = useState(true);
  const [showContactStep, setShowContactStep] = useState(false);
  const [isProgrammer, setIsProgrammer] = useState<boolean | null>(null);
  const [showError, setShowError] = useState(false);

  // Função para enviar dados ao webhook do n8n de forma silenciosa
  const sendToWebhook = (email: string, phone: string): void => {
    try {
      // Obter parâmetros UTM
      const utmParams = getUtmParameters();
      
      const data: WebhookData = {
        email,
        phone,
        source: typeof window !== 'undefined' ? window.location.href : '',
        utm_source: utmParams.utmSource,
        utm_medium: utmParams.utmMedium,
        utm_campaign: utmParams.utmCampaign,
        isProgrammer: isProgrammer === true, // Garantir valor booleano correto
        date: new Date().toISOString()
      };

      // Enviar dados de forma não-bloqueante
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        navigator.sendBeacon('https://n8n-n8n.sw7doq.easypanel.host/webhook/b0c23b1c-c818-4c27-90ce-116f3bfc69c4', blob);
      } else if (typeof fetch !== 'undefined') {
        // Fallback para fetch
        fetch('https://n8n-n8n.sw7doq.easypanel.host/webhook/b0c23b1c-c818-4c27-90ce-116f3bfc69c4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true
        }).catch(() => {/* Ignorar erros */});
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

  // Função para salvar lead qualificado na API
  const saveQualifiedLead = async (email: string, phone: string) => {
    try {
      const utmParams = getUtmParameters();
      
      await fetch('/api/qualified-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          isProgrammer: isProgrammer === true, // Garantir valor booleano correto (true se true, false em todos os outros casos)
          utmSource: utmParams.utmSource,
          utmMedium: utmParams.utmMedium,
          utmCampaign: utmParams.utmCampaign
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar lead qualificado:', error);
    }
  };

  // Capturar submissão do formulário
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const form = document.querySelector('form[klicksend-form-id="4puEQny"]') as HTMLFormElement;
    
    if (form) {
      const originalSubmitHandler = form.onsubmit;
      
      form.addEventListener('submit', function(e) {
        const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;
        
        if (emailInput && phoneInput) {
          sendToWebhook(emailInput.value, phoneInput.value);
          saveQualifiedLead(emailInput.value, phoneInput.value);
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
    // Definir valor booleano explicitamente
    setIsProgrammer(value);
    setShowQualificationStep(false);
    setShowContactStep(true);
    setShowError(false);
  };

  return (
    <div className="hotmart-form-container">
      <form 
        klicksend-form-id='4puEQny' 
        autoComplete='off' 
        method="post" 
        action="//handler.send.hotmart.com/subscription/4puEQny?redirectTo=https://ai-code-pro.cienciadosdados.com/obrigado"
        className="space-y-4"
        id="lead-form"
        onSubmit={(e) => {
          // Garantir redirecionamento correto
          const form = e.currentTarget;
          if (!form.action.includes('redirectTo=https://ai-code-pro.cienciadosdados.com/obrigado')) {
            form.action = form.action + (form.action.includes('?') ? '&' : '?') + 'redirectTo=https://ai-code-pro.cienciadosdados.com/obrigado';
          }

          // Verificar se respondeu à pergunta de qualificação
          if (isProgrammer === null) {
            e.preventDefault();
            setShowQualificationStep(true);
            setShowContactStep(false);
            setShowError(true);
            return false;
          }
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
                  // Usar true literal para garantir valor booleano correto
                  const trueValue = true;
                  handleQualificationSelection(trueValue);
                }}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${isProgrammer === true ? 'bg-[#0c83fe] border-[#0c83fe] text-white' : 'bg-black/20 border-white/20 text-white/70 hover:bg-black/30 hover:border-white/30'}`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => {
                  // Usar false literal para garantir valor booleano correto
                  const falseValue = false;
                  handleQualificationSelection(falseValue);
                }}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${isProgrammer === false ? 'bg-[#0c83fe] border-[#0c83fe] text-white' : 'bg-black/20 border-white/20 text-white/70 hover:bg-black/30 hover:border-white/30'}`}
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
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 transition-all duration-200"
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
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 transition-all duration-200"
              />
            </div>

            {/* Campo oculto para o honeypot anti-spam */}
            <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
              <input type="text" autoComplete='new-password' name="b_4puEQny" tabIndex={-1} value="" />
            </div>
            
            {/* Campo oculto para armazenar a resposta de qualificação */}
            <input 
              type="hidden" 
              name="isProgrammer" 
              value={isProgrammer === null ? '' : isProgrammer ? 'true' : 'false'} 
            />

            <button
              type="submit"
              klicksend-form-submit-id='4puEQny'
              className="w-full px-8 py-4 mt-4 rounded-xl bg-[#0c83fe] hover:bg-[#0c83fe]/90 text-white font-medium transition-all duration-200 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Quero me inscrever
              </span>
            </button>
          </div>
        )}
      </form>

      {/* Script para capturar UTMs e garantir o redirecionamento correto */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          var form = document.querySelector('form[klicksend-form-id="4puEQny"]');
          if (!form) return;
          
          var pageParams = new URLSearchParams(window.location.search);
          
          // Garantir que o redirecionamento seja para o domínio correto
          form.action = "//handler.send.hotmart.com/subscription/4puEQny?redirectTo=https://ai-code-pro.cienciadosdados.com/obrigado";
          
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
