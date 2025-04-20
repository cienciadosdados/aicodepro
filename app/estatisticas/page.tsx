'use client';

import { useEffect, useState } from 'react';

interface Lead {
  email: string;
  phone: string;
  isProgrammer: string;
  utmSource: string;
  timestamp: string;
}

interface OrigemStats {
  total: number;
  sim: number;
  nao: number;
  porcentagemTotal: string;
  porcentagemSim: string;
  porcentagemNao: string;
}

interface Stats {
  totalLeads: number;
  programadoresSim: number;
  programadoresNao: number;
  semResposta: number;
  porcentagemSim: string;
  porcentagemNao: string;
  porcentagemSemResposta: string;
}

interface EstatsResponse {
  success: boolean;
  message?: string;
  stats: Stats;
  origens: Record<string, OrigemStats>;
  ultimosLeads: Lead[];
}

export default function EstatisticasPage() {
  const [data, setData] = useState<EstatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/estatisticas');
        if (!response.ok) {
          throw new Error(`Erro ao carregar estatísticas: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Formatar data
  const formatarData = (dataString: string) => {
    if (!dataString) return 'Data desconhecida';
    
    try {
      return new Date(dataString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Carregando estatísticas...</h1>
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 bg-gray-700 rounded col-span-2"></div>
                  <div className="h-4 bg-gray-700 rounded col-span-1"></div>
                </div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Erro ao carregar estatísticas</h1>
          <div className="bg-red-900/50 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Nenhum dado disponível</h1>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Estatísticas de Leads - AI Code Pro</h1>
        
        {data.message && (
          <div className="bg-blue-900/50 p-4 rounded-lg mb-8">
            <p>{data.message}</p>
          </div>
        )}
        
        {/* Estatísticas Gerais */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Estatísticas Gerais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Total de Leads</h3>
              <p className="text-4xl font-bold">{data.stats.totalLeads}</p>
            </div>
            
            <div className="bg-green-900/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Programadores (SIM)</h3>
              <p className="text-4xl font-bold">{data.stats.programadoresSim}</p>
              <p className="text-xl opacity-80">{data.stats.porcentagemSim}</p>
            </div>
            
            <div className="bg-blue-900/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Não Programadores (NAO)</h3>
              <p className="text-4xl font-bold">{data.stats.programadoresNao}</p>
              <p className="text-xl opacity-80">{data.stats.porcentagemNao}</p>
            </div>
          </div>
          
          {/* Gráfico de barras simples */}
          <div className="mt-8">
            <div className="h-8 w-full bg-gray-700 rounded-lg overflow-hidden flex">
              {data.stats.programadoresSim > 0 && (
                <div 
                  className="h-full bg-green-600" 
                  style={{ width: data.stats.porcentagemSim }}
                  title={`Programadores: ${data.stats.programadoresSim} (${data.stats.porcentagemSim})`}
                ></div>
              )}
              {data.stats.programadoresNao > 0 && (
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: data.stats.porcentagemNao }}
                  title={`Não Programadores: ${data.stats.programadoresNao} (${data.stats.porcentagemNao})`}
                ></div>
              )}
              {data.stats.semResposta > 0 && (
                <div 
                  className="h-full bg-gray-500" 
                  style={{ width: data.stats.porcentagemSemResposta }}
                  title={`Sem Resposta: ${data.stats.semResposta} (${data.stats.porcentagemSemResposta})`}
                ></div>
              )}
            </div>
            <div className="flex justify-between mt-2 text-sm opacity-80">
              <div>0%</div>
              <div>50%</div>
              <div>100%</div>
            </div>
          </div>
        </div>
        
        {/* Estatísticas por Origem */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Estatísticas por Origem</h2>
          
          {Object.keys(data.origens).length === 0 ? (
            <p>Nenhuma origem registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-2 text-left">Origem</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-right">SIM</th>
                    <th className="px-4 py-2 text-right">NAO</th>
                    <th className="px-4 py-2 text-right">% SIM</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.origens).map(([origem, stats]) => (
                    <tr key={origem} className="border-t border-gray-700">
                      <td className="px-4 py-3">{origem}</td>
                      <td className="px-4 py-3 text-right">{stats.total}</td>
                      <td className="px-4 py-3 text-right">{stats.sim}</td>
                      <td className="px-4 py-3 text-right">{stats.nao}</td>
                      <td className="px-4 py-3 text-right">{stats.porcentagemSim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Últimos Leads */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Últimos Leads</h2>
          
          {data.ultimosLeads.length === 0 ? (
            <p>Nenhum lead registrado.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {data.ultimosLeads.map((lead, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{lead.email}</h3>
                      <p className="text-sm opacity-80">{lead.phone}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${lead.isProgrammer === 'SIM' ? 'bg-green-900/50' : 'bg-blue-900/50'}`}>
                      {lead.isProgrammer}
                    </div>
                  </div>
                  <div className="mt-2 text-sm opacity-80 flex justify-between">
                    <span>Origem: {lead.utmSource}</span>
                    <span>{formatarData(lead.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Atualização automática */}
        <div className="mt-8 text-center text-sm opacity-70">
          <p>Dados atualizados automaticamente a cada 30 segundos</p>
          <p className="mt-1">Última atualização: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
}
