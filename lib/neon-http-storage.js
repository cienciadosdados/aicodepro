/**
 * Solução robusta para armazenamento de leads usando a API HTTP do Neon
 * Esta implementação não depende do módulo pg, usando fetch diretamente
 * Compatível com Next.js no Vercel e outros ambientes serverless
 */

// Função para executar query no banco de dados Neon via API HTTP
async function executeNeonQuery(query, params = []) {
  // Verificar se estamos no lado do servidor
  if (typeof window !== 'undefined') {
    throw new Error('executeNeonQuery só pode ser chamada no lado do servidor');
  }
  
  // Verificar se a variável de ambiente DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    throw new Error('Variável de ambiente DATABASE_URL não encontrada');
  }
  
  try {
    // Extrair informações da URL do banco de dados
    const dbUrl = new URL(process.env.DATABASE_URL);
    const username = dbUrl.username;
    const password = dbUrl.password;
    const host = dbUrl.hostname;
    
    // Construir URL para a API Neon HTTP
    const neonApiUrl = `https://${host}/sql`;
    
    // Fazer requisição para a API Neon
    const response = await fetch(neonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      },
      body: JSON.stringify({
        query,
        params
      })
    });
    
    // Verificar se a requisição foi bem-sucedida
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na requisição à API Neon: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // Retornar o resultado
    return await response.json();
  } catch (error) {
    console.error('Erro ao executar query via API HTTP do Neon:', error);
    throw error;
  }
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
  console.log('📝 Salvando lead qualificado via API HTTP do Neon:');
  console.log('- Email:', email);
  console.log('- Telefone:', phone);
  console.log('- É programador:', normalizedIsProgrammer);
  
  try {
    // Verificar se estamos no lado do servidor
    if (typeof window !== 'undefined') {
      console.log('Tentativa de salvar lead no lado do cliente. Retornando mock.');
      return createMockLeadObject(leadData, normalizedIsProgrammer, 'Operação no lado do cliente');
    }
    
    // Verificar se a tabela qualified_leads existe
    const tableCheckResult = await executeNeonQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'qualified_leads'
      ) as exists
    `);
    
    const tableExists = tableCheckResult.rows[0].exists;
    
    // Se a tabela não existir, criá-la
    if (!tableExists) {
      console.log('Tabela qualified_leads não existe, criando...');
      await executeNeonQuery(`
        CREATE TABLE qualified_leads (
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
      `);
      console.log('Tabela qualified_leads criada com sucesso');
    }
    
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
    
    // Executar query usando nossa função auxiliar
    const result = await executeNeonQuery(sqlQuery, params);
    console.log('✅ Lead salvo com sucesso via API HTTP do Neon:', email);
    
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
    console.error('❌ Erro ao salvar lead qualificado via API HTTP do Neon:', error.message);
    // Propagar erro para que a rota trate adequadamente
    throw error;
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
    
    // Executar query simples para testar a conexão
    const result = await executeNeonQuery('SELECT NOW() as time');
    
    return {
      success: true,
      message: 'Conexão com o banco de dados estabelecida com sucesso via API HTTP do Neon',
      time: result.rows[0].time
    };
  } catch (error) {
    console.error('Erro ao testar conexão com o banco de dados via API HTTP do Neon:', error.message);
    return {
      success: false,
      message: `Erro ao conectar ao banco de dados via API HTTP do Neon: ${error.message}`
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
