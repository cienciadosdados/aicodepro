// Script para mostrar estatísticas dos leads salvos no JSON
const fs = require('fs');
const path = require('path');

// Função para formatar porcentagem
function formatarPorcentagem(valor, total) {
  const porcentagem = (valor / total) * 100;
  return `${porcentagem.toFixed(1)}%`;
}

// Função para formatar data
function formatarData(dataString) {
  return new Date(dataString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Função principal
function mostrarEstatisticas() {
  console.log('\n===== ESTATÍSTICAS DE LEADS AI CODE PRO =====\n');
  
  const filePath = path.join(process.cwd(), 'data', 'leads.json');
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(filePath)) {
    console.log('Nenhum lead encontrado. O arquivo de dados ainda não foi criado.');
    return;
  }
  
  try {
    // Ler o arquivo JSON
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const leads = JSON.parse(fileContent);
    
    // Estatísticas gerais
    const totalLeads = leads.length;
    const programadoresSim = leads.filter(lead => lead.isProgrammer === 'SIM').length;
    const programadoresNao = leads.filter(lead => lead.isProgrammer === 'NAO').length;
    const semResposta = totalLeads - programadoresSim - programadoresNao;
    
    // Mostrar estatísticas gerais
    console.log(`Total de leads: ${totalLeads}`);
    console.log(`Programadores (SIM): ${programadoresSim} (${formatarPorcentagem(programadoresSim, totalLeads)})`);
    console.log(`Não programadores (NAO): ${programadoresNao} (${formatarPorcentagem(programadoresNao, totalLeads)})`);
    
    if (semResposta > 0) {
      console.log(`Sem resposta: ${semResposta} (${formatarPorcentagem(semResposta, totalLeads)})`);
    }
    
    // Estatísticas por origem (UTM)
    console.log('\n----- Estatísticas por origem -----');
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
    
    // Mostrar estatísticas por origem
    Object.keys(origens).forEach(origem => {
      const stats = origens[origem];
      console.log(`\nOrigem: ${origem}`);
      console.log(`  Total: ${stats.total} (${formatarPorcentagem(stats.total, totalLeads)})`);
      console.log(`  Programadores (SIM): ${stats.sim} (${formatarPorcentagem(stats.sim, stats.total)})`);
      console.log(`  Não programadores (NAO): ${stats.nao} (${formatarPorcentagem(stats.nao, stats.total)})`);
    });
    
    // Últimos 5 leads
    console.log('\n----- Últimos 5 leads -----');
    
    // Ordenar por data (mais recentes primeiro)
    const leadsOrdenados = [...leads].sort((a, b) => {
      const dataA = a.timestamp || a.date || '';
      const dataB = b.timestamp || b.date || '';
      return new Date(dataB).getTime() - new Date(dataA).getTime();
    });
    
    // Mostrar os últimos 5 leads
    leadsOrdenados.slice(0, 5).forEach((lead, index) => {
      const data = formatarData(lead.timestamp || lead.date || '');
      console.log(`\n[${index + 1}] ${lead.email} (${data})`);
      console.log(`  Telefone: ${lead.phone}`);
      console.log(`  Programador: ${lead.isProgrammer || 'Não informado'}`);
      console.log(`  Origem: ${lead.utmSource || 'Desconhecida'}`);
    });
    
  } catch (error) {
    console.error('Erro ao processar o arquivo de leads:', error);
  }
}

// Executar a função principal
mostrarEstatisticas();
