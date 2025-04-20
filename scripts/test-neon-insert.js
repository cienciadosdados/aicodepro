/**
 * Script para testar a inserção direta no banco de dados Neon
 * Este script tenta inserir um registro de teste diretamente no banco de dados
 * Útil para verificar se o problema está na conexão ou na forma como os dados são enviados
 */

// Importar o módulo dotenv para carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

// Importar o módulo pg para conexão com o PostgreSQL
const { Client } = require('pg');

// Função principal para testar a inserção
async function testNeonInsert() {
  console.log('🔍 Iniciando teste de inserção direta no banco de dados Neon...');
  console.log(`🔍 URL do banco: ${process.env.DATABASE_URL.split('@')[0].split(':')[0]}:****@${process.env.DATABASE_URL.split('@')[1]}`);
  
  // Criar cliente com as opções de conexão
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: false,
      sslmode: 'require'
    } : false
  });
  
  try {
    // Conectar ao banco de dados
    console.log('🔍 Tentando conectar ao banco de dados...');
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se a tabela qualified_leads existe
    console.log('🔍 Verificando se a tabela qualified_leads existe...');
    const tableCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'qualified_leads'
      );
    `);
    
    const tableExists = tableCheckResult.rows[0].exists;
    
    if (!tableExists) {
      console.log('⚠️ Tabela qualified_leads não existe. Criando tabela...');
      
      // Criar a tabela se não existir
      await client.query(`
        CREATE TABLE IF NOT EXISTS qualified_leads (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(50),
          is_programmer BOOLEAN NOT NULL,
          utm_source VARCHAR(255),
          utm_medium VARCHAR(255),
          utm_campaign VARCHAR(255),
          ip_address VARCHAR(50),
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_qualified_leads_email ON qualified_leads(email);
        CREATE INDEX IF NOT EXISTS idx_qualified_leads_is_programmer ON qualified_leads(is_programmer);
        CREATE INDEX IF NOT EXISTS idx_qualified_leads_created_at ON qualified_leads(created_at);
      `);
      
      console.log('✅ Tabela qualified_leads criada com sucesso!');
    } else {
      console.log('✅ Tabela qualified_leads existe!');
      
      // Contar registros na tabela
      const countResult = await client.query('SELECT COUNT(*) FROM qualified_leads');
      console.log(`✅ Total de registros na tabela: ${countResult.rows[0].count}`);
    }
    
    // Criar um email de teste único
    const testEmail = `test_direct_${Date.now()}@example.com`;
    
    // Testar inserção de um registro de teste
    console.log(`🔍 Testando inserção direta de um registro de teste (${testEmail})...`);
    
    const insertResult = await client.query(`
      INSERT INTO qualified_leads 
        (email, phone, is_programmer, utm_source, utm_medium, utm_campaign, ip_address, user_agent)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      testEmail,
      '(11) 99999-9999',
      true,
      'direct_script',
      'test',
      'neon_direct_test',
      '127.0.0.1',
      'Direct Test Script'
    ]);
    
    console.log(`✅ Registro de teste inserido com sucesso: ${testEmail}`);
    console.log('Detalhes do registro inserido:');
    console.log(insertResult.rows[0]);
    
    // Testar inserção com valor isProgrammer = false
    const testEmail2 = `test_direct_false_${Date.now()}@example.com`;
    
    console.log(`🔍 Testando inserção com isProgrammer = false (${testEmail2})...`);
    
    const insertResult2 = await client.query(`
      INSERT INTO qualified_leads 
        (email, phone, is_programmer, utm_source, utm_medium, utm_campaign, ip_address, user_agent)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      testEmail2,
      '(11) 88888-8888',
      false,
      'direct_script',
      'test',
      'neon_direct_test',
      '127.0.0.1',
      'Direct Test Script'
    ]);
    
    console.log(`✅ Registro de teste (isProgrammer = false) inserido com sucesso: ${testEmail2}`);
    console.log('Detalhes do registro inserido:');
    console.log(insertResult2.rows[0]);
    
    // Verificar os últimos 5 registros na tabela
    console.log('🔍 Verificando os últimos 5 registros na tabela...');
    
    const recentRecordsResult = await client.query(`
      SELECT * FROM qualified_leads 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('✅ Últimos 5 registros:');
    recentRecordsResult.rows.forEach((record, index) => {
      console.log(`${index + 1}. ${record.email} (isProgrammer: ${record.is_programmer}) - ${record.created_at}`);
    });
    
    console.log('✅ Teste de inserção direta concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o teste de inserção:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Fechar a conexão
    try {
      await client.end();
      console.log('🔍 Conexão fechada');
    } catch (endError) {
      console.error('❌ Erro ao fechar conexão:', endError.message);
    }
  }
}

// Executar o teste
testNeonInsert().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
