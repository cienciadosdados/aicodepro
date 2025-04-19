/**
 * Solução simples e robusta para armazenamento de leads
 * Usa fetch nativo para evitar dependências externas
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
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('Variável de ambiente DATABASE_URL não encontrada');
      return createMockLeadObject(leadData, normalizedIsProgrammer);
    }
    
    // Extrair informações da URL do banco de dados
    const dbUrl = new URL(process.env.DATABASE_URL);
    const username = dbUrl.username;
    const password = dbUrl.password;
    const host = dbUrl.hostname;
    const database = dbUrl.pathname.substring(1);
    
    // Construir URL para a API Neon HTTP
    const neonApiUrl = `https://${host}/sql`;
    
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
    
    // Fazer requisição HTTP para o Neon
    const response = await fetch(neonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      },
      body: JSON.stringify({
        query: sqlQuery,
        params: params
      })
    });
    
    // Verificar resposta
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Lead salvo com sucesso:', email);
    
    return {
      email,
      phone,
      is_programmer: normalizedIsProgrammer,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Erro ao salvar lead qualificado:', error.message);
    return createMockLeadObject(leadData, normalizedIsProgrammer);
  }
}

// Função para testar a conexão com o banco de dados
export async function testDatabaseConnection() {
  try {
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        message: 'Variável de ambiente DATABASE_URL não encontrada'
      };
    }
    
    // Extrair informações da URL do banco de dados
    const dbUrl = new URL(process.env.DATABASE_URL);
    const username = dbUrl.username;
    const password = dbUrl.password;
    const host = dbUrl.hostname;
    
    // Construir URL para a API Neon HTTP
    const neonApiUrl = `https://${host}/sql`;
    
    // Fazer requisição HTTP para o Neon
    const response = await fetch(neonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      },
      body: JSON.stringify({
        query: 'SELECT NOW() as time'
      })
    });
    
    // Verificar resposta
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
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
    _mock: true
  };
}
