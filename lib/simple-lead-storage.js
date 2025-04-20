/**
 * Solução simples e robusta para armazenamento de leads
 * Implementação compatível com Next.js no Vercel
 * Não importa o módulo pg durante o build
 */

// Função para executar query no banco de dados
// Esta função só é chamada no lado do servidor
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

// Função para salvar lead qualificado
async function saveQualifiedLead(leadData) {
  const { email, phone, isProgrammer, utmSource, utmMedium, utmCampaign, ipAddress, userAgent } = leadData;
  
  // Normalizar isProgrammer para garantir que seja um booleano válido
  const normalizedIsProgrammer = isProgrammer === true || 
                               isProgrammer === 'true' || 
                               isProgrammer === 1 || 
                               isProgrammer === '1' ||
                               (typeof isProgrammer === 'string' && isProgrammer.toLowerCase() === 'true');
  
  // Log detalhado para depuração
  console.log('📝 Salvando lead qualificado:');
  console.log('- Email:', email);
  console.log('- Telefone:', phone);
  console.log('- Valor original de isProgrammer:', isProgrammer, typeof isProgrammer);
  console.log('- Valor normalizado de isProgrammer:', normalizedIsProgrammer, typeof normalizedIsProgrammer);
  console.log('- UTM Source:', utmSource || 'não definido');
  console.log('- UTM Medium:', utmMedium || 'não definido');
  console.log('- UTM Campaign:', utmCampaign || 'não definido');
  console.log('- IP:', ipAddress || 'não definido');
  console.log('- User Agent:', userAgent ? userAgent.substring(0, 50) + '...' : 'não definido');
  
  try {
    // Verificar se estamos no lado do servidor
    if (typeof window !== 'undefined') {
      console.log('⚠️ Tentativa de salvar lead no lado do cliente. Retornando mock.');
      return createMockLeadObject(leadData, normalizedIsProgrammer, 'Operação no lado do cliente');
    }
    
    // Verificar se estamos em ambiente de produção no Vercel
    const isVercelProduction = process.env.VERCEL_ENV === 'production';
    console.log(`🔍 Ambiente de execução: ${isVercelProduction ? 'Vercel Produção' : 'Outro ambiente'}`);
    
    // Verificar se DATABASE_URL está configurado
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não está configurado!');
      return createMockLeadObject(leadData, normalizedIsProgrammer, 'DATABASE_URL não configurado');
    }
    
    // Preparar query SQL com tratamento de erros mais robusto
    const sqlQuery = `
      INSERT INTO qualified_leads 
        (email, phone, is_programmer, utm_source, utm_medium, utm_campaign, ip_address, user_agent)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) 
      DO UPDATE SET 
        phone = $2,
        is_programmer = $3,
        utm_source = $4,
        utm_medium = $5,
        utm_campaign = $6,
        ip_address = $7,
        user_agent = $8,
        created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    // Verificar se a tabela existe e criá-la se necessário
    try {
      // Verificar se a tabela existe
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'qualified_leads'
        );
      `;
      
      const tableExists = await executeQuery(checkTableQuery, []);
      
      if (!tableExists.rows[0].exists) {
        console.log('🔍 Tabela qualified_leads não existe. Criando tabela...');
        
        // Criar a tabela se não existir
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS qualified_leads (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
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
          CREATE INDEX IF NOT EXISTS idx_qualified_leads_is_programmer ON qualified_leads(is_programmer);
          CREATE INDEX IF NOT EXISTS idx_qualified_leads_created_at ON qualified_leads(created_at);
        `;
        
        await executeQuery(createTableQuery, []);
        console.log('✅ Tabela qualified_leads criada com sucesso!');
      } else {
        console.log('✅ Tabela qualified_leads já existe.');
      }
    } catch (tableError) {
      console.error('❌ Erro ao verificar/criar tabela:', tableError.message);
      // Continuar com a inserção mesmo se houver erro na verificação da tabela
    }
    
    // Preparar parâmetros
    const params = [
      email, 
      phone, 
      normalizedIsProgrammer,
      utmSource || null, 
      utmMedium || null, 
      utmCampaign || null, 
      ipAddress || null,
      userAgent || null
    ];
    
    // Executar query usando nossa função auxiliar
    const result = await executeQuery(sqlQuery, params);
    console.log('✅ Lead salvo com sucesso:', email);
    
    // Retornar o lead salvo
    return {
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      is_programmer: result.rows[0].is_programmer,
      utm_source: result.rows[0].utm_source,
      utm_medium: result.rows[0].utm_medium,
      utm_campaign: result.rows[0].utm_campaign,
      ip_address: result.rows[0].ip_address,
      user_agent: result.rows[0].user_agent,
      created_at: result.rows[0].created_at
    };
  } catch (error) {
    console.error('❌ Erro ao salvar lead qualificado:', error.message);
    console.error('Stack trace completo:', error.stack);
    
    // Tentar salvar em um arquivo de log local se estiver em ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = require('fs');
        const logEntry = `\n[${new Date().toISOString()}] ERRO: ${error.message}\n${error.stack}\n---\n`;
        fs.appendFileSync('db-errors.log', logEntry);
      } catch (logError) {
        console.error('Não foi possível salvar o log de erro:', logError.message);
      }
    }
    
    // Retornar um objeto simulado para não bloquear o fluxo do usuário
    return createMockLeadObject(leadData, normalizedIsProgrammer, error.message);
  }
}

// Função para testar a conexão com o banco de dados
async function testDatabaseConnection() {
  try {
    // Verificar se estamos no lado do servidor
    if (typeof window !== 'undefined') {
      return {
        success: false,
        message: 'Teste de conexão só pode ser executado no lado do servidor'
      };
    }
    
    // Verificar se DATABASE_URL está configurado
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        message: 'DATABASE_URL não está configurado',
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'não definido',
          VERCEL_ENV: process.env.VERCEL_ENV || 'não definido'
        }
      };
    }
    
    // Executar query simples para testar a conexão
    console.log('🔍 Testando conexão com o banco de dados...');
    const result = await executeQuery('SELECT NOW() as time', []);
    
    // Verificar se a tabela qualified_leads existe
    const tableCheckResult = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'qualified_leads'
      );
    `, []);
    
    const tableExists = tableCheckResult.rows[0].exists;
    
    return {
      success: true,
      message: 'Conexão com o banco de dados estabelecida com sucesso',
      time: result.rows[0].time,
      tableExists,
      databaseUrl: `${process.env.DATABASE_URL.split('@')[0].split(':')[0]}:****@${process.env.DATABASE_URL.split('@')[1]}`,
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'não definido',
        VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
        DATABASE_SSL: process.env.DATABASE_SSL || 'não definido'
      }
    };
  } catch (error) {
    console.error('❌ Erro ao testar conexão com o banco de dados:', error.message);
    console.error('Stack trace:', error.stack);
    
    return {
      success: false,
      message: `Erro ao conectar ao banco de dados: ${error.message}`,
      error: error.message,
      stack: error.stack,
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'não definido',
        VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DATABASE_SSL: process.env.DATABASE_SSL || 'não definido'
      }
    };
  }
}

// Função para criar um objeto simulado de lead
function createMockLeadObject(leadData, normalizedIsProgrammer, reason = 'Erro de conexão com o banco de dados') {
  const { email, phone, utmSource, utmMedium, utmCampaign, ipAddress, userAgent } = leadData;
  
  return {
    email,
    phone,
    is_programmer: normalizedIsProgrammer,
    utm_source: utmSource || null,
    utm_medium: utmMedium || null,
    utm_campaign: utmCampaign || null,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    created_at: new Date().toISOString(),
    _mock: true,
    _mockReason: reason
  };
}

// Exportar as funções como módulos ES
export {
  saveQualifiedLead,
  testDatabaseConnection
};

// Nota: Não há nenhuma referência direta ao módulo 'pg' neste arquivo
// O módulo só é carregado dinamicamente em tempo de execução no servidor
