/**
 * API endpoint para diagnóstico detalhado da conexão com o Neon
 * Este endpoint é específico para depuração e não deve ser exposto em produção
 */

// Definir explicitamente o runtime como Node.js
export const runtime = 'nodejs';

// Definir o timeout da Edge Function para 10 segundos (máximo permitido)
export const maxDuration = 10;

import { NextResponse } from 'next/server';

// Função para executar query no banco de dados
async function executeQuery(query, params) {
  // Verificar se estamos no lado do servidor
  if (typeof window !== 'undefined') {
    throw new Error('executeQuery só pode ser chamada no lado do servidor');
  }
  
  // Verificar se a variável de ambiente DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    throw new Error('Variável de ambiente DATABASE_URL não encontrada');
  }
  
  // Log detalhado para depuração
  console.log(`🔍 Tentando conectar ao banco de dados: ${process.env.DATABASE_URL.split('@')[0].split(':')[0]}:****@${process.env.DATABASE_URL.split('@')[1]}`);
  console.log(`🔍 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log(`🔍 Vercel Env: ${process.env.VERCEL_ENV || 'local'}`);
  
  // Importar o módulo pg dinamicamente apenas no servidor
  let pg;
  try {
    pg = await import('pg');
    console.log('✅ Módulo pg importado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao importar módulo pg:', error.message);
    throw new Error(`Falha ao importar módulo pg: ${error.message}`);
  }
  
  // Configurar opções de conexão com tratamento robusto para SSL
  const connectionOptions = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: false,
      // Adicionar opções de SSL mais robustas para o Neon
      sslmode: 'require'
    } : false
  };
  
  console.log(`🔍 Opções de SSL: ${JSON.stringify(connectionOptions.ssl)}`);
  
  // Criar um cliente para esta conexão específica
  const client = new pg.Client(connectionOptions);
  
  try {
    // Conectar ao banco de dados com timeout
    console.log('🔍 Tentando conectar ao banco de dados...');
    
    // Implementar timeout para evitar conexões pendentes indefinidamente
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout ao conectar ao banco de dados')), 10000);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Conexão estabelecida com sucesso');
    
    // Executar a query
    console.log(`🔍 Executando query: ${query.split('\n')[0]}...`);
    const result = await client.query(query, params);
    console.log(`✅ Query executada com sucesso. Linhas afetadas: ${result.rowCount}`);
    
    // Retornar o resultado
    return result;
  } catch (error) {
    console.error(`❌ Erro na operação de banco de dados: ${error.message}`);
    console.error('Stack trace:', error.stack);
    throw error; // Re-lançar o erro para tratamento adequado
  } finally {
    // Garantir que o cliente seja fechado mesmo se houver erro
    try {
      await client.end();
      console.log('🔍 Conexão fechada');
    } catch (endError) {
      console.error('❌ Erro ao fechar conexão:', endError.message);
    }
  }
}

// Handler para método GET (diagnóstico)
export async function GET(request) {
  console.log('🔍 Iniciando diagnóstico detalhado da conexão com o Neon...');
  
  // Coletar informações do ambiente
  const environmentInfo = {
    NODE_ENV: process.env.NODE_ENV || 'não definido',
    VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    DATABASE_URL_PREVIEW: process.env.DATABASE_URL ? 
      `${process.env.DATABASE_URL.split('@')[0].split(':')[0]}:****@${process.env.DATABASE_URL.split('@')[1]}` : 
      'não definido',
    DATABASE_SSL: process.env.DATABASE_SSL || 'não definido',
    RUNTIME: process.env.NEXT_RUNTIME || 'não definido',
    REGION: process.env.VERCEL_REGION || 'não definido'
  };
  
  // Coletar informações do sistema
  const systemInfo = {
    platform: process.platform,
    nodeVersion: process.version,
    arch: process.arch,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  try {
    // Testar conexão com o banco de dados
    console.log('🔍 Testando conexão com o banco de dados...');
    
    // Testar importação do módulo pg
    let pgInfo;
    try {
      const pg = await import('pg');
      pgInfo = {
        success: true,
        version: pg.version || 'desconhecida'
      };
    } catch (pgError) {
      pgInfo = {
        success: false,
        error: pgError.message,
        stack: pgError.stack
      };
    }
    
    // Testar conexão com o banco de dados
    let connectionResult;
    try {
      // Testar query simples
      const result = await executeQuery('SELECT NOW() as time', []);
      connectionResult = {
        success: true,
        time: result.rows[0].time,
        message: 'Conexão com o banco de dados estabelecida com sucesso'
      };
    } catch (dbError) {
      connectionResult = {
        success: false,
        error: dbError.message,
        stack: dbError.stack,
        message: 'Falha ao conectar ao banco de dados'
      };
    }
    
    // Testar tabela qualified_leads
    let tableResult;
    try {
      if (connectionResult.success) {
        // Verificar se a tabela qualified_leads existe
        const tableCheckResult = await executeQuery(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'qualified_leads'
          );
        `, []);
        
        const tableExists = tableCheckResult.rows[0].exists;
        
        if (tableExists) {
          // Contar registros na tabela
          const countResult = await executeQuery('SELECT COUNT(*) FROM qualified_leads', []);
          
          // Obter estrutura da tabela
          const columnsResult = await executeQuery(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'qualified_leads'
            ORDER BY ordinal_position;
          `, []);
          
          // Obter os últimos 5 registros
          const recentRecordsResult = await executeQuery(`
            SELECT * FROM qualified_leads 
            ORDER BY created_at DESC 
            LIMIT 5
          `, []);
          
          tableResult = {
            exists: true,
            recordCount: parseInt(countResult.rows[0].count),
            columns: columnsResult.rows.map(col => ({
              name: col.column_name,
              type: col.data_type
            })),
            recentRecords: recentRecordsResult.rows.map(record => ({
              id: record.id,
              email: record.email,
              isProgrammer: record.is_programmer,
              createdAt: record.created_at
            }))
          };
        } else {
          tableResult = {
            exists: false,
            message: 'Tabela qualified_leads não existe'
          };
        }
      } else {
        tableResult = {
          exists: false,
          message: 'Não foi possível verificar a tabela devido a falha na conexão'
        };
      }
    } catch (tableError) {
      tableResult = {
        exists: false,
        error: tableError.message,
        stack: tableError.stack,
        message: 'Erro ao verificar a tabela qualified_leads'
      };
    }
    
    // Testar inserção de um registro
    let insertResult;
    try {
      if (connectionResult.success && tableResult.exists) {
        // Criar um email de teste único
        const testEmail = `test_debug_${Date.now()}@example.com`;
        
        // Inserir um registro de teste
        const insertResponse = await executeQuery(`
          INSERT INTO qualified_leads 
            (email, phone, is_programmer, utm_source, utm_medium, utm_campaign, ip_address, user_agent)
          VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          testEmail,
          '(00) 00000-0000',
          true,
          'debug_endpoint',
          'diagnostic',
          'neon_test',
          request.headers.get('x-forwarded-for') || 'unknown',
          request.headers.get('user-agent') || 'unknown'
        ]);
        
        insertResult = {
          success: true,
          record: {
            id: insertResponse.rows[0].id,
            email: insertResponse.rows[0].email,
            isProgrammer: insertResponse.rows[0].is_programmer,
            createdAt: insertResponse.rows[0].created_at
          },
          message: 'Registro de teste inserido com sucesso'
        };
      } else {
        insertResult = {
          success: false,
          message: 'Não foi possível inserir um registro de teste devido a falha na conexão ou tabela inexistente'
        };
      }
    } catch (insertError) {
      insertResult = {
        success: false,
        error: insertError.message,
        stack: insertError.stack,
        message: 'Erro ao inserir registro de teste'
      };
    }
    
    // Retornar resultado completo do diagnóstico
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: environmentInfo,
      system: systemInfo,
      pg: pgInfo,
      connection: connectionResult,
      table: tableResult,
      insert: insertResult,
      request: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      }
    });
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      environment: environmentInfo,
      system: systemInfo
    }, { status: 500 });
  }
}
