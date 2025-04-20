// Script para configurar a tabela de leads no Supabase
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Inicializar cliente Supabase com a chave de serviço para ter permissões completas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmweydircrhrsyhiuhbv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Credenciais do Supabase não encontradas no arquivo .env.local');
  console.error('Por favor, adicione as credenciais do Supabase ao arquivo .env.local');
  process.exit(1);
}

console.log('Conectando ao Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTable() {
  try {
    console.log('Verificando se a tabela qualified_leads existe...');
    
    // Verificar se a tabela já existe
    const { data: tables, error: tablesError } = await supabase
      .from('qualified_leads')
      .select('*')
      .limit(1);
    
    if (!tablesError) {
      console.log('Tabela qualified_leads já existe.');
    } else {
      console.log('Criando tabela qualified_leads...');
      
      // Criar tabela usando SQL
      const { error } = await supabase.rpc('create_leads_table', {});
      
      if (error) {
        console.error('Erro ao criar tabela:', error);
        
        // Tentar criar a tabela manualmente
        console.log('Tentando criar tabela manualmente via SQL...');
        
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS qualified_leads (
              id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
              email TEXT NOT NULL,
              phone TEXT NOT NULL,
              is_programmer BOOLEAN DEFAULT false,
              utm_source TEXT,
              utm_medium TEXT,
              utm_campaign TEXT,
              ip_address TEXT,
              user_agent TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          `
        });
        
        if (sqlError) {
          console.error('Erro ao criar tabela via SQL:', sqlError);
          console.log('Você precisará criar a tabela manualmente no painel do Supabase.');
          console.log('Acesse: https://app.supabase.com/project/_/editor');
          console.log('E execute o seguinte SQL:');
          console.log(`
            CREATE TABLE IF NOT EXISTS qualified_leads (
              id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
              email TEXT NOT NULL,
              phone TEXT NOT NULL,
              is_programmer BOOLEAN DEFAULT false,
              utm_source TEXT,
              utm_medium TEXT,
              utm_campaign TEXT,
              ip_address TEXT,
              user_agent TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          `);
        } else {
          console.log('Tabela qualified_leads criada com sucesso!');
        }
      } else {
        console.log('Tabela qualified_leads criada com sucesso!');
      }
    }
    
    // Inserir um lead de teste
    console.log('Inserindo lead de teste...');
    const { data, error } = await supabase
      .from('qualified_leads')
      .insert([
        {
          email: 'teste@exemplo.com',
          phone: '(11) 99999-9999',
          is_programmer: true,
          utm_source: 'teste',
          utm_medium: 'script',
          utm_campaign: 'setup',
          ip_address: '127.0.0.1',
          user_agent: 'Supabase Setup Script'
        }
      ]);
    
    if (error) {
      console.error('Erro ao inserir lead de teste:', error);
    } else {
      console.log('Lead de teste inserido com sucesso!');
    }
    
    // Verificar se o lead foi inserido
    const { data: leads, error: leadsError } = await supabase
      .from('qualified_leads')
      .select('*');
    
    if (leadsError) {
      console.error('Erro ao verificar leads:', leadsError);
    } else {
      console.log(`Total de leads na tabela qualified_leads: ${leads.length}`);
      console.log('Leads:', leads);
    }
    
    console.log('\nConfiguração concluída com sucesso!');
    console.log('\nPara baixar os leads, execute:');
    console.log('node scripts/download-leads.js');
  } catch (error) {
    console.error('Erro durante a configuração:', error);
  }
}

setupTable();
