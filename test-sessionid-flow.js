// Teste para verificar o fluxo completo do sessionId
// Simula exatamente o que acontece no frontend

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 TESTANDO FLUXO COMPLETO DO SESSIONID...\n');

async function testSessionIdFlow() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Simular geração de sessionId (como no frontend)
    const testSessionId = `session_${Date.now()}_testflow`;
    console.log('🆔 SessionId de teste:', testSessionId);
    
    // 2. Simular captura parcial (clique SIM)
    console.log('\n📝 ETAPA 1: Captura parcial (clique SIM)');
    
    const partialData = {
      session_id: testSessionId,
      is_programmer: true,
      utm_source: 'test_source',
      utm_medium: 'test_medium',
      utm_campaign: 'test_campaign',
      ip_address: '127.0.0.1',
      user_agent: 'test_agent'
    };
    
    const { data: partialResult, error: partialError } = await supabase
      .from('partial_leads')
      .upsert(partialData, { onConflict: 'session_id' })
      .select()
      .single();
    
    if (partialError) {
      console.error('❌ Erro ao salvar dados parciais:', partialError.message);
      return;
    }
    
    console.log('✅ Dados parciais salvos:', partialResult);
    
    // 3. Simular busca dos dados parciais (como no webhook)
    console.log('\n🔍 ETAPA 2: Busca dos dados parciais (webhook)');
    
    const { data: foundPartial, error: searchError } = await supabase
      .from('partial_leads')
      .select('is_programmer, qualification_timestamp')
      .eq('session_id', testSessionId)
      .single();
    
    if (searchError) {
      console.error('❌ Erro ao buscar dados parciais:', searchError.message);
      return;
    }
    
    console.log('✅ Dados parciais encontrados:', foundPartial);
    console.log('🎯 isProgrammer dos dados parciais:', foundPartial.is_programmer);
    
    // 4. Simular salvamento do lead completo
    console.log('\n💾 ETAPA 3: Salvamento do lead completo');
    
    const completeLeadData = {
      email: 'teste-sessionid@gmail.com',
      phone: '+5511999999999',
      is_programmer: foundPartial.is_programmer, // Usar dados parciais
      utm_source: 'test_source',
      utm_medium: 'test_medium',
      utm_campaign: 'test_campaign',
      ip_address: '127.0.0.1',
      user_agent: 'test_agent'
    };
    
    const { data: completeResult, error: completeError } = await supabase
      .from('qualified_leads_jun25')
      .upsert(completeLeadData, { onConflict: 'email' })
      .select()
      .single();
    
    if (completeError) {
      console.error('❌ Erro ao salvar lead completo:', completeError.message);
      return;
    }
    
    console.log('✅ Lead completo salvo:', completeResult);
    console.log('🎯 isProgrammer final:', completeResult.is_programmer);
    
    // 5. Verificar resultado
    console.log('\n📊 RESULTADO DO TESTE:');
    console.log('- Dados parciais isProgrammer:', foundPartial.is_programmer);
    console.log('- Lead completo isProgrammer:', completeResult.is_programmer);
    console.log('- Valores coincidem?', foundPartial.is_programmer === completeResult.is_programmer ? '✅ SIM' : '❌ NÃO');
    
    if (foundPartial.is_programmer === completeResult.is_programmer) {
      console.log('\n🎉 TESTE PASSOU! O fluxo está funcionando corretamente.');
      console.log('🔍 O problema deve estar no frontend não enviando o sessionId.');
    } else {
      console.log('\n❌ TESTE FALHOU! Há problema na lógica do backend.');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
}

testSessionIdFlow()
  .then(() => {
    console.log('\n🏁 TESTE CONCLUÍDO');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
