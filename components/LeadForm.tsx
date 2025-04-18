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

  // Verifica o domínio atual e redireciona se necessário
  useEffect(() => {
    // Se estamos no domínio antigo, redirecionar para o novo domínio
    if (typeof window !== 'undefined' && window.location.hostname.includes('ai-labs')) {
      window.location.href = 'https://ai-code-pro.cienciadosdados.com' + window.location.pathname + window.location.search;
    }
  }, []);

  // Hook para capturar a submissão do formulário sem interferir no fluxo original
  useEffect(() => {
    const form = document.querySelector('form[klicksend-form-id="4puEQny"]') as HTMLFormElement;

    if (form) {
      const originalSubmitHandler = form.onsubmit;

      form.addEventListener('submit', function (e) {
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
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6 w-full max-w-md mx-auto">
      <form
        klicksend-form-id='4puEQny'
        autoComplete='off'
        method="post"
        action="//handler.send.hotmart.com/subscription/4puEQny"
        className="space-y-4"
        id="lead-form"
      >
        <div>
          <input
            type="email"
            autoComplete="off"
            name="email"
            id="email"
            className="w-full px-4 py-3 bg-black/60 border border-white/20 focus:border-[#0c83fe]/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0c83fe]/50 transition-colors duration-200"
            placeholder="Seu melhor email"
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="phone"
            id="phone"
            className="w-full px-4 py-3 bg-black/60 border border-white/20 focus:border-[#0c83fe]/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0c83fe]/50 transition-colors duration-200"
            placeholder="DDD + WhatsApp"
            required
          />
        </div>

        {/* Campo honeypot para evitar spam */}
        <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
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

      {/* Script simplificado para capturar UTMs */}
      <script dangerouslySetInnerHTML={{ __html: `
        var pageParams = new URLSearchParams(window.location.search);
        var form = document.querySelector('form[klicksend-form-id="4puEQny"]');
        var formActionUrl = new URL(form.action);
        var formActionSearchParams = formActionUrl.searchParams.size > 0 ? formActionUrl.searchParams.toString() + '&' : '';
        var combinedParams = formActionSearchParams + pageParams.toString();

        form.action = formActionUrl.origin + formActionUrl.pathname + '?' + combinedParams;
      `}} />
    </div>
  );
});

export { LeadForm };
