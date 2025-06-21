/**
 * Sistema de backup para Neon PostgreSQL
 * Usado como backup secundário quando o Supabase falha
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

/**
 * Salva um lead no banco Neon como backup
 * @param {Object} leadData - Dados do lead
 * @returns {Promise<Object>} - Resultado da operação
 */
async function saveLeadToNeon(leadData) {
  const requestId = `neon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`[${requestId}] 🔄 Tentando salvar lead no Neon backup...`);
  
  if (!process.env.DATABASE_URL) {
    console.log(`[${requestId}] ⚠️ DATABASE_URL não configurada - pulando backup Neon`);
    return { 
      success: false, 
      message: 'DATABASE_URL não configurada',
      requestId 
    };
  }
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: false,
      sslmode: 'require'
    } : false
  });
  
  try {
    await client.connect();
    console.log(`[${requestId}] ✅ Conectado ao Neon`);
    
    // Verificar se a tabela existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'qualified_leads'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log(`[${requestId}] 📋 Criando tabela qualified_leads no Neon...`);
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS qualified_leads (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
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
        CREATE INDEX IF NOT EXISTS idx_qualified_leads_created_at ON qualified_leads(created_at);
      `);
      
      console.log(`[${requestId}] ✅ Tabela criada no Neon`);
    }
    
    // Inserir o lead (sem constraint UNIQUE para permitir duplicatas no backup)
    const result = await client.query(`
      INSERT INTO qualified_leads 
        (email, phone, is_programmer, utm_source, utm_medium, utm_campaign, ip_address, user_agent)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at
    `, [
      leadData.email,
      leadData.phone,
      leadData.is_programmer,
      leadData.utm_source,
      leadData.utm_medium,
      leadData.utm_campaign,
      leadData.ip_address,
      leadData.user_agent
    ]);
    
    const insertedLead = result.rows[0];
    console.log(`[${requestId}] ✅ Lead salvo no Neon - ID: ${insertedLead.id}`);
    
    return {
      success: true,
      message: 'Lead salvo no backup Neon',
      data: {
        id: insertedLead.id,
        email: leadData.email,
        created_at: insertedLead.created_at
      },
      requestId
    };
    
  } catch (error) {
    console.error(`[${requestId}] ❌ Erro no backup Neon:`, error.message);
    
    return {
      success: false,
      message: 'Erro no backup Neon',
      error: error.message,
      requestId
    };
  } finally {
    try {
      await client.end();
    } catch (endError) {
      console.error(`[${requestId}] ⚠️ Erro ao fechar conexão Neon:`, endError.message);
    }
  }
}

/**
 * Testa a conexão com o Neon
 * @returns {Promise<Object>} - Status da conexão
 */
async function testNeonConnection() {
  if (!process.env.DATABASE_URL) {
    return { 
      success: false, 
      message: 'DATABASE_URL não configurada' 
    };
  }
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: false,
      sslmode: 'require'
    } : false
  });
  
  try {
    await client.connect();
    
    // Teste simples de query
    const result = await client.query('SELECT NOW() as current_time');
    
    await client.end();
    
    return {
      success: true,
      message: 'Conexão Neon funcionando',
      data: result.rows[0]
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro na conexão Neon',
      error: error.message
    };
  }
}

module.exports = {
  saveLeadToNeon,
  testNeonConnection
};
