// Script para debugar o problema dos dados parciais
// Executa: node debug-partial-leads.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 INICIANDO DEBUG DOS DADOS PARCIAIS...\n');

async function debugPartialLeads() {
  try {
    // Verificar variáveis de ambiente
    console.log('📋 VERIFICANDO CONFIGURAÇÃO:');
    console.log('- Supabase URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
    console.log('- Service Key:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida');
    console.log('');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente não configuradas!');
      return;
    }

    // Conectar ao Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔗 Cliente Supabase criado com sucesso');

    // 1. Verificar se a tabela partial_leads existe
    console.log('\n📊 VERIFICANDO TABELA partial_leads:');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('partial_leads')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela partial_leads:', tableError.message);
      console.log('💡 Verifique se a tabela foi criada corretamente no Supabase');
      return;
    } else {
      console.log('✅ Tabela partial_leads acessível');
    }

    // 2. Listar todos os registros da tabela partial_leads
    console.log('\n📋 REGISTROS NA TABELA partial_leads:');
    
    const { data: allPartials, error: listError } = await supabase
      .from('partial_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('❌ Erro ao listar dados parciais:', listError.message);
    } else {
      console.log(`📊 Total de registros: ${allPartials.length}`);
      
      if (allPartials.length > 0) {
        console.log('\n🔍 ÚLTIMOS 3 REGISTROS:');
        allPartials.slice(0, 3).forEach((record, index) => {
          console.log(`\n${index + 1}. Session ID: ${record.session_id}`);
          console.log(`   isProgrammer: ${record.is_programmer}`);
          console.log(`   Timestamp: ${record.qualification_timestamp}`);
          console.log(`   Status: ${record.status}`);
        });
      } else {
        console.log('⚠️ Nenhum registro encontrado na tabela partial_leads');
      }
    }

    // 3. Verificar se conseguimos buscar por session_id específico
    if (allPartials && allPartials.length > 0) {
      const latestSessionId = allPartials[0].session_id;
      
      console.log(`\n🔍 TESTANDO BUSCA POR SESSION_ID: ${latestSessionId}`);
      
      const { data: specificRecord, error: searchError } = await supabase
        .from('partial_leads')
        .select('is_programmer, qualification_timestamp')
        .eq('session_id', latestSessionId)
        .single();

      if (searchError) {
        console.error('❌ Erro ao buscar por session_id:', searchError.message);
        console.log('💡 Este pode ser o problema no webhook!');
      } else {
        console.log('✅ Busca por session_id funcionando:');
        console.log('   isProgrammer:', specificRecord.is_programmer);
        console.log('   Timestamp:', specificRecord.qualification_timestamp);
      }
    }

    // 4. Verificar tabela qualified_leads_jun25
    console.log('\n📊 VERIFICANDO TABELA qualified_leads_jun25:');
    
    const { data: mainLeads, error: mainError } = await supabase
      .from('qualified_leads_jun25')
      .select('email, is_programmer, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (mainError) {
      console.error('❌ Erro ao acessar qualified_leads_jun25:', mainError.message);
    } else {
      console.log(`📊 Total de leads principais: ${mainLeads.length}`);
      
      if (mainLeads.length > 0) {
        console.log('\n🔍 ÚLTIMOS 3 LEADS PRINCIPAIS:');
        mainLeads.forEach((lead, index) => {
          console.log(`\n${index + 1}. Email: ${lead.email}`);
          console.log(`   isProgrammer: ${lead.is_programmer}`);
          console.log(`   Timestamp: ${lead.created_at}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Erro inesperado:', error.message);
  }
}

// Executar debug
debugPartialLeads()
  .then(() => {
    console.log('\n🏁 DEBUG CONCLUÍDO');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
