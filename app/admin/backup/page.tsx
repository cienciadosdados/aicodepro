'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Lead {
  email: string;
  phone: string;
  isProgrammer: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  timestamp?: string;
}

export default function BackupPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isProgrammer, setIsProgrammer] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  
  // Carregar leads do localStorage
  useEffect(() => {
    try {
      const savedLeadsJSON = localStorage.getItem('aicodepro_backup_leads') || '[]';
      const savedLeads = JSON.parse(savedLeadsJSON);
      setLocalLeads(savedLeads);
    } catch (error) {
      console.error('Erro ao carregar leads locais:', error);
    }
  }, []);
  
  // Função para salvar lead manualmente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !phone) {
      alert('Por favor, preencha email e telefone.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Dados do lead
      const leadData = {
        email,
        phone,
        isProgrammer,
        utmSource: 'manual_backup',
        utmMedium: 'admin_page',
        utmCampaign: 'recovery'
      };
      
      // Salvar localmente
      try {
        const savedLeadsJSON = localStorage.getItem('aicodepro_backup_leads') || '[]';
        const savedLeads = JSON.parse(savedLeadsJSON);
        
        savedLeads.push({
          ...leadData,
          timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('aicodepro_backup_leads', JSON.stringify(savedLeads));
        setLocalLeads(savedLeads);
      } catch (localError) {
        console.error('Erro ao salvar localmente:', localError);
      }
      
      // Enviar para endpoint de backup
      const response = await fetch('/api/backup-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      
      const data = await response.json();
      setResult(data);
      
      // Limpar formulário
      setEmail('');
      setPhone('');
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      setResult({ error: 'Erro ao salvar lead', details: String(error) });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para exportar leads como CSV
  const exportLeads = () => {
    if (localLeads.length === 0) {
      alert('Não há leads para exportar.');
      return;
    }
    
    // Criar cabeçalho do CSV
    const headers = ['Email', 'Telefone', 'É Programador', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Timestamp'];
    
    // Criar linhas do CSV
    const rows = localLeads.map(lead => [
      lead.email || '',
      lead.phone || '',
      lead.isProgrammer ? 'Sim' : 'Não',
      lead.utmSource || '',
      lead.utmMedium || '',
      lead.utmCampaign || '',
      lead.timestamp || ''
    ]);
    
    // Juntar tudo em uma string CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aicodepro_leads_backup_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Função para limpar leads locais
  const clearLeads = () => {
    if (confirm('Tem certeza que deseja limpar todos os leads salvos localmente?')) {
      localStorage.removeItem('aicodepro_backup_leads');
      setLocalLeads([]);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Sistema de Backup de Leads</h1>
      <p className="mb-6">Use esta página para salvar leads manualmente ou recuperar leads salvos localmente.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Salvar Lead Manualmente</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isProgrammer"
                checked={isProgrammer}
                onChange={(e) => setIsProgrammer(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isProgrammer">É programador?</label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Lead'}
            </button>
          </form>
          
          {result && (
            <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">{result.message || result.error}</p>
              {result.details && <p className="text-sm mt-1">{result.details}</p>}
              {result.backups && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">Status dos backups:</p>
                  <ul className="mt-1">
                    {Object.entries(result.backups).map(([name, status]: [string, any]) => (
                      <li key={name}>
                        {name}: {status.success ? '✅ Sucesso' : `❌ Falha (${status.error || status.status})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Leads Salvos Localmente</h2>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={exportLeads}
              disabled={localLeads.length === 0}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              Exportar CSV
            </button>
            
            <button
              onClick={clearLeads}
              disabled={localLeads.length === 0}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              Limpar Todos
            </button>
          </div>
          
          {localLeads.length === 0 ? (
            <p className="text-gray-500">Nenhum lead salvo localmente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">É Programador</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {localLeads.map((lead, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">{lead.email}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{lead.phone}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{lead.isProgrammer ? 'Sim' : 'Não'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
