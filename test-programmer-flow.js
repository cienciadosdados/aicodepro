// Teste para verificar o fluxo de captura do isProgrammer
const { saveLeadToSupabase } = require('./lib/supabase-client.js');

async function testProgrammerFlow() {
  console.log('🧪 TESTANDO FLUXO DE CAPTURA isProgrammer');
  console.log('=' .repeat(60));
  
  // Teste 1: Usuário que É programador
  console.log('\n📝 TESTE 1: Usuário É PROGRAMADOR (SIM)');
  const testLeadProgrammer = {
    email: `programmer.test.${Date.now()}@aicodepro.com`,
    phone: '(11) 99999-1111',
    is_programmer: true, // DEVERIA ser TRUE
    utm_source: 'teste-programmer',
    utm_medium: 'script',
    utm_campaign: 'verificacao-fluxo',
    ip_address: '127.0.0.1',
    user_agent: 'Test Script'
  };
  
  try {
    const result1 = await saveLeadToSupabase(testLeadProgrammer);
    console.log('✅ Resultado programador:', result1.success ? 'SUCESSO' : 'ERRO');
    if (result1.success) {
      console.log('📊 is_programmer salvo como:', result1.data.is_programmer);
    }
  } catch (error) {
    console.error('❌ Erro teste programador:', error.message);
  }
  
  // Teste 2: Usuário que NÃO é programador
  console.log('\n📝 TESTE 2: Usuário NÃO É PROGRAMADOR (NÃO)');
  const testLeadNotProgrammer = {
    email: `notprogrammer.test.${Date.now()}@aicodepro.com`,
    phone: '(11) 99999-2222',
    is_programmer: false, // DEVERIA ser FALSE
    utm_source: 'teste-notprogrammer',
    utm_medium: 'script',
    utm_campaign: 'verificacao-fluxo',
    ip_address: '127.0.0.1',
    user_agent: 'Test Script'
  };
  
  try {
    const result2 = await saveLeadToSupabase(testLeadNotProgrammer);
    console.log('✅ Resultado não-programador:', result2.success ? 'SUCESSO' : 'ERRO');
    if (result2.success) {
      console.log('📊 is_programmer salvo como:', result2.data.is_programmer);
    }
  } catch (error) {
    console.error('❌ Erro teste não-programador:', error.message);
  }
  
  // Teste 3: Simulação do que vem do frontend
  console.log('\n📝 TESTE 3: SIMULAÇÃO FRONTEND (isProgrammer === true)');
  const frontendData = {
    email: `frontend.test.${Date.now()}@aicodepro.com`,
    phone: '(11) 99999-3333',
    is_programmer: true === true, // Como o frontend envia
    utm_source: 'teste-frontend',
    utm_medium: 'script',
    utm_campaign: 'verificacao-fluxo',
    ip_address: '127.0.0.1',
    user_agent: 'Test Script'
  };
  
  console.log('🔍 Valor enviado pelo frontend:', frontendData.is_programmer, typeof frontendData.is_programmer);
  
  try {
    const result3 = await saveLeadToSupabase(frontendData);
    console.log('✅ Resultado frontend:', result3.success ? 'SUCESSO' : 'ERRO');
    if (result3.success) {
      console.log('📊 is_programmer salvo como:', result3.data.is_programmer);
    }
  } catch (error) {
    console.error('❌ Erro teste frontend:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TESTE FLUXO isProgrammer CONCLUÍDO');
  console.log('\n🔍 VERIFICAR NO SUPABASE:');
  console.log('- programmer.test.* → is_programmer = TRUE');
  console.log('- notprogrammer.test.* → is_programmer = FALSE');
  console.log('- frontend.test.* → is_programmer = TRUE');
}

testProgrammerFlow();
