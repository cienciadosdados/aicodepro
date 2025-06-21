// Teste da nova tabela qualified_leads_jun25 com UPSERT atômico
const { saveLeadToSupabase } = require('./lib/supabase-client.js');

async function testNewTable() {
  console.log('🧪 TESTANDO NOVA TABELA qualified_leads_jun25');
  console.log('=' .repeat(50));
  
  const testEmail = `teste.${Date.now()}@aicodepro.com`;
  
  const testLead = {
    email: testEmail,
    phone: '(11) 99999-9999',
    is_programmer: true,
    utm_source: 'teste',
    utm_medium: 'script',
    utm_campaign: 'deduplicacao',
    ip_address: '127.0.0.1',
    user_agent: 'Test Script'
  };
  
  try {
    console.log(`\n🔥 TESTE 1: Primeira inserção`);
    console.log(`📧 Email: ${testEmail}`);
    
    const result1 = await saveLeadToSupabase(testLead);
    console.log('✅ Resultado 1:', result1);
    
    console.log(`\n🔥 TESTE 2: Tentativa de duplicata (mesmo email)`);
    
    const result2 = await saveLeadToSupabase(testLead);
    console.log('✅ Resultado 2:', result2);
    
    console.log(`\n🔥 TESTE 3: Múltiplas tentativas simultâneas`);
    
    const promises = Array(5).fill().map((_, i) => {
      console.log(`🚀 Disparando request ${i + 1}/5...`);
      return saveLeadToSupabase({
        ...testLead,
        user_agent: `Test Script - Request ${i + 1}`
      });
    });
    
    const results = await Promise.all(promises);
    
    console.log('\n📊 RESULTADOS DOS TESTES SIMULTÂNEOS:');
    results.forEach((result, i) => {
      console.log(`   Request ${i + 1}: ${result.success ? '✅' : '❌'} ${result.isDuplicate ? '(DUPLICATA)' : '(NOVO)'}`);
    });
    
    // Verificar quantos registros foram realmente inseridos
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: checkData, error: checkError } = await supabase
      .from('qualified_leads_jun25')
      .select('*')
      .eq('email', testEmail);
    
    if (checkError) {
      console.error('❌ Erro na verificação:', checkError);
    } else {
      console.log(`\n🔍 VERIFICAÇÃO FINAL:`);
      console.log(`📊 Registros encontrados: ${checkData.length}`);
      
      if (checkData.length === 1) {
        console.log('🎉 PERFEITO! Apenas 1 registro inserido (sem duplicatas)');
        console.log('📝 Dados do registro:', checkData[0]);
      } else {
        console.log(`❌ PROBLEMA! Encontrados ${checkData.length} registros para o mesmo email`);
        checkData.forEach((record, i) => {
          console.log(`   Registro ${i + 1}:`, record);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 TESTE CONCLUÍDO');
}

testNewTable();
