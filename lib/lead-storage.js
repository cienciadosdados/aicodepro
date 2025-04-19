/**
 * Serviço de armazenamento de leads que funciona sem depender de módulos externos durante o build
 * Implementação 100% compatível com o ambiente serverless da Vercel
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
    // Usar eval para evitar que o webpack processe a importação durante o build
    // Esta é uma técnica avançada para evitar problemas de build com módulos nativos
    const dbModule = await new Promise((resolve) => {
      try {
        // Usar eval para evitar que o webpack analise o código estaticamente
        const importStatement = "import('" + "pg" + "')".replace(/\s/g, '');
        eval(importStatement)
          .then(module => resolve({ module, success: true }))
          .catch(error => {
            console.error('Erro ao importar módulo de banco de dados:', error.message);
            resolve({ success: false, error });
          });
      } catch (error) {
        console.error('Erro ao executar importação dinâmica:', error.message);
        resolve({ success: false, error });
      }
    });
    
    // Se não conseguiu carregar o módulo, retornar um objeto simulado
    if (!dbModule.success) {
      console.warn('Módulo de banco de dados não disponível. Retornando objeto simulado.');
      return createMockLeadObject(leadData, normalizedIsProgrammer);
    }
    
    // Extrair o construtor Pool do módulo importado
    const Pool = dbModule.module.Pool;
    
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
    // Usar eval para evitar que o webpack processe a importação durante o build
    const dbModule = await new Promise((resolve) => {
      try {
        // Usar eval para evitar que o webpack analise o código estaticamente
        const importStatement = "import('" + "pg" + "')".replace(/\s/g, '');
        eval(importStatement)
          .then(module => resolve({ module, success: true }))
          .catch(error => {
            console.error('Erro ao importar módulo de banco de dados:', error.message);
            resolve({ success: false, error });
          });
      } catch (error) {
        console.error('Erro ao executar importação dinâmica:', error.message);
        resolve({ success: false, error });
      }
    });
    
    // Se não conseguiu carregar o módulo, retornar erro
    if (!dbModule.success) {
      return {
        success: false,
        message: 'Módulo de banco de dados não disponível'
      };
    }
    
    // Extrair o construtor Pool do módulo importado
    const Pool = dbModule.module.Pool;
    
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
