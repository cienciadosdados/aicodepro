import fs from 'fs';
import path from 'path';

// Função para formatar porcentagem
function formatarPorcentagem(valor, total) {
  const porcentagem = (valor / total) * 100;
  return `${porcentagem.toFixed(1)}%`;
}

export async function GET(request) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'leads.json');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhum lead encontrado. O arquivo de dados ainda não foi criado.',
        stats: {
          totalLeads: 0,
          programadoresSim: 0,
          programadoresNao: 0,
          porcentagemSim: '0.0%',
          porcentagemNao: '0.0%'
        },
        origens: {},
        ultimosLeads: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Ler o arquivo JSON
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const leads = JSON.parse(fileContent);
    
    // Estatísticas gerais
    const totalLeads = leads.length;
    const programadoresSim = leads.filter(lead => lead.isProgrammer === 'SIM').length;
    const programadoresNao = leads.filter(lead => lead.isProgrammer === 'NAO').length;
    const semResposta = totalLeads - programadoresSim - programadoresNao;
    
    // Estatísticas por origem (UTM)
    const origens = {};
    
    leads.forEach(lead => {
      const origem = lead.utmSource || 'desconhecida';
      if (!origens[origem]) {
        origens[origem] = { total: 0, sim: 0, nao: 0 };
      }
      
      origens[origem].total++;
      
      if (lead.isProgrammer === 'SIM') {
        origens[origem].sim++;
      } else if (lead.isProgrammer === 'NAO') {
        origens[origem].nao++;
      }
    });
    
    // Adicionar porcentagens às origens
    Object.keys(origens).forEach(origem => {
      const stats = origens[origem];
      origens[origem].porcentagemTotal = formatarPorcentagem(stats.total, totalLeads);
      origens[origem].porcentagemSim = formatarPorcentagem(stats.sim, stats.total);
      origens[origem].porcentagemNao = formatarPorcentagem(stats.nao, stats.total);
    });
    
    // Últimos 5 leads
    const leadsOrdenados = [...leads].sort((a, b) => {
      const dataA = a.timestamp || a.date || '';
      const dataB = b.timestamp || b.date || '';
      return new Date(dataB).getTime() - new Date(dataA).getTime();
    });
    
    const ultimosLeads = leadsOrdenados.slice(0, 5).map(lead => ({
      email: lead.email,
      phone: lead.phone,
      isProgrammer: lead.isProgrammer || 'Não informado',
      utmSource: lead.utmSource || 'Desconhecida',
      timestamp: lead.timestamp || lead.date || ''
    }));
    
    // Montar o objeto de resposta
    const response = {
      success: true,
      stats: {
        totalLeads,
        programadoresSim,
        programadoresNao,
        semResposta,
        porcentagemSim: formatarPorcentagem(programadoresSim, totalLeads),
        porcentagemNao: formatarPorcentagem(programadoresNao, totalLeads),
        porcentagemSemResposta: formatarPorcentagem(semResposta, totalLeads)
      },
      origens,
      ultimosLeads
    };
    
    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erro ao processar estatísticas:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
