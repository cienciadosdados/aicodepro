'use client';

import { memo, useEffect, useRef } from 'react';

interface WebhookData {
  email: string;
  phone: string;
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  date: string;
}

const LeadForm = memo(function LeadForm() {
  // Referência para o campo de telefone
  const phoneInputRef = useRef<HTMLInputElement>(null);
  // Função para enviar dados ao webhook do n8n de forma silenciosa
  const sendToWebhook = (email: string, phone: string): void => {
    try {
      const data: WebhookData = {
        email,
        phone,
        source: window.location.href,
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || '',
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
        date: new Date().toISOString()
      };
      
      // Usando um beacon para envio não-bloqueante (funciona como um pixel)
      const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
      navigator.sendBeacon('https://n8n-n8n.sw7doq.easypanel.host/webhook/b0c23b1c-c818-4c27-90ce-116f3bfc69c4', blob);
      
      // Fallback para fetch caso sendBeacon não seja suportado
      if (!navigator.sendBeacon) {
        fetch('https://n8n-n8n.sw7doq.easypanel.host/webhook/b0c23b1c-c818-4c27-90ce-116f3bfc69c4', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          // Não esperar pela resposta
          keepalive: true
        });
      }
    } catch (error) {
      console.error('Erro ao enviar dados para webhook complementar:', error);
      // Não interferir no fluxo principal mesmo se houver erro
    }
  };
  
  // Função para formatar o número de telefone automaticamente
  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formata o número de acordo com o padrão brasileiro
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Hook para aplicar a máscara de telefone
  useEffect(() => {
    const phoneInput = phoneInputRef.current;
    
    if (phoneInput) {
      const handleInput = (e: Event) => {
        const input = e.target as HTMLInputElement;
        const formattedValue = formatPhoneNumber(input.value);
        input.value = formattedValue;
      };
      
      phoneInput.addEventListener('input', handleInput);
      
      return () => {
        phoneInput.removeEventListener('input', handleInput);
      };
    }
  }, []);
  
  // Hook para capturar a submissão do formulário sem interferir no fluxo original
  useEffect(() => {
    const form = document.querySelector('form[klicksend-form-id="4puEQny"]') as HTMLFormElement;
    
    if (form) {
      const originalSubmitHandler = form.onsubmit;
      
      form.addEventListener('submit', function(e) {
        // Não prevenir comportamento padrão
        const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;
        
        if (emailInput && phoneInput) {
          // Enviar dados ao webhook em paralelo
          sendToWebhook(emailInput.value, phoneInput.value);
        }
        
        // Continuar com o fluxo normal - sem interferir no comportamento original
        if (originalSubmitHandler) {
          return originalSubmitHandler.call(form, e);
        }
        return true;
      });
    }
  }, []);

  return (
    <div className="hotmart-form-container">
      <form 
        klicksend-form-id='4puEQny' 
        autoComplete='off' 
        method="post" 
        action="//handler.send.hotmart.com/subscription/4puEQny?redirectTo=https://ai-code-pro.cienciadosdados.com/obrigado"
        className="space-y-4"
      >
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

        <div>
          <input
            type="tel"
            autoComplete="tel"
            name="phone"
            id="phone"
            ref={phoneInputRef}
            placeholder="(00) 00000-0000"
            required
            pattern="\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}"
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]/50 transition-all duration-200"
          />
        </div>

        {/* Campo oculto para o honeypot anti-spam */}
        <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
          <input type="text" autoComplete='new-password' name="b_4puEQny" tabIndex={-1} value="" />
        </div>

        <button
          klicksend-form-submit-id='4puEQny'
          className="w-full px-8 py-4 rounded-xl bg-[#0c83fe] hover:bg-[#0c83fe]/90 text-white font-medium transition-all duration-200 relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Quero me inscrever
          </span>
        </button>
      </form>

      {/* Script para capturar UTMs - Código padrão do Hotmart Send */}
      <script dangerouslySetInnerHTML={{ __html: `
        var pageParams = new URLSearchParams(window.location.search);
        var form = document.querySelector('form[klicksend-form-id="4puEQny"]');
        var formActionUrl = new URL(form.action);
        
        // Garantir que o redirecionamento para a página de obrigado esteja presente
        if (!formActionUrl.searchParams.has('redirectTo')) {
          formActionUrl.searchParams.set('redirectTo', 'https://ai-code-pro.cienciadosdados.com/obrigado');
        }
        
        var formActionSearchParams = formActionUrl.searchParams.size > 0 ? formActionUrl.searchParams.toString() + '&' : '';
        var combinedParams = formActionSearchParams + pageParams.toString();

        form.action = formActionUrl.origin + formActionUrl.pathname + '?' + combinedParams;
      `}} />
    </div>
  );
});

export { LeadForm };
