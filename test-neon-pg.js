// Script para testar a conexão com o banco de dados Neon usando o módulo pg
// Execute com: node test-neon-pg.js

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importar o módulo pg
const { Pool } = require('pg');

// Função para testar a conexão e inserir um registro
async function testNeonConnection() {
  console.log('🧪 Testando conexão com o banco de dados Neon...');
  
  try {
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ Variável de ambiente DATABASE_URL não encontrada');
      return;
    }
    
    console.log('✅ Variável DATABASE_URL encontrada');
    
    // Criar pool de conexões
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });
    
    console.log('🔌 Conectando ao banco de dados...');
    
    // Testar conexão
    const connectionResult = await pool.query('SELECT NOW() as time');
    console.log(`✅ Conexão estabelecida. Hora do servidor: ${connectionResult.rows[0].time}`);
    
    console.log(`\n🔍 Verificando se a tabela qualified_leads existe...`);
    
    // Verificar se a tabela existe
    const checkTableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'qualified_leads'
      ) as exists
    `);
    
    const tableExists = checkTableResult.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ Tabela qualified_leads existe');
    } else {
      console.log('⚠️ Tabela qualified_leads não existe, criando...');
      
      // Criar a tabela
      await pool.query(`
        CREATE TABLE qualified_leads (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50) NOT NULL,
          is_programmer BOOLEAN NOT NULL,
          utm_source VARCHAR(100),
          utm_medium VARCHAR(100),
          utm_campaign VARCHAR(100),
          ip_address VARCHAR(50),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabela qualified_leads criada com sucesso');
    }
    
    console.log(`\n📝 Inserindo registro de teste...`);
    
    // Inserir um registro de teste
    const testEmail = `test-${Date.now()}@example.com`;
    const insertResult = await pool.query(`
      INSERT INTO qualified_leads 
        (email, phone, is_programmer, utm_source, utm_medium, utm_campaign)
      VALUES 
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      testEmail,
      '(99) 99999-9999',
      true,
      'test',
      'test',
      'test'
    ]);
    
    console.log('✅ Registro de teste inserido com sucesso:', insertResult.rows[0]);
    
    console.log(`\n🔍 Verificando todos os registros na tabela...`);
    
    // Listar todos os registros
    const listResult = await pool.query(`
      SELECT * FROM qualified_leads ORDER BY created_at DESC LIMIT 10
    `);
    
    console.log(`✅ Encontrados ${listResult.rows.length} registros:`);
    listResult.rows.forEach((row, index) => {
      console.log(`\n📋 Registro #${index + 1}:`);
      console.log(`- Email: ${row.email}`);
      console.log(`- Telefone: ${row.phone}`);
      console.log(`- É programador: ${row.is_programmer}`);
      console.log(`- Criado em: ${row.created_at}`);
    });
    
    // Fechar a conexão
    await pool.end();
    
    console.log('\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error(`\n❌ Erro durante o teste:`, error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Executar o teste
testNeonConnection();
