/**
 * Endpoint para testar diretamente a conexão com o banco de dados Neon
 * Este endpoint tenta estabelecer uma conexão direta com o banco de dados
 * e retorna informações detalhadas sobre o resultado
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('🔍 Executando teste direto de conexão com o banco de dados Neon');
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'não definido',
      VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
    },
    tests: [],
    overall_status: 'pending'
  };
  
  // Verificar se a variável de ambiente está configurada
  if (!process.env.DATABASE_URL) {
    results.tests.push({
      name: 'Verificação de DATABASE_URL',
      success: false,
      message: 'Variável de ambiente DATABASE_URL não encontrada'
    });
    
    results.overall_status = 'failed';
    return NextResponse.json(results);
  }
  
  results.tests.push({
    name: 'Verificação de DATABASE_URL',
    success: true,
    message: 'Variável de ambiente DATABASE_URL encontrada',
    value_preview: `${process.env.DATABASE_URL.split('@')[0].split(':')[0]}:****@${process.env.DATABASE_URL.split('@')[1].substring(0, 20)}...`
  });
  
  // Tentar importar o módulo pg
  let pg;
  try {
    // Usar eval para evitar problemas durante o build
    pg = await new Promise((resolve) => {
      try {
        const importStatement = "import('" + "pg" + "')".replace(/\\s/g, '');
        eval(importStatement)
          .then(module => resolve({ module, success: true }))
          .catch(error => {
            resolve({ success: false, error: error.message });
          });
      } catch (error) {
        resolve({ success: false, error: error.message });
      }
    });
    
    results.tests.push({
      name: 'Importação do módulo pg',
      success: pg.success,
      message: pg.success ? 'Módulo pg importado com sucesso' : `Erro ao importar módulo pg: ${pg.error}`
    });
    
    if (!pg.success) {
      results.overall_status = 'failed';
      return NextResponse.json(results);
    }
  } catch (error) {
    results.tests.push({
      name: 'Importação do módulo pg',
      success: false,
      message: `Erro ao importar módulo pg: ${error.message}`
    });
    
    results.overall_status = 'failed';
    return NextResponse.json(results);
  }
  
  // Tentar estabelecer conexão com o banco de dados
  try {
    const Pool = pg.module.Pool;
    
    // Criar pool de conexões
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    });
    
    results.tests.push({
      name: 'Criação do pool de conexões',
      success: true,
      message: 'Pool de conexões criado com sucesso'
    });
    
    // Tentar executar uma query simples
    try {
      // Adicionar timeout para a query
      const queryPromise = pool.query('SELECT NOW() as time');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao executar query')), 8000);
      });
      
      // Executar com race para evitar bloqueio indefinido
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      results.tests.push({
        name: 'Execução de query',
        success: true,
        message: 'Query executada com sucesso',
        result: result.rows[0]
      });
      
      // Tentar criar a tabela qualified_leads se não existir
      try {
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS qualified_leads (
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
        `;
        
        await pool.query(createTableQuery);
        
        results.tests.push({
          name: 'Criação/verificação da tabela qualified_leads',
          success: true,
          message: 'Tabela qualified_leads verificada/criada com sucesso'
        });
        
        // Tentar inserir um registro de teste
        const testEmail = `test-${Date.now()}@example.com`;
        const insertQuery = `
          INSERT INTO qualified_leads 
            (email, phone, is_programmer, utm_source, utm_medium, utm_campaign)
          VALUES 
            ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        
        const insertResult = await pool.query(insertQuery, [
          testEmail,
          '(99) 99999-9999',
          true,
          'test',
          'test',
          'test'
        ]);
        
        results.tests.push({
          name: 'Inserção de registro de teste',
          success: true,
          message: 'Registro de teste inserido com sucesso',
          record_id: insertResult.rows[0].id
        });
        
      } catch (tableError) {
        results.tests.push({
          name: 'Criação/verificação da tabela qualified_leads',
          success: false,
          message: `Erro ao criar/verificar tabela: ${tableError.message}`,
          error_code: tableError.code || 'N/A',
          error_detail: tableError.detail || 'N/A'
        });
      }
      
    } catch (queryError) {
      results.tests.push({
        name: 'Execução de query',
        success: false,
        message: `Erro ao executar query: ${queryError.message}`,
        error_code: queryError.code || 'N/A',
        error_detail: queryError.detail || 'N/A'
      });
    }
    
    // Fechar pool
    try {
      await pool.end();
      results.tests.push({
        name: 'Fechamento do pool de conexões',
        success: true,
        message: 'Pool de conexões fechado com sucesso'
      });
    } catch (endError) {
      results.tests.push({
        name: 'Fechamento do pool de conexões',
        success: false,
        message: `Erro ao fechar pool: ${endError.message}`
      });
    }
    
  } catch (poolError) {
    results.tests.push({
      name: 'Criação do pool de conexões',
      success: false,
      message: `Erro ao criar pool de conexões: ${poolError.message}`,
      error_code: poolError.code || 'N/A',
      error_detail: poolError.detail || 'N/A'
    });
  }
  
  // Determinar o status geral
  const allSuccessful = results.tests.every(test => test.success);
  results.overall_status = allSuccessful ? 'success' : 'failed';
  
  return NextResponse.json(results);
}
