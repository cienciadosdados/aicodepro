// Script para testar a conexão com o banco de dados Neon
// Execute com: node test-neon.js

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// Função para testar a conexão e inserir um registro
async function testNeonConnection() {
  console.log('🧪 Testando conexão com o banco de dados Neon...');
  
  try {
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ Variável de ambiente DATABASE_URL não encontrada');
      return;
    }
    
    console.log('✅ Variável DATABASE_URL encontrada');
    
    // Extrair informações da URL do banco de dados
    const dbUrl = new URL(process.env.DATABASE_URL);
    const username = dbUrl.username;
    const password = dbUrl.password;
    const host = dbUrl.hostname;
    const database = dbUrl.pathname.substring(1);
    
    console.log(`📊 Informações do banco de dados:`);
    console.log(`- Host: ${host}`);
    console.log(`- Database: ${database}`);
    console.log(`- Username: ${username}`);
    
    // Construir URL para a API Neon HTTP
    const neonApiUrl = `https://${host}/sql`;
    
    console.log(`\n🔍 Verificando se a tabela qualified_leads existe...`);
    
    // Verificar se a tabela existe
    const checkTableResponse = await fetch(neonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      },
      body: JSON.stringify({
        query: `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = 'qualified_leads'
          ) as exists
        `
      })
    });
    
    if (!checkTableResponse.ok) {
      throw new Error(`Erro ao verificar tabela: ${checkTableResponse.status} ${checkTableResponse.statusText}`);
    }
    
    const checkResult = await checkTableResponse.json();
    const tableExists = checkResult.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ Tabela qualified_leads existe');
    } else {
      console.log('⚠️ Tabela qualified_leads não existe, criando...');
      
      // Criar a tabela
      const createTableResponse = await fetch(neonApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
        },
        body: JSON.stringify({
          query: `
            CREATE TABLE qualified_leads (
              id SERIAL PRIMARY KEY,
              email VARCHAR(255) UNIQUE NOT NULL,
              phone VARCHAR(50) NOT NULL,
              is_programmer BOOLEAN NOT NULL,
              utm_source VARCHAR(100),
              utm_medium VARCHAR(100),
              utm_campaign VARCHAR(100),
              ip_address VARCHAR(50),
              user_agent TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `
        })
      });
      
      if (!createTableResponse.ok) {
        throw new Error(`Erro ao criar tabela: ${createTableResponse.status} ${createTableResponse.statusText}`);
      }
      
      console.log('✅ Tabela qualified_leads criada com sucesso');
    }
    
    console.log(`\n📝 Inserindo registro de teste...`);
    
    // Inserir um registro de teste
    const testEmail = `test-${Date.now()}@example.com`;
    const insertTestResponse = await fetch(neonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      },
      body: JSON.stringify({
        query: `
          INSERT INTO qualified_leads 
            (email, phone, is_programmer, utm_source, utm_medium, utm_campaign)
          VALUES 
            ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `,
        params: [
          testEmail,
          '(99) 99999-9999',
          true,
          'test',
          'test',
          'test'
        ]
      })
    });
    
    if (!insertTestResponse.ok) {
      throw new Error(`Erro ao inserir registro de teste: ${insertTestResponse.status} ${insertTestResponse.statusText}`);
    }
    
    const insertResult = await insertTestResponse.json();
    console.log('✅ Registro de teste inserido com sucesso:', insertResult.rows[0]);
    
    console.log(`\n🔍 Verificando todos os registros na tabela...`);
    
    // Listar todos os registros
    const listResponse = await fetch(neonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      },
      body: JSON.stringify({
        query: `SELECT * FROM qualified_leads ORDER BY created_at DESC LIMIT 10`
      })
    });
    
    if (!listResponse.ok) {
      throw new Error(`Erro ao listar registros: ${listResponse.status} ${listResponse.statusText}`);
    }
    
    const listResult = await listResponse.json();
    console.log(`✅ Encontrados ${listResult.rows.length} registros:`);
    listResult.rows.forEach((row, index) => {
      console.log(`\n📋 Registro #${index + 1}:`);
      console.log(`- Email: ${row.email}`);
      console.log(`- Telefone: ${row.phone}`);
      console.log(`- É programador: ${row.is_programmer}`);
      console.log(`- Criado em: ${row.created_at}`);
    });
    
    console.log('\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error(`\n❌ Erro durante o teste:`, error.message);
    if (error.response) {
      console.error('Detalhes da resposta:', error.response);
    }
  }
}

// Executar o teste
testNeonConnection();
