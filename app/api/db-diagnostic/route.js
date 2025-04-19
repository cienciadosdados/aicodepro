/**
 * API endpoint para diagnóstico de conexão com o banco de dados
 * Ferramenta para ajudar a identificar problemas de conexão
 */

import { NextResponse } from 'next/server';

// Importar serviço de banco de dados
let db;
try {
  db = require('@/lib/db');
} catch (error) {
  console.error('Erro ao importar módulo de banco de dados:', error);
  db = null;
}

export async function GET(request) {
  console.log('📊 Executando diagnóstico de banco de dados');
  
  try {
    // Verificar se o módulo de banco de dados foi carregado
    if (!db) {
      return NextResponse.json({
        success: false,
        status: 'Módulo de banco de dados não disponível',
        error: 'Não foi possível carregar o módulo de banco de dados',
        timestamp: new Date().toISOString()
      });
    }
    
    // Testar conexão com o banco de dados
    let connectionTest;
    try {
      connectionTest = await db._testConnection();
    } catch (error) {
      connectionTest = {
        success: false,
        message: `Erro ao testar conexão: ${error.message}`
      };
    }
    
    // Verificar variáveis de ambiente
    const environmentInfo = {
      NODE_ENV: process.env.NODE_ENV || 'não definido',
      VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      DATABASE_URL_PREVIEW: process.env.DATABASE_URL ? 
        `${process.env.DATABASE_URL.split('@')[0].split(':')[0]}:****@${process.env.DATABASE_URL.split('@')[1]}` : 
        'não definido'
    };
    
    // Tentar executar uma query simples
    let queryTest;
    try {
      if (connectionTest.success) {
        const result = await db.query('SELECT NOW() as time');
        queryTest = {
          success: true,
          result: result.rows[0]
        };
      } else {
        queryTest = {
          success: false,
          message: 'Teste de query não executado porque a conexão falhou'
        };
      }
    } catch (error) {
      queryTest = {
        success: false,
        message: `Erro ao executar query: ${error.message}`
      };
    }
    
    // Retornar resultado do diagnóstico
    return NextResponse.json({
      success: connectionTest.success,
      status: connectionTest.success ? 'Banco de dados operacional' : 'Problemas com o banco de dados',
      timestamp: new Date().toISOString(),
      connection: connectionTest,
      environment: environmentInfo,
      query: queryTest,
      serverInfo: {
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error('❌ Erro ao executar diagnóstico:', error);
    
    return NextResponse.json({
      success: false,
      status: 'Erro ao executar diagnóstico',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
