// Script para inicializar o banco de dados Neon
const { Pool } = require('pg');
const dbConfig = require('../config/database');

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: dbConfig.databaseUrl,
    ...dbConfig.poolConfig
  });

  try {
    console.log('Conectando ao banco de dados Neon...');
    
    // Verificar conexão
    const testResult = await pool.query('SELECT NOW()');
    console.log('Conexão estabelecida:', testResult.rows[0].now);
    
    // Criar tabela de leads qualificados
    console.log('Criando tabela qualified_leads...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS qualified_leads (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        is_programmer BOOLEAN NOT NULL,
        utm_source VARCHAR(255),
        utm_medium VARCHAR(255),
        utm_campaign VARCHAR(255),
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar índices para melhorar a performance
    console.log('Criando índices...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_qualified_leads_email ON qualified_leads(email);
      CREATE INDEX IF NOT EXISTS idx_qualified_leads_is_programmer ON qualified_leads(is_programmer);
      CREATE INDEX IF NOT EXISTS idx_qualified_leads_created_at ON qualified_leads(created_at);
    `);
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  } finally {
    await pool.end();
    console.log('Conexão encerrada');
  }
}

// Executar inicialização
initializeDatabase();
