/**
 * Serviço de banco de dados para gerenciar conexões e operações com o Neon PostgreSQL
 * Implementação robusta com retry, logs detalhados e tratamento de erros
 */

// Importações
const { Pool } = require('pg');

// Configuração de conexão
let pool;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 segundo
const MAX_RETRY_DELAY = 30000; // 30 segundos

// Obter a string de conexão do banco de dados
const getDatabaseUrl = () => {
  // Priorizar a variável de ambiente DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('ERRO CRÍTICO: Variável de ambiente DATABASE_URL não encontrada');
    console.error('Verifique se a variável DATABASE_URL está configurada na Vercel');
    
    // Tentar carregar do arquivo de configuração como fallback
    try {
      const dbConfig = require('../config/database').default;
      if (dbConfig && dbConfig.databaseUrl) {
        console.log('Usando URL de banco de dados do arquivo de configuração');
        return dbConfig.databaseUrl;
      }
    } catch (error) {
      console.error('Não foi possível carregar configuração do arquivo database.js:', error.message);
    }
    
    throw new Error('DATABASE_URL não encontrada. Verifique a configuração do ambiente.');
  }
  
  return databaseUrl;
};

// Obter configurações adicionais do pool
const getPoolConfig = () => {
  const defaultConfig = {
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Aumentado para 5 segundos
  };
  
  try {
    const dbConfig = require('../config/database').default;
    if (dbConfig && dbConfig.poolConfig) {
      console.log('Usando configuração de pool do arquivo de configuração');
      return { ...defaultConfig, ...dbConfig.poolConfig };
    }
  } catch (error) {
    // Silenciar erro, usar configuração padrão
  }
  
  return defaultConfig;
};

// Função para inicializar o pool com retry exponencial
const initializePool = async () => {
  if (pool) return pool;
  
  try {
    const databaseUrl = getDatabaseUrl();
    const poolConfig = getPoolConfig();
    
    console.log(`Tentativa ${connectionAttempts + 1} de conexão com o banco de dados Neon...`);
    
    // Criar pool de conexões
    pool = new Pool({
      connectionString: databaseUrl,
      ...poolConfig
    });
    
    // Testar conexão
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco de dados Neon estabelecida:', result.rows[0].now);
    console.log(`String de conexão utilizada: ${databaseUrl.replace(/:[^:]*@/, ':****@')}`);
    
    // Configurar listener para erros de conexão
    pool.on('error', (err) => {
      console.error('Erro inesperado no pool de conexões:', err);
      
      // Se o erro for fatal, reinicializar o pool
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Erro fatal detectado, reinicializando pool...');
        pool = null;
        initializePool().catch(console.error);
      }
    });
    
    // Resetar contador de tentativas
    connectionAttempts = 0;
    
    return pool;
  } catch (error) {
    console.error(`❌ Erro ao conectar ao banco de dados (tentativa ${connectionAttempts + 1}):`, error.message);
    
    // Incrementar contador de tentativas
    connectionAttempts++;
    
    // Se excedeu o número máximo de tentativas, lançar erro
    if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
      console.error(`Número máximo de tentativas (${MAX_RETRY_ATTEMPTS}) excedido. Desistindo.`);
      throw new Error(`Falha ao conectar ao banco de dados após ${MAX_RETRY_ATTEMPTS} tentativas: ${error.message}`);
    }
    
    // Calcular delay com backoff exponencial
    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, connectionAttempts), MAX_RETRY_DELAY);
    console.log(`Tentando novamente em ${delay/1000} segundos...`);
    
    // Esperar e tentar novamente
    await new Promise(resolve => setTimeout(resolve, delay));
    return initializePool();
  }
};

