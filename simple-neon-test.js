/**
 * Teste simples e direto de conexão com o Neon PostgreSQL
 */

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importar o módulo pg
const { Pool } = require('pg');

async function testNeonConnection() {
  console.log('🧪 Teste simples de conexão com o Neon PostgreSQL');
  console.log('===============================================');
  
  try {
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ Variável de ambiente DATABASE_URL não encontrada');
      return;
    }
    
    console.log('✅ Variável DATABASE_URL encontrada');
    
    // Criar pool de conexões com timeout estendido
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000 // 15 segundos
    });
    
    console.log('✅ Pool de conexões criado');
    
    // Testar conexão básica
    console.log('\nTestando conexão básica...');
    try {
      const connectionResult = await pool.query('SELECT NOW() as time');
      console.log(`✅ Conexão estabelecida. Hora do servidor: ${connectionResult.rows[0].time}`);
    } catch (error) {
      console.error(`❌ Erro na conexão básica: ${error.message}`);
      if (error.code) {
        console.error(`   Código de erro: ${error.code}`);
      }
      await pool.end();
      return;
    }
    
    // Verificar se a tabela qualified_leads existe
    console.log('\nVerificando se a tabela qualified_leads existe...');
    try {
      const tableCheckResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'qualified_leads'
        ) as exists
      `);
      
      const tableExists = tableCheckResult.rows[0].exists;
      
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
    } catch (error) {
      console.error(`❌ Erro ao verificar tabela: ${error.message}`);
      if (error.code) {
        console.error(`   Código de erro: ${error.code}`);
      }
      await pool.end();
      return;
    }
    
    // Testar inserção de dados
    console.log('\nTestando inserção de dados...');
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      console.log(`Inserindo registro de teste com email: ${testEmail}`);
      
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
      
      console.log('✅ Registro de teste inserido com sucesso:');
      console.log(`- ID: ${insertResult.rows[0].id}`);
      console.log(`- Email: ${insertResult.rows[0].email}`);
      console.log(`- Criado em: ${insertResult.rows[0].created_at}`);
      
      // Verificar se o registro foi realmente inserido
      const verifyResult = await pool.query(`
        SELECT * FROM qualified_leads WHERE email = $1
      `, [testEmail]);
      
      if (verifyResult.rows.length > 0) {
        console.log('✅ Verificação de inserção bem-sucedida');
      } else {
        console.error('❌ Verificação de inserção falhou: registro não encontrado');
      }
    } catch (error) {
      console.error(`❌ Erro ao inserir dados: ${error.message}`);
      if (error.code) {
        console.error(`   Código de erro: ${error.code}`);
      }
      if (error.detail) {
        console.error(`   Detalhes: ${error.detail}`);
      }
    }
    
    // Fechar pool de conexões
    console.log('\nFechando pool de conexões...');
    await pool.end();
    console.log('✅ Pool de conexões fechado');
    
    console.log('\n✅ TESTE CONCLUÍDO');
  } catch (error) {
    console.error(`\n❌ ERRO GERAL: ${error.message}`);
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
  }
}

// Executar o teste
testNeonConnection();
