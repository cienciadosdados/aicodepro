/**
 * Script para testar a conexão com o banco de dados Neon
 * Executa uma verificação completa da conexão e da estrutura da tabela
 * Útil para diagnosticar problemas de conexão em diferentes ambientes
 */

// Importar o módulo dotenv para carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

// Importar o módulo pg para conexão com o PostgreSQL
const { Client } = require('pg');

// Função principal para testar a conexão
async function testDatabaseConnection() {
  console.log('🔍 Iniciando teste de conexão com o banco de dados Neon...');
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
    
    // Testar consulta simples
    console.log('🔍 Executando consulta de teste...');
    const timeResult = await client.query('SELECT NOW() as time');
    console.log(`✅ Consulta executada com sucesso. Hora do servidor: ${timeResult.rows[0].time}`);
    
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
    
    if (tableExists) {
      console.log('✅ Tabela qualified_leads existe!');
      
      // Contar registros na tabela
      const countResult = await client.query('SELECT COUNT(*) FROM qualified_leads');
      console.log(`✅ Total de registros na tabela: ${countResult.rows[0].count}`);
      
      // Verificar estrutura da tabela
      console.log('🔍 Verificando estrutura da tabela...');
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'qualified_leads'
        ORDER BY ordinal_position;
      `);
      
      console.log('✅ Estrutura da tabela:');
      columnsResult.rows.forEach(column => {
        console.log(`   - ${column.column_name}: ${column.data_type}`);
      });
    } else {
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
    }
    
    // Testar inserção de um registro de teste
    console.log('🔍 Testando inserção de um registro de teste...');
    const testEmail = `test_${Date.now()}@example.com`;
    
    await client.query(`
      INSERT INTO qualified_leads 
        (email, phone, is_programmer, utm_source, utm_medium, utm_campaign, ip_address, user_agent)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) 
      DO UPDATE SET 
        phone = $2,
        is_programmer = $3,
        utm_source = $4,
        utm_medium = $5,
        utm_campaign = $6,
        ip_address = $7,
        user_agent = $8,
        created_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      testEmail,
      '(11) 99999-9999',
      true,
      'test_script',
      'diagnostic',
      'db_test',
      '127.0.0.1',
      'Test Script User Agent'
    ]);
    
    console.log(`✅ Registro de teste inserido com sucesso: ${testEmail}`);
    
    // Verificar se o registro foi inserido
    const verifyResult = await client.query('SELECT * FROM qualified_leads WHERE email = $1', [testEmail]);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Registro encontrado na tabela:');
      console.log(verifyResult.rows[0]);
    } else {
      console.log('❌ Registro não encontrado na tabela!');
    }
    
    console.log('✅ Teste de conexão concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o teste de conexão:', error.message);
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
testDatabaseConnection().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
