'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HotmartFormProps {
  className?: string;
  redirectTo?: string;
}

export function HotmartForm({ className = '', redirectTo = '/obrigado' }: HotmartFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Obter a URL do webhook do Hotmart das variáveis de ambiente
      const webhookUrl = process.env.NEXT_PUBLIC_HOTMART_WEBHOOK_URL;
      const formTag = process.env.NEXT_PUBLIC_HOTMART_FORM_TAG;

      if (!webhookUrl) {
        throw new Error('URL do webhook não configurada');
      }

      // Enviar dados diretamente para o webhook do Hotmart
      // Nota: Em produção, é melhor usar uma API route para esconder a URL do webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          tag: formTag || 'landing-page',
          source: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar dados');
      }

      // Redirecionar para a página de agradecimento
      router.push(`${redirectTo}?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
      setError('Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Seu nome
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]"
          placeholder="Digite seu nome completo"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Seu melhor e-mail
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0c83fe]"
          placeholder="Digite seu email"
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#0c83fe] to-[#0c83fe]/80 text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando...
          </span>
        ) : (
          'QUERO PARTICIPAR'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center mt-2">
        Ao se inscrever, você concorda com nossa política de privacidade.
      </p>
    </form>
  );
}
