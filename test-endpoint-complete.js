// Teste completo do endpoint /api/webhook-lead com nova tabela
const fetch = require('node-fetch');

async function testEndpoint() {
  console.log('🧪 TESTANDO ENDPOINT COMPLETO /api/webhook-lead');
  console.log('=' .repeat(60));
  
  const baseUrl = 'http://localhost:3000'; // Ajuste se necessário
  const testEmail = `endpoint.${Date.now()}@aicodepro.com`;
  
  const testData = {
    email: testEmail,
    phone: '(11) 98765-4321',
    isProgrammer: true,
    utmSource: 'teste-endpoint',
    utmMedium: 'script',
    utmCampaign: 'deduplicacao-completa'
  };
  
  try {
    console.log(`\n🔥 TESTE 1: Primeira submissão`);
    console.log(`📧 Email: ${testEmail}`);
    console.log(`📝 Dados:`, testData);
    
    const response1 = await fetch(`${baseUrl}/api/webhook-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test Script Complete'
      },
      body: JSON.stringify(testData)
    });
    
    const result1 = await response1.json();
    console.log(`✅ Status: ${response1.status}`);
    console.log(`📋 Resposta:`, result1);
    
    console.log(`\n🔥 TESTE 2: Segunda submissão (duplicata)`);
    
    const response2 = await fetch(`${baseUrl}/api/webhook-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test Script Complete - Duplicate'
      },
      body: JSON.stringify(testData)
    });
    
    const result2 = await response2.json();
    console.log(`✅ Status: ${response2.status}`);
    console.log(`📋 Resposta:`, result2);
    
    console.log(`\n🔥 TESTE 3: Múltiplas submissões simultâneas`);
    
    const promises = Array(3).fill().map((_, i) => {
      console.log(`🚀 Disparando request ${i + 1}/3...`);
      return fetch(`${baseUrl}/api/webhook-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `Test Script Complete - Simultaneous ${i + 1}`
        },
        body: JSON.stringify({
          ...testData,
          utmCampaign: `deduplicacao-completa-${i + 1}`
        })
      });
    });
    
    const responses = await Promise.all(promises);
    const results = await Promise.all(responses.map(r => r.json()));
    
    console.log('\n📊 RESULTADOS DOS TESTES SIMULTÂNEOS:');
    results.forEach((result, i) => {
      console.log(`   Request ${i + 1}: Status ${responses[i].status} - ${result.success ? '✅' : '❌'} ${result.message}`);
    });
    
    // Verificar quantos registros foram realmente inseridos
    console.log('\n🔍 VERIFICAÇÃO FINAL NO BANCO...');
    
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
    console.error('❌ Erro no teste do endpoint:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TESTE DO ENDPOINT CONCLUÍDO');
}

testEndpoint();
