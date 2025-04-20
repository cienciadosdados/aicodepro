'use client';

import { useState, useEffect } from 'react';

interface Lead {
  email: string;
  phone: string;
  isProgrammer: boolean;
  timestamp: string;
  [key: string]: any;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar leads do localStorage
    try {
      const leadsJSON = localStorage.getItem('aicodepro_backup_leads');
      if (leadsJSON) {
        const parsedLeads = JSON.parse(leadsJSON);
        setLeads(parsedLeads);
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar leads como CSV
  const exportCSV = () => {
    if (leads.length === 0) {
      alert('Não há leads para exportar');
      return;
    }

    try {
      // Cabeçalho CSV
      let csv = 'Email,Telefone,É Programador,Data\n';
      
      // Adicionar cada lead
      leads.forEach(lead => {
        const date = new Date(lead.timestamp).toLocaleString();
        csv += `"${lead.email || ''}","${lead.phone || ''}","${lead.isProgrammer ? 'Sim' : 'Não'}","${date}"\n`;
      });
      
      // Criar blob e link para download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'leads_' + new Date().toISOString().slice(0, 10) + '.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar CSV: ' + (error as Error).message);
    }
  };

  // Limpar todos os leads
  const clearLeads = () => {
    if (confirm('Tem certeza que deseja limpar todos os leads salvos?')) {
      localStorage.removeItem('aicodepro_backup_leads');
      setLeads([]);
      alert('Leads limpos com sucesso!');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Leads Salvos Localmente</h1>
      
      {loading ? (
        <p>Carregando...</p>
      ) : leads.length === 0 ? (
        <p className="text-red-500 italic">Nenhum lead encontrado no armazenamento local.</p>
      ) : (
        <>
          <p className="mb-4">Total de leads: <strong>{leads.length}</strong></p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Telefone</th>
                  <th className="py-2 px-4 border-b">É Programador</th>
                  <th className="py-2 px-4 border-b">Data</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                    <td className="py-2 px-4 border-b">{lead.email || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{lead.phone || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{lead.isProgrammer ? 'Sim' : 'Não'}</td>
                    <td className="py-2 px-4 border-b">
                      {lead.timestamp ? new Date(lead.timestamp).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={exportCSV}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Exportar CSV
        </button>
        <button 
          onClick={clearLeads}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Limpar Dados
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-2">Informações de Diagnóstico</h2>
        <p>Se você está vendo esta página mas não vê nenhum lead, isso pode significar:</p>
        <ul className="list-disc ml-6">
          <li>Nenhum lead foi salvo localmente ainda</li>
          <li>O localStorage do seu navegador está desativado</li>
          <li>Houve um erro ao salvar os leads</li>
        </ul>
        <p className="mt-2">
          Para testar se o localStorage está funcionando, você pode tentar adicionar um lead manualmente:
        </p>
        <div className="mt-2">
          <button 
            onClick={() => {
              try {
                const testLead = {
                  email: 'teste@exemplo.com',
                  phone: '(11) 99999-9999',
                  isProgrammer: true,
                  timestamp: new Date().toISOString(),
                  source: 'teste_manual'
                };
                
                const leadsJSON = localStorage.getItem('aicodepro_backup_leads') || '[]';
                const currentLeads = JSON.parse(leadsJSON);
                currentLeads.push(testLead);
                localStorage.setItem('aicodepro_backup_leads', JSON.stringify(currentLeads));
                
                setLeads([...currentLeads]);
                alert('Lead de teste adicionado com sucesso!');
              } catch (error) {
                alert('Erro ao adicionar lead de teste: ' + (error as Error).message);
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Adicionar Lead de Teste
          </button>
        </div>
      </div>
    </div>
  );
}
