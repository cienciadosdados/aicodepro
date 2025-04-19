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
  const [isProgrammer, setIsProgrammer] = useState<boolean | null>(null);
  const [showError, setShowError] = useState(false);
  const [formStep, setFormStep] = useState<'qualification' | 'contact'>('qualification');

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

      console.log('Enviando dados para webhook:', data);

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
        utmSource: '',
        utmMedium: '',
        utmCampaign: ''
      };
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      utmSource: urlParams.get('utm_source') || '',
      utmMedium: urlParams.get('utm_medium') || '',
      utmCampaign: urlParams.get('utm_campaign') || ''
    };
  };

  // Função para formatar o número de telefone
  const formatPhoneNumber = (value: string) => {
    // Remover tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Aplicar a máscara conforme a quantidade de dígitos
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      // Limitar a 11 dígitos (DDD + 9 dígitos)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Verificar domínio e redirecionar se necessário
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('ai-labs')) {
      window.location.href = 'https://ai-code-pro.cienciadosdados.com' + window.location.pathname + window.location.search;
    }
    
    console.log('Formulário inicializado, formStep:', formStep);
  }, []);

  // Aplicar máscara de telefone
  useEffect(() => {
    const phoneInput = phoneInputRef.current;
    
    if (phoneInput) {
      const handleInput = (e: Event) => {
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
          
          input.setSelectionRange(cursorPos, cursorPos);
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
      
      const response = await fetch('/api/qualified-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          isProgrammer: isProgrammer === true, // Garantir valor booleano correto
          utmSource: utmParams.utmSource,
          utmMedium: utmParams.utmMedium,
          utmCampaign: utmParams.utmCampaign
        }),
      });
      
      console.log('Resposta da API:', await response.json());
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
    console.log('Selecionado:', value);
    setIsProgrammer(value);
    setFormStep('contact');
    setShowError(false);
  };

  return (
    <div className="hotmart-form-container">
      {/* Debug info */}
      <div className="hidden">
        <p>Debug: formStep = {formStep}</p>
        <p>Debug: isProgrammer = {isProgrammer === null ? 'null' : isProgrammer ? 'true' : 'false'}</p>
      </div>
      
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
            setFormStep('qualification');
            setShowError(true);
            return false;
          }
        }}
      >
        {/* Etapa de qualificação */}
        {formStep === 'qualification' && (
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
                onClick={() => handleQualificationSelection(true)}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${isProgrammer === true ? 'bg-[#0c83fe] border-[#0c83fe] text-white' : 'bg-black/20 border-white/20 text-white/70 hover:bg-black/30 hover:border-white/30'}`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => handleQualificationSelection(false)}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${isProgrammer === false ? 'bg-[#0c83fe] border-[#0c83fe] text-white' : 'bg-black/20 border-white/20 text-white/70 hover:bg-black/30 hover:border-white/30'}`}
              >
                Não
              </button>
            </div>
          </div>
        )}

        {/* Etapa de contato */}
        {formStep === 'contact' && (
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
                pattern="\([0-9]{2}\) [0-9]{5}-[0-9]{4}"
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
    </div>
  );
});

export { LeadForm };
