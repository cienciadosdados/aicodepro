/**
 * Serviço de armazenamento de leads que funciona sem depender de pg durante o build
 * Implementação robusta que carrega o módulo pg dinamicamente em runtime
 */

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
    // Carregar o módulo pg dinamicamente apenas em runtime
    // Isso evita problemas durante o build
    const { Pool } = await import('pg').catch(error => {
      console.error('Erro ao importar módulo pg:', error.message);
      return { Pool: null };
    });
    
    // Se não conseguiu carregar o módulo pg, retornar um objeto simulado
    if (!Pool) {
      console.warn('Módulo pg não disponível. Retornando objeto simulado.');
      return createMockLeadObject(leadData, normalizedIsProgrammer);
    }
    
    // Obter string de conexão do banco de dados
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('Variável de ambiente DATABASE_URL não encontrada');
      return createMockLeadObject(leadData, normalizedIsProgrammer);
    }
    
    // Criar pool de conexões
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
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
      
      // Executar query
      const result = await pool.query(query, values);
      
      // Fechar pool após uso
      await pool.end();
      
      console.log('✅ Lead salvo com sucesso:', result.rows[0].email);
      return result.rows[0];
    } catch (dbError) {
      console.error('❌ Erro ao executar query:', dbError.message);
      
      // Fechar pool em caso de erro
      try {
        await pool.end();
      } catch (endError) {
        console.error('Erro ao fechar pool:', endError.message);
      }
      
      // Se for um erro de serialização/deadlock, tentar novamente
      if (dbError.code === '40P01' || dbError.code === '40001') {
        console.log('Tentando novamente devido a conflito de serialização...');
        return saveQualifiedLead(leadData);
      }
      
      // Em caso de erro, retornar um objeto simulado
      return createMockLeadObject(leadData, normalizedIsProgrammer);
    }
  } catch (error) {
    console.error('❌ Erro ao salvar lead qualificado:', error.message);
    return createMockLeadObject(leadData, normalizedIsProgrammer);
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
    _mock: true
  };
}

// Função para testar conexão com o banco de dados
export async function testDatabaseConnection() {
  try {
    // Carregar o módulo pg dinamicamente
    const { Pool } = await import('pg').catch(error => {
      console.error('Erro ao importar módulo pg:', error.message);
      return { Pool: null };
    });
    
    // Se não conseguiu carregar o módulo pg, retornar erro
    if (!Pool) {
      return {
        success: false,
        message: 'Módulo pg não disponível'
      };
    }
    
    // Obter string de conexão do banco de dados
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return {
        success: false,
        message: 'Variável de ambiente DATABASE_URL não encontrada'
      };
    }
    
    // Criar pool de conexões
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    
    try {
      // Testar conexão
      const result = await pool.query('SELECT NOW()');
      
      // Fechar pool após uso
      await pool.end();
      
      return {
        success: true,
        message: 'Conexão com banco de dados estabelecida com sucesso',
        timestamp: result.rows[0].now
      };
    } catch (dbError) {
      // Fechar pool em caso de erro
      try {
        await pool.end();
      } catch (endError) {
        console.error('Erro ao fechar pool:', endError.message);
      }
      
      return {
        success: false,
        message: `Erro ao testar conexão: ${dbError.message}`,
        error: dbError
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro ao testar conexão: ${error.message}`,
      error
    };
  }
}
