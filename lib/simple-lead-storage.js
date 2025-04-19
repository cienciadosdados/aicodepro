/**
 * Solução simples e robusta para armazenamento de leads
 * Usa o módulo pg para conexão com o PostgreSQL
 */
const { Pool } = require('pg');

// Criar um pool de conexões reutilizável
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// Função para salvar lead qualificado
async function saveQualifiedLead(leadData) {
  const { email, phone, isProgrammer, utmSource, utmMedium, utmCampaign, ipAddress, userAgent } = leadData;
  
  // Normalizar isProgrammer para garantir que seja um booleano válido
  const normalizedIsProgrammer = isProgrammer === true || 
                               isProgrammer === 'true' || 
                               isProgrammer === 1 || 
                               isProgrammer === '1';
  
  // Log para depuração
  console.log('📝 Salvando lead qualificado:');
  console.log('- Email:', email);
  console.log('- Telefone:', phone);
  console.log('- É programador:', normalizedIsProgrammer);
  
  try {
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('Variável de ambiente DATABASE_URL não encontrada');
      return createMockLeadObject(leadData, normalizedIsProgrammer);
    }
    
    // Obter pool de conexões
    const dbPool = getPool();
    
    // Preparar query SQL
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
    
    // Executar query
    const result = await dbPool.query(sqlQuery, params);
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
    return createMockLeadObject(leadData, normalizedIsProgrammer);
  }
}

// Função para testar a conexão com o banco de dados
async function testDatabaseConnection() {
  try {
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        message: 'Variável de ambiente DATABASE_URL não encontrada'
      };
    }
    
    // Obter pool de conexões
    const dbPool = getPool();
    
    // Executar query simples para testar a conexão
    const result = await dbPool.query('SELECT NOW() as time');
    
    return {
      success: true,
      message: 'Conexão com o banco de dados estabelecida com sucesso',
      time: result.rows[0].time
    };
  } catch (error) {
    console.error('Erro ao testar conexão com o banco de dados:', error.message);
    return {
      success: false,
      message: `Erro ao conectar ao banco de dados: ${error.message}`
    };
  }
}

// Função para criar um objeto simulado de lead
function createMockLeadObject(leadData, normalizedIsProgrammer) {
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
    _mockReason: 'Erro de conexão com o banco de dados'
  };
}

// Exportar as funções
module.exports = {
  saveQualifiedLead,
  testDatabaseConnection
};