// Função para executar query com retry
const executeQuery = async (query, params, retryCount = 0) => {
  const MAX_QUERY_RETRIES = 3;
  const QUERY_RETRY_DELAY = 1000; // 1 segundo
  
  try {
    // Garantir que o pool está inicializado
    if (!pool) {
      await initializePool();
    }
    
    // Executar query
    return await pool.query(query, params);
  } catch (error) {
    console.error(`Erro ao executar query (tentativa ${retryCount + 1}):`, error.message);
    console.error('Query:', query);
    console.error('Parâmetros:', params);
    
    // Verificar se é um erro de conexão
    const isConnectionError = error.code === 'ECONNREFUSED' || 
                             error.code === 'ETIMEDOUT' || 
                             error.code === '57P01' || // admin_shutdown
                             error.code === '57P02' || // crash_shutdown
                             error.code === '57P03' || // cannot_connect_now
                             error.code === '08006' || // connection_failure
                             error.code === '08001' || // sqlclient_unable_to_establish_sqlconnection
                             error.code === '08004'; // sqlserver_rejected_establishment_of_sqlconnection
    
    // Se for um erro de conexão, reinicializar o pool
    if (isConnectionError) {
      console.log('Erro de conexão detectado, reinicializando pool...');
      pool = null;
    }
    
    // Verificar se deve tentar novamente
    if (retryCount < MAX_QUERY_RETRIES) {
      console.log(`Tentando executar query novamente em ${QUERY_RETRY_DELAY/1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, QUERY_RETRY_DELAY));
      return executeQuery(query, params, retryCount + 1);
    }
    
    // Se excedeu o número máximo de tentativas, lançar erro
    throw error;
  }
};

// Função para salvar lead qualificado
const saveQualifiedLead = async (leadData) => {
  const { email, phone, isProgrammer, utmSource, utmMedium, utmCampaign, ipAddress, userAgent } = leadData;
  
  // Garantir que isProgrammer seja um booleano válido
  let normalizedIsProgrammer = false;
  
  if (isProgrammer === true || isProgrammer === 'true' || isProgrammer === 1) {
    normalizedIsProgrammer = true;
  }
  
  // Log para depuração
  console.log('📝 Salvando lead qualificado:');
  console.log('- Email:', email);
  console.log('- Telefone:', phone);
  console.log('- É programador:', normalizedIsProgrammer);
  console.log('- UTM Source:', utmSource || 'N/A');
  console.log('- UTM Medium:', utmMedium || 'N/A');
  console.log('- UTM Campaign:', utmCampaign || 'N/A');
  console.log('- IP:', ipAddress || 'N/A');
  console.log('- User Agent:', userAgent ? userAgent.substring(0, 50) + '...' : 'N/A');
  
  try {
    const query = `
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
    
    const values = [
      email, 
      phone, 
      normalizedIsProgrammer,
      utmSource || null, 
      utmMedium || null, 
      utmCampaign || null, 
      ipAddress || null,
      userAgent || null
    ];
    
    // Executar query com retry
    const result = await executeQuery(query, values);
    console.log('✅ Lead salvo com sucesso:', result.rows[0].email);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao salvar lead qualificado:', error.message);
    
    // Verificar se é um erro de serialização/deadlock
    if (error.code === '40P01' || error.code === '40001') {
      console.log('Tentando novamente devido a conflito de serialização...');
      return saveQualifiedLead(leadData);
    }
    
    // Registrar erro detalhado
    console.error('Detalhes do erro:', error);
    console.error('Stack trace:', error.stack);
    
    // Relançar erro para tratamento superior
    throw error;
  }
};

// Função para obter estatísticas de leads
const getLeadStats = async () => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN is_programmer THEN 1 ELSE 0 END) as programmer_count,
        SUM(CASE WHEN NOT is_programmer THEN 1 ELSE 0 END) as non_programmer_count
      FROM qualified_leads
    `;
    
    const result = await executeQuery(query);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao obter estatísticas de leads:', error);
    throw error;
  }
};

// Função para obter leads por período
const getLeadsByDateRange = async (startDate, endDate) => {
  try {
    const query = `
      SELECT *
      FROM qualified_leads
      WHERE created_at BETWEEN $1 AND $2
      ORDER BY created_at DESC
    `;
    
    const result = await executeQuery(query, [startDate, endDate]);
    return result.rows;
  } catch (error) {
    console.error('Erro ao obter leads por período:', error);
    throw error;
  }
};

// Inicializar pool na inicialização do módulo
initializePool().catch(error => {
  console.error('Erro ao inicializar pool de conexões:', error.message);
  console.error('A aplicação continuará funcionando, mas as operações de banco de dados podem falhar.');
});

// Fechar pool na finalização do processo
process.on('SIGINT', async () => {
  if (pool) {
    console.log('Fechando pool de conexões...');
    await pool.end();
  }
  process.exit(0);
});

// Exportar funções
module.exports = {
  query: async (text, params) => executeQuery(text, params),
  saveQualifiedLead,
  getLeadStats,
  getLeadsByDateRange,
  // Funções adicionais para diagnóstico
  _testConnection: async () => {
    try {
      await initializePool();
      return { success: true, message: 'Conexão com banco de dados estabelecida com sucesso' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};
