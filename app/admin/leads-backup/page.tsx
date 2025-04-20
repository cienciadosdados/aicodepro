'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LeadData {
  email: string;
  phone: string;
  isProgrammer: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  timestamp?: string;
  savedLocally?: boolean;
  error?: string;
}

export default function LeadsBackupPage() {
  const [localLeads, setLocalLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<{success: number, failed: number} | null>(null);
  
  // Carregar leads do localStorage
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedLeadsJSON = localStorage.getItem('aicodepro_backup_leads') || '[]';
      const savedLeads: LeadData[] = JSON.parse(savedLeadsJSON);
      setLocalLeads(savedLeads);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar leads locais:', error);
      setIsLoading(false);
    }
  }, []);
  
  // Função para tentar sincronizar leads com o servidor
  const syncLeadsWithServer = async () => {
    try {
      if (localLeads.length === 0) {
        alert('Não há leads para sincronizar.');
        return;
      }
      
      setSyncStatus(null);
      const successfullySync: number[] = [];
      let failedSync = 0;
      
      for (let i = 0; i < localLeads.length; i++) {
        const lead = localLeads[i];
        
        try {
          // Tentar enviar para o endpoint webhook-lead
          const response = await fetch('/api/webhook-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
          });
          
          if (response.ok) {
            successfullySync.push(i);
            console.log(`✅ Lead #${i} sincronizado com sucesso:`, lead.email);
          } else {
            failedSync++;
            console.error(`❌ Falha ao sincronizar lead #${i}:`, lead.email);
          }
        } catch (error) {
          failedSync++;
          console.error(`❌ Erro ao sincronizar lead #${i}:`, error);
        }
      }
      
      // Remover leads sincronizados com sucesso
      if (successfullySync.length > 0) {
        const remainingLeads = localLeads.filter((_, index) => !successfullySync.includes(index));
        localStorage.setItem('aicodepro_backup_leads', JSON.stringify(remainingLeads));
        setLocalLeads(remainingLeads);
        
        setSyncStatus({
          success: successfullySync.length,
          failed: failedSync
        });
      } else if (failedSync > 0) {
        setSyncStatus({
          success: 0,
          failed: failedSync
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar leads:', error);
      alert(`Erro ao sincronizar: ${error}`);
    }
  };
  
  // Função para exportar leads como CSV
  const exportLeadsAsCSV = () => {
    try {
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
    } catch (error) {
      console.error('Erro ao exportar leads:', error);
      alert(`Erro ao exportar: ${error}`);
    }
  };
  
  // Função para limpar todos os leads locais
  const clearAllLeads = () => {
    if (confirm('Tem certeza que deseja apagar todos os leads salvos localmente? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('aicodepro_backup_leads');
      setLocalLeads([]);
      alert('Todos os leads foram removidos do armazenamento local.');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backup de Leads - AI Code Pro</h1>
        <p className="text-gray-600 mb-4">
          Esta página mostra os leads que foram salvos localmente quando o banco de dados Neon não estava disponível.
        </p>
        <div className="flex gap-4 mb-4">
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Voltar para Home
          </Link>
          <button 
            onClick={syncLeadsWithServer}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            disabled={localLeads.length === 0}
          >
            Sincronizar com Servidor
          </button>
          <button 
            onClick={exportLeadsAsCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            disabled={localLeads.length === 0}
          >
            Exportar como CSV
          </button>
          <button 
            onClick={clearAllLeads}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            disabled={localLeads.length === 0}
          >
            Limpar Todos
          </button>
        </div>
        
        {syncStatus && (
          <div className={`p-4 rounded-md mb-4 ${syncStatus.success > 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <p>
              {syncStatus.success > 0 && `✅ ${syncStatus.success} leads sincronizados com sucesso.`}
              {syncStatus.failed > 0 && ` ❌ ${syncStatus.failed} leads falharam ao sincronizar.`}
            </p>
          </div>
        )}
      </header>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Carregando leads salvos localmente...</p>
        </div>
      ) : localLeads.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">Não há leads salvos localmente.</p>
          <p className="text-sm text-gray-500 mt-2">
            Os leads são salvos localmente apenas quando o banco de dados Neon não está disponível.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Telefone</th>
                <th className="py-2 px-4 border-b text-left">É Programador</th>
                <th className="py-2 px-4 border-b text-left">UTM Source</th>
                <th className="py-2 px-4 border-b text-left">UTM Medium</th>
                <th className="py-2 px-4 border-b text-left">Data</th>
              </tr>
            </thead>
            <tbody>
              {localLeads.map((lead, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 border-b">{lead.email}</td>
                  <td className="py-2 px-4 border-b">{lead.phone}</td>
                  <td className="py-2 px-4 border-b">{lead.isProgrammer ? 'Sim' : 'Não'}</td>
                  <td className="py-2 px-4 border-b">{lead.utmSource || '-'}</td>
                  <td className="py-2 px-4 border-b">{lead.utmMedium || '-'}</td>
                  <td className="py-2 px-4 border-b">{lead.timestamp ? new Date(lead.timestamp).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
