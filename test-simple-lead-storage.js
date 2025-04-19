/**
 * Teste da nova implementação do simple-lead-storage.js
 */

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importar a função para salvar lead qualificado
const { saveQualifiedLead, testDatabaseConnection } = require('./lib/simple-lead-storage');

async function runTest() {
  console.log('🧪 Testando a nova implementação do simple-lead-storage.js');
  console.log('======================================================');
  
  try {
    // 1. Testar conexão com o banco de dados
    console.log('\n1. Testando conexão com o banco de dados...');
    const connectionResult = await testDatabaseConnection();
    
    if (connectionResult.success) {
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
      console.log(`   Hora do servidor: ${connectionResult.time}`);
    } else {
      console.error(`❌ Falha na conexão com o banco de dados: ${connectionResult.message}`);
      return;
    }
    
    // 2. Testar salvamento de lead
    console.log('\n2. Testando salvamento de lead...');
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`   Salvando lead de teste com email: ${testEmail}`);
    
    const leadData = {
      email: testEmail,
      phone: '(99) 99999-9999',
      isProgrammer: true,
      utmSource: 'test',
      utmMedium: 'test',
      utmCampaign: 'test',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script'
    };
    
    const savedLead = await saveQualifiedLead(leadData);
    
    if (savedLead._mock) {
      console.error('❌ Lead não foi salvo no banco de dados, retornou objeto simulado');
      console.error(`   Motivo possível: ${savedLead._mockReason || 'desconhecido'}`);
    } else {
      console.log('✅ Lead salvo com sucesso no banco de dados:');
      console.log(`   - Email: ${savedLead.email}`);
      console.log(`   - Telefone: ${savedLead.phone}`);
      console.log(`   - É programador: ${savedLead.is_programmer}`);
      console.log(`   - Criado em: ${savedLead.created_at}`);
    }
    
    console.log('\n✅ TESTE CONCLUÍDO');
  } catch (error) {
    console.error(`\n❌ ERRO GERAL: ${error.message}`);
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
  }
}

// Executar o teste
runTest();
