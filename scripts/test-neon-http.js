// Script para testar a implementação HTTP do Neon
// Execute com: node scripts/test-neon-http.js

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importar o módulo neon-http-storage
const { saveQualifiedLead, testDatabaseConnection } = require('../lib/neon-http-storage');

// Função para testar a conexão e inserir um registro
async function testNeonHttpImplementation() {
  console.log('🧪 Testando implementação HTTP do Neon...');
  
  try {
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ Variável de ambiente DATABASE_URL não encontrada');
      return;
    }
    
    console.log('✅ Variável DATABASE_URL encontrada');
    
    // Testar conexão com o banco de dados
    console.log('\n📊 Testando conexão com o banco de dados...');
    const connectionTest = await testDatabaseConnection();
    
    if (connectionTest.success) {
      console.log('✅ Conexão estabelecida com sucesso');
      console.log(`- Mensagem: ${connectionTest.message}`);
      console.log(`- Timestamp: ${connectionTest.time}`);
    } else {
      console.error('❌ Falha na conexão com o banco de dados');
      console.error(`- Mensagem: ${connectionTest.message}`);
      return;
    }
    
    // Testar inserção de um lead qualificado
    console.log('\n📝 Testando inserção de lead qualificado...');
    
    const testEmail = `test-http-${Date.now()}@example.com`;
    console.log(`- Email de teste: ${testEmail}`);
    
    const savedLead = await saveQualifiedLead({
      email: testEmail,
      phone: '(99) 99999-9999',
      isProgrammer: true,
      utmSource: 'test-http',
      utmMedium: 'test-http',
      utmCampaign: 'test-http',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script'
    });
    
    console.log('✅ Lead salvo com sucesso:');
    console.log(`- Email: ${savedLead.email}`);
    console.log(`- Telefone: ${savedLead.phone}`);
    console.log(`- É programador: ${savedLead.is_programmer}`);
    console.log(`- Criado em: ${savedLead.created_at}`);
    
    // Testar inserção de um lead não programador
    console.log('\n📝 Testando inserção de lead não programador...');
    
    const testEmail2 = `test-http-false-${Date.now()}@example.com`;
    console.log(`- Email de teste: ${testEmail2}`);
    
    const savedLead2 = await saveQualifiedLead({
      email: testEmail2,
      phone: '(99) 88888-8888',
      isProgrammer: false,
      utmSource: 'test-http',
      utmMedium: 'test-http',
      utmCampaign: 'test-http',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script'
    });
    
    console.log('✅ Lead salvo com sucesso:');
    console.log(`- Email: ${savedLead2.email}`);
    console.log(`- Telefone: ${savedLead2.phone}`);
    console.log(`- É programador: ${savedLead2.is_programmer}`);
    console.log(`- Criado em: ${savedLead2.created_at}`);
    
    console.log('\n✅ Teste concluído com sucesso!');
    console.log('A implementação HTTP do Neon está funcionando corretamente.');
  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Executar o teste
testNeonHttpImplementation();
