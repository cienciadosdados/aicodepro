/**
 * API endpoint para diagnóstico de conexão com o banco de dados
 * Ferramenta para ajudar a identificar problemas de conexão
 * Força o uso do runtime Node.js para compatibilidade com o módulo pg
 */

// Definir explicitamente o runtime como Node.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

// Importar serviço de armazenamento de leads via API HTTP do Neon
// Esta solução não depende do módulo pg, usando fetch diretamente
import { testDatabaseConnection } from '@/lib/neon-http-storage';

export async function GET(request) {
  console.log('📊 Executando diagnóstico de banco de dados');
  
  try {
    // Testar conexão com o banco de dados
    let connectionTest;
    try {
      connectionTest = await testDatabaseConnection();
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
    
    // Verificar resultado do teste de conexão
    let queryTest = {
      success: connectionTest.success,
      message: connectionTest.success ? 
        'Conexão com banco de dados estabelecida com sucesso' : 
        'Teste de query não executado porque a conexão falhou',
      timestamp: connectionTest.timestamp || new Date().toISOString()
    };
    
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
