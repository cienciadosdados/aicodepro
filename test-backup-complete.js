// Teste completo dos sistemas de backup com Neon integrado
const { saveLeadToFallback } = require('./lib/fallback-lead-storage.js');
const { testNeonConnection, saveLeadToNeon } = require('./lib/neon-backup.js');

async function testCompleteBackup() {
  console.log('🧪 TESTE COMPLETO DOS SISTEMAS DE BACKUP');
  console.log('=' .repeat(60));
  
  try {
    // 1. TESTAR CONEXÃO NEON
    console.log('\n🔥 TESTE 1: Conexão Neon');
    
    const neonTest = await testNeonConnection();
    console.log('📊 Resultado da conexão Neon:', neonTest);
    
    if (neonTest.success) {
      console.log('✅ Neon conectado e funcionando!');
    } else {
      console.log('❌ Problema na conexão Neon:', neonTest.message);
    }
    
    // 2. TESTAR BACKUP NEON DIRETO
    console.log('\n🔥 TESTE 2: Backup Neon Direto');
    
    const testLead = {
      email: `neon.direct.${Date.now()}@aicodepro.com`,
      phone: '(11) 98765-4321',
      is_programmer: true,
      utm_source: 'teste-neon',
      utm_medium: 'script',
      utm_campaign: 'backup-direto',
      ip_address: '127.0.0.1',
      user_agent: 'Neon Direct Test'
    };
    
    console.log('📝 Testando lead:', testLead.email);
    
    const neonDirectResult = await saveLeadToNeon(testLead);
    console.log('📊 Resultado backup Neon direto:', neonDirectResult);
    
    // 3. TESTAR SISTEMA DE FALLBACK COMPLETO (LOCAL + NEON)
    console.log('\n🔥 TESTE 3: Sistema de Fallback Completo');
    
    const fallbackLead = {
      email: `fallback.complete.${Date.now()}@aicodepro.com`,
      phone: '(11) 99999-8888',
      is_programmer: false,
      utm_source: 'teste-fallback',
      utm_medium: 'script',
      utm_campaign: 'backup-completo',
      ip_address: '192.168.1.1',
      user_agent: 'Fallback Complete Test'
    };
    
    console.log('📝 Testando lead completo:', fallbackLead.email);
    
    const fallbackResult = await saveLeadToFallback(fallbackLead);
    console.log('📊 Resultado fallback completo:', fallbackResult);
    
    if (fallbackResult.success) {
      console.log('✅ Sistema de fallback funcionando!');
      
      if (fallbackResult.neonBackup) {
        if (fallbackResult.neonBackup.success) {
          console.log('✅ Backup Neon também funcionou!');
        } else {
          console.log('⚠️ Backup Neon falhou:', fallbackResult.neonBackup.message);
        }
      }
    }
    
    // 4. TESTAR MÚLTIPLOS BACKUPS SIMULTÂNEOS
    console.log('\n🔥 TESTE 4: Múltiplos Backups Simultâneos');
    
    const promises = Array(3).fill().map((_, i) => {
      const lead = {
        email: `multi.backup.${Date.now()}.${i}@aicodepro.com`,
        phone: `(11) 9999${i}-000${i}`,
        is_programmer: i % 2 === 0,
        utm_source: 'teste-multi',
        utm_medium: 'script',
        utm_campaign: `backup-simultaneo-${i}`,
        ip_address: '10.0.0.1',
        user_agent: `Multi Backup Test ${i + 1}`
      };
      
      console.log(`🚀 Disparando backup ${i + 1}: ${lead.email}`);
      return saveLeadToFallback(lead);
    });
    
    const results = await Promise.all(promises);
    
    console.log('\n📊 RESULTADOS DOS BACKUPS MÚLTIPLOS:');
    results.forEach((result, i) => {
      const localStatus = result.success ? '✅' : '❌';
      const neonStatus = result.neonBackup?.success ? '✅' : '❌';
      
      console.log(`   Backup ${i + 1}:`);
      console.log(`     Local: ${localStatus} ${result.message}`);
      console.log(`     Neon:  ${neonStatus} ${result.neonBackup?.message || 'N/A'}`);
    });
    
    // 5. RESUMO FINAL
    console.log('\n🔥 RESUMO FINAL DOS SISTEMAS:');
    
    const localWorking = results.every(r => r.success);
    const neonWorking = results.every(r => r.neonBackup?.success);
    
    console.log(`📁 Backup Local: ${localWorking ? '✅ FUNCIONANDO' : '❌ PROBLEMA'}`);
    console.log(`🗄️ Backup Neon:  ${neonWorking ? '✅ FUNCIONANDO' : '❌ PROBLEMA'}`);
    
    if (localWorking && neonWorking) {
      console.log('\n🎉 TODOS OS SISTEMAS DE BACKUP FUNCIONANDO PERFEITAMENTE!');
    } else if (localWorking) {
      console.log('\n⚠️ Backup local OK, mas Neon com problemas');
    } else {
      console.log('\n❌ Problemas nos sistemas de backup');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TESTE COMPLETO DE BACKUP CONCLUÍDO');
}

testCompleteBackup();
