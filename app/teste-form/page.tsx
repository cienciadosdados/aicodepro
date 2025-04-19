'use client';

import { useState } from 'react';

export default function TestForm() {
  const [isProgrammer, setIsProgrammer] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviar dados diretamente para a API
      const response = await fetch('/api/qualified-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          isProgrammer, // Enviar o valor booleano diretamente
          utmSource: 'test_source',
          utmMedium: 'test_medium',
          utmCampaign: 'test_campaign'
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      setResult({ error: 'Erro ao enviar dados' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Formulário de Teste</h1>
      
      <div className="bg-gray-100 p-4 mb-6 rounded-lg">
        <p className="font-medium">Valor atual de isProgrammer: <span className="font-bold">{isProgrammer === null ? 'null' : isProgrammer ? 'TRUE' : 'FALSE'}</span></p>
        <p className="text-sm text-gray-600 mt-1">Tipo: {isProgrammer === null ? 'null' : typeof isProgrammer}</p>
      </div>
      
      <div className="mb-6">
        <p className="font-medium mb-2">Selecione uma opção:</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              console.log('Definindo isProgrammer como TRUE');
              setIsProgrammer(true);
            }}
            className={`flex-1 px-4 py-2 rounded-lg border ${isProgrammer === true ? 'bg-green-500 text-white' : 'bg-white'}`}
          >
            SIM (true)
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('Definindo isProgrammer como FALSE');
              setIsProgrammer(false);
            }}
            className={`flex-1 px-4 py-2 rounded-lg border ${isProgrammer === false ? 'bg-red-500 text-white' : 'bg-white'}`}
          >
            NÃO (false)
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Telefone:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <button
          type="submit"
          disabled={isProgrammer === null || loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2">Resultado:</h2>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
