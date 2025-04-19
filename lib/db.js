// Serviço de banco de dados para gerenciar conexões e operações com o Neon
import { Pool } from 'pg';

// Tentar importar a configuração do banco de dados
// No ambiente de produção, usamos variáveis de ambiente
let dbConfig;
try {
  dbConfig = require('../config/database').default;
} catch (error) {
  console.log('Usando configuração de banco de dados baseada em variáveis de ambiente');
  // Configuração padrão baseada em variáveis de ambiente para Vercel
  dbConfig = {
    databaseUrl: process.env.DATABASE_URL,
    poolConfig: {
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  };
}

// Criar pool de conexões
const pool = new Pool({
  connectionString: dbConfig.databaseUrl,
  ...dbConfig.poolConfig
});

// Testar conexão na inicialização
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão com banco de dados estabelecida:', res.rows[0].now);
  }
});

// Função para salvar lead qualificado
export async function saveQualifiedLead(leadData) {
  const { email, phone, isProgrammer, utmSource, utmMedium, utmCampaign, ipAddress, userAgent } = leadData;
  
  // Garantir que isProgrammer seja um booleano válido
  // Verificar todas as possíveis representações de TRUE
  let normalizedIsProgrammer = false;
  
  if (isProgrammer === true || isProgrammer === 'true' || isProgrammer === 1) {
    normalizedIsProgrammer = true;
  }
  
  // Log para depuração
  console.log('Valor original de isProgrammer:', isProgrammer, typeof isProgrammer);
  console.log('Valor normalizado de isProgrammer:', normalizedIsProgrammer);
  
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
      normalizedIsProgrammer, // Usar o valor normalizado
      utmSource || null, 
      utmMedium || null, 
      utmCampaign || null, 
      ipAddress || null,
      userAgent || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao salvar lead qualificado:', error);
    // Tentar novamente com retry lógico
    if (error.code === '40P01' || error.code === '40001') { // Códigos de erro de serialização/deadlock
      console.log('Tentando novamente devido a conflito de serialização...');
      return saveQualifiedLead(leadData);
    }
    throw error;
  }
}

// Função para obter estatísticas de leads
export async function getLeadStats() {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN is_programmer THEN 1 ELSE 0 END) as programmer_count,
        SUM(CASE WHEN NOT is_programmer THEN 1 ELSE 0 END) as non_programmer_count
      FROM qualified_leads
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao obter estatísticas de leads:', error);
    throw error;
  }
}

// Função para obter leads por período
export async function getLeadsByDateRange(startDate, endDate) {
  try {
    const query = `
      SELECT *
      FROM qualified_leads
      WHERE created_at BETWEEN $1 AND $2
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  } catch (error) {
    console.error('Erro ao obter leads por período:', error);
    throw error;
  }
}

// Fechar pool na finalização do processo
process.on('SIGINT', () => {
  pool.end();
  process.exit(0);
});

export default {
  query: (text, params) => pool.query(text, params),
  saveQualifiedLead,
  getLeadStats,
  getLeadsByDateRange
};
