/**
 * API endpoint para diagnosticar problemas com o módulo pg
 * Este endpoint verifica se o módulo pg está instalado corretamente
 * e tenta estabelecer uma conexão básica com o banco de dados
 */

// Definir explicitamente o runtime como Node.js
export const runtime = 'nodejs';

// Definir o timeout da Edge Function para 10 segundos (máximo permitido)
export const maxDuration = 10;

import { NextResponse } from 'next/server';

// Handler para método GET
export async function GET(request) {
  console.log('📊 Iniciando diagnóstico do módulo pg');
  console.log(`🔍 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log(`🔍 Vercel Env: ${process.env.VERCEL_ENV || 'local'}`);
  
  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'desenvolvimento',
    vercelEnv: process.env.VERCEL_ENV || 'local',
    nodeVersion: process.version,
    databaseUrl: process.env.DATABASE_URL ? 'Configurada (valor oculto)' : 'Não configurada',
    pgModule: {
      installed: false,
      version: null,
      error: null
    },
    connection: {
      success: false,
      error: null,
      details: null
    },
    fallbackSystem: {
      available: false,
      initialized: false,
      error: null
    }
  };
  
  // 1. Verificar se o módulo pg está instalado
  try {
    // Tentar importar o módulo pg
    let pg;
    try {
      pg = await import('pg');
      diagnosticResults.pgModule.installed = true;
      diagnosticResults.pgModule.version = pg.version || 'Desconhecida';
      console.log('✅ Módulo pg encontrado e importado com sucesso');
    } catch (importError) {
      diagnosticResults.pgModule.installed = false;
      diagnosticResults.pgModule.error = importError.message;
      console.error('❌ Erro ao importar módulo pg:', importError.message);
      
      // Se o módulo pg não estiver disponível, verificar o sistema de fallback
      try {
        const { initializeFallbackSystem } = await import('@/lib/fallback-lead-storage');
        diagnosticResults.fallbackSystem.available = true;
        
        try {
          const initialized = await initializeFallbackSystem();
          diagnosticResults.fallbackSystem.initialized = initialized;
          console.log('✅ Sistema de fallback inicializado com sucesso');
        } catch (fallbackInitError) {
          diagnosticResults.fallbackSystem.error = fallbackInitError.message;
          console.error('❌ Erro ao inicializar sistema de fallback:', fallbackInitError.message);
        }
      } catch (fallbackImportError) {
        diagnosticResults.fallbackSystem.error = fallbackImportError.message;
        console.error('❌ Erro ao importar sistema de fallback:', fallbackImportError.message);
      }
      
      // Retornar resultados antecipadamente, já que não podemos testar a conexão sem o pg
      return NextResponse.json(diagnosticResults);
    }
    
    // 2. Testar conexão com o banco de dados
    if (process.env.DATABASE_URL) {
      try {
        console.log('🔍 Testando conexão com o banco de dados...');
        
        // Criar um cliente PostgreSQL
        const client = new pg.Client({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
        });
        
        // Conectar ao banco de dados
        await client.connect();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
        
        // Executar uma consulta simples
        const result = await client.query('SELECT NOW() as time');
        diagnosticResults.connection.success = true;
        diagnosticResults.connection.details = {
          serverTime: result.rows[0].time,
          connectedTo: client.host || 'desconhecido'
        };
        
        // Verificar se a tabela qualified_leads existe
        try {
          const tableCheckResult = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = 'qualified_leads'
            );
          `);
          
          const tableExists = tableCheckResult.rows[0].exists;
          diagnosticResults.connection.details.tableExists = tableExists;
          
          if (tableExists) {
            console.log('✅ Tabela qualified_leads encontrada');
            
            // Verificar estrutura da tabela
            const tableStructureResult = await client.query(`
              SELECT column_name, data_type 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'qualified_leads';
            `);
            
            diagnosticResults.connection.details.tableStructure = tableStructureResult.rows;
            
            // Contar registros na tabela
            const countResult = await client.query('SELECT COUNT(*) FROM qualified_leads');
            diagnosticResults.connection.details.recordCount = parseInt(countResult.rows[0].count);
            console.log(`✅ Tabela qualified_leads contém ${diagnosticResults.connection.details.recordCount} registros`);
          } else {
            console.warn('⚠️ Tabela qualified_leads não encontrada');
          }
        } catch (tableCheckError) {
          console.error('❌ Erro ao verificar tabela:', tableCheckError.message);
          diagnosticResults.connection.details.tableCheckError = tableCheckError.message;
        }
        
        // Fechar a conexão
        await client.end();
      } catch (connectionError) {
        diagnosticResults.connection.success = false;
        diagnosticResults.connection.error = connectionError.message;
        console.error('❌ Erro ao conectar ao banco de dados:', connectionError.message);
        console.error('Detalhes do erro:', connectionError.stack);
      }
    } else {
      diagnosticResults.connection.error = 'DATABASE_URL não configurada';
      console.error('❌ DATABASE_URL não configurada');
    }
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: 'Erro durante o diagnóstico',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
  
  return NextResponse.json(diagnosticResults);
}
