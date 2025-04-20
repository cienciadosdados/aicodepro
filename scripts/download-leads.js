// Script para baixar leads do Supabase via terminal
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Obter credenciais do arquivo .env.local
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Usar a service role key para ter acesso total à tabela
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Credenciais do Supabase não encontradas no arquivo .env.local');
  console.error('Por favor, adicione as credenciais do Supabase ao arquivo .env.local');
  process.exit(1);
}

console.log('Usando Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadLeads() {
  try {
    console.log('Baixando leads do Supabase...');
    
    // Obter todos os leads da tabela qualified_leads
    const { data, error } = await supabase
      .from('qualified_leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log('Nenhum lead encontrado no banco de dados.');
      return;
    }
    
    console.log(`Encontrados ${data.length} leads.`);
    
    // Criar CSV
    let csv = 'Email,Telefone,É Programador,Data,UTM Source,UTM Medium,UTM Campaign,IP,User Agent\n';
    
    data.forEach(lead => {
      const date = new Date(lead.created_at).toLocaleString();
      csv += `"${lead.email || ''}","${lead.phone || ''}","${lead.is_programmer ? 'Sim' : 'Não'}","${date}","${lead.utm_source || ''}","${lead.utm_medium || ''}","${lead.utm_campaign || ''}","${lead.ip_address || ''}","${lead.user_agent || ''}"\n`;
    });
    
    // Salvar arquivo
    const fileName = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    const filePath = path.resolve(__dirname, '../', fileName);
    
    fs.writeFileSync(filePath, csv, 'utf8');
    
    console.log(`Arquivo salvo com sucesso: ${filePath}`);
    console.log(`Total de leads: ${data.length}`);
  } catch (error) {
    console.error('Erro ao baixar leads:', error);
  }
}

// Executar função
downloadLeads();
