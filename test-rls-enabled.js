// Teste para verificar se RLS habilitado não quebrou as inserções
const { saveLeadToSupabase } = require('./lib/supabase-client.js');

async function testRLSEnabled() {
  console.log('🧪 TESTANDO INSERÇÃO COM RLS HABILITADO');
  console.log('=' .repeat(50));
  
  const testLead = {
    email: `rls.test.${Date.now()}@aicodepro.com`,
    phone: '(11) 99999-1234',
    is_programmer: true,
    utm_source: 'teste-rls',
    utm_medium: 'script',
    utm_campaign: 'verificacao-rls',
    ip_address: '127.0.0.1',
    user_agent: 'RLS Test Script'
  };
  
  console.log('📝 Testando lead:', testLead.email);
  
  try {
    const result = await saveLeadToSupabase(testLead);
    
    if (result.success) {
      console.log('✅ SUCESSO! RLS habilitado não quebrou nada');
      console.log('📊 Resultado:', result);
      console.log('🎉 Emails chatos do Supabase vão parar!');
    } else {
      console.log('❌ PROBLEMA! RLS quebrou as inserções');
      console.log('📊 Erro:', result);
      console.log('🔧 Verifique se a policy foi criada corretamente');
    }
  } catch (error) {
    console.error('❌ ERRO na inserção:', error.message);
    console.log('🔧 Provavelmente a policy não foi criada ou está incorreta');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 TESTE RLS CONCLUÍDO');
}

testRLSEnabled();
