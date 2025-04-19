/**
 * Serviço de armazenamento de leads para o banco de dados Neon PostgreSQL
 * Implementação simplificada com foco na confiabilidade
 */

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
    _mock: true
  };
}

// Função para testar a conexão com o banco de dados
export async function testDatabaseConnection() {
  try {
    // Importar o módulo pg de forma dinâmica
    const { Pool } = await import('pg');
    
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        message: 'Variável de ambiente DATABASE_URL não encontrada'
      };
    }
    
    // Criar pool de conexões
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    
    // Testar conexão
    const result = await pool.query('SELECT NOW() as time');
    await pool.end();
    
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

// Função para salvar lead qualificado
export async function saveQualifiedLead(leadData) {
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
    // Importar o módulo pg de forma dinâmica
    const { Pool } = await import('pg');
    
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('Variável de ambiente DATABASE_URL não encontrada');
      return createMockLeadObject(leadData, normalizedIsProgrammer);
    }
    
    // Criar pool de conexões
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });
    
    try {
      // Query para inserir ou atualizar lead
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
      
      console.log('Executando query para salvar lead...');
      const result = await pool.query(query, values);
      
      // Fechar pool após uso
      await pool.end();
      
      console.log('✅ Lead salvo com sucesso:', result.rows[0].email);
      return result.rows[0];
    } catch (dbError) {
      console.error('❌ Erro ao executar query:', dbError.message);
      console.error('Código de erro:', dbError.code || 'N/A');
      
      // Fechar pool em caso de erro
      try {
        await pool.end();
      } catch (endError) {
        console.error('Erro ao fechar pool:', endError.message);
      }
      
      // Em caso de erro, retornar um objeto simulado
      return createMockLeadObject(leadData, normalizedIsProgrammer);
    }
  } catch (error) {
    console.error('❌ Erro ao salvar lead qualificado:', error.message);
    return createMockLeadObject(leadData, normalizedIsProgrammer);
  }
}
