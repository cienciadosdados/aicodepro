// Script para verificar os registros no banco de dados
const { Pool } = require('pg');
const dbConfig = require('../config/database');

async function checkDatabase() {
  const pool = new Pool({
    connectionString: dbConfig.databaseUrl,
    ...dbConfig.poolConfig
  });

  try {
    console.log('Conectando ao banco de dados Neon...');
    
    // Verificar conexão
    const testResult = await pool.query('SELECT NOW()');
    console.log('Conexão estabelecida:', testResult.rows[0].now);
    
    // Consultar os últimos registros
    console.log('\n=== Últimos registros na tabela qualified_leads ===');
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        phone, 
        is_programmer, 
        utm_source, 
        utm_medium, 
        utm_campaign,
        created_at
      FROM qualified_leads
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    // Exibir os resultados
    if (result.rows.length === 0) {
      console.log('Nenhum registro encontrado.');
    } else {
      result.rows.forEach(row => {
        console.log(`\nID: ${row.id}`);
        console.log(`Email: ${row.email}`);
        console.log(`Phone: ${row.phone}`);
        console.log(`Is Programmer: ${row.is_programmer} (${typeof row.is_programmer})`);
        console.log(`UTM Source: ${row.utm_source || 'N/A'}`);
        console.log(`UTM Medium: ${row.utm_medium || 'N/A'}`);
        console.log(`UTM Campaign: ${row.utm_campaign || 'N/A'}`);
        console.log(`Created At: ${row.created_at}`);
        console.log('-'.repeat(50));
      });
    }
    
    // Verificar se há algum registro com is_programmer = true
    const trueResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM qualified_leads
      WHERE is_programmer = true
    `);
    
    console.log(`\nTotal de registros com is_programmer = TRUE: ${trueResult.rows[0].count}`);
    
    // Verificar se há algum registro com is_programmer = false
    const falseResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM qualified_leads
      WHERE is_programmer = false
    `);
    
    console.log(`Total de registros com is_programmer = FALSE: ${falseResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Erro ao consultar banco de dados:', error);
  } finally {
    await pool.end();
    console.log('\nConexão encerrada');
  }
}

// Executar verificação
checkDatabase();
