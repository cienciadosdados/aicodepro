/**
 * Script de diagnóstico detalhado para o Neon PostgreSQL
 * Este script testa cada etapa do processo de conexão e inserção de dados
 */

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importar o módulo pg
const { Pool } = require('pg');

// Função para testar a conexão com o banco de dados Neon
async function diagnoseNeonConnection() {
  console.log('🔍 DIAGNÓSTICO DETALHADO DO NEON POSTGRESQL');
  console.log('===========================================');
  
  try {
    // 1. Verificar se a variável de ambiente DATABASE_URL está configurada
    console.log('\n1. Verificando variável DATABASE_URL...');
    if (!process.env.DATABASE_URL) {
      console.error('❌ Variável de ambiente DATABASE_URL não encontrada');
      return;
    }
    
    console.log('✅ Variável DATABASE_URL encontrada');
    
    // 2. Analisar a string de conexão
    console.log('\n2. Analisando string de conexão...');
    try {
      const dbUrl = new URL(process.env.DATABASE_URL);
      console.log('✅ String de conexão válida');
      console.log(`- Protocolo: ${dbUrl.protocol}`);
      console.log(`- Host: ${dbUrl.hostname}`);
      console.log(`- Porta: ${dbUrl.port || 'default'}`);
      console.log(`- Username: ${dbUrl.username}`);
      console.log(`- Senha: ${'*'.repeat(dbUrl.password.length)}`);
      console.log(`- Banco: ${dbUrl.pathname.substring(1)}`);
      console.log(`- Parâmetros: ${dbUrl.search || 'nenhum'}`);
    } catch (error) {
      console.error(`❌ String de conexão inválida: ${error.message}`);
      return;
    }
    
    // 3. Criar pool de conexões com timeout estendido
    console.log('\n3. Criando pool de conexões...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000, // 15 segundos
      idleTimeoutMillis: 30000,
      max: 1 // Limitar a apenas uma conexão para diagnóstico
    });
    
    console.log('✅ Pool de conexões criado');
    
    // 4. Testar conexão básica
    console.log('\n4. Testando conexão básica...');
    try {
      console.time('Tempo de conexão');
      const connectionResult = await pool.query('SELECT 1 as test');
      console.timeEnd('Tempo de conexão');
      console.log(`✅ Conexão estabelecida: ${JSON.stringify(connectionResult.rows[0])}`);
    } catch (error) {
      console.error(`❌ Erro na conexão básica: ${error.message}`);
      if (error.code) {
        console.error(`   Código de erro: ${error.code}`);
      }
      await pool.end();
      return;
    }
    
    // 5. Verificar se a tabela qualified_leads existe
    console.log('\n5. Verificando se a tabela qualified_leads existe...');
    try {
      const tableCheckResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'qualified_leads'
        ) as exists
      `);
      
      const tableExists = tableCheckResult.rows[0].exists;
      
      if (tableExists) {
        console.log('✅ Tabela qualified_leads existe');
        
        // 5.1 Verificar estrutura da tabela
        const tableStructureResult = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'qualified_leads'
        `);
        
        console.log('   Estrutura da tabela:');
        tableStructureResult.rows.forEach(column => {
          console.log(`   - ${column.column_name} (${column.data_type})`);
        });
        
        // 5.2 Verificar registros existentes
        const countResult = await pool.query('SELECT COUNT(*) as count FROM qualified_leads');
        console.log(`   Total de registros: ${countResult.rows[0].count}`);
        
        if (parseInt(countResult.rows[0].count) > 0) {
          const sampleResult = await pool.query('SELECT * FROM qualified_leads ORDER BY created_at DESC LIMIT 1');
          console.log('   Último registro:');
          console.log(`   - Email: ${sampleResult.rows[0].email}`);
          console.log(`   - Telefone: ${sampleResult.rows[0].phone}`);
          console.log(`   - É programador: ${sampleResult.rows[0].is_programmer}`);
          console.log(`   - Criado em: ${sampleResult.rows[0].created_at}`);
        }
      } else {
        console.log('⚠️ Tabela qualified_leads não existe, criando...');
        
        // Criar a tabela
        await pool.query(`
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
        `);
        
        console.log('✅ Tabela qualified_leads criada com sucesso');
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar tabela: ${error.message}`);
      if (error.code) {
        console.error(`   Código de erro: ${error.code}`);
      }
      await pool.end();
      return;
    }
    
    // 6. Testar inserção de dados
    console.log('\n6. Testando inserção de dados...');
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      console.log(`   Inserindo registro de teste com email: ${testEmail}`);
      
      const insertResult = await pool.query(`
        INSERT INTO qualified_leads 
          (email, phone, is_programmer, utm_source, utm_medium, utm_campaign)
        VALUES 
          ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        testEmail,
        '(99) 99999-9999',
        true,
        'test',
        'test',
        'test'
      ]);
      
      console.log('✅ Registro de teste inserido com sucesso:');
      console.log(`   - ID: ${insertResult.rows[0].id}`);
      console.log(`   - Email: ${insertResult.rows[0].email}`);
      console.log(`   - Criado em: ${insertResult.rows[0].created_at}`);
    } catch (error) {
      console.error(`❌ Erro ao inserir dados: ${error.message}`);
      if (error.code) {
        console.error(`   Código de erro: ${error.code}`);
      }
      if (error.detail) {
        console.error(`   Detalhes: ${error.detail}`);
      }
    }
    
    // 7. Testar o endpoint /api/qualified-lead diretamente
    console.log('\n7. Simulando chamada ao endpoint /api/qualified-lead...');
    try {
      // Importar o módulo para fazer requisições HTTP
      const http = require('http');
      const https = require('https');
      
      // Função para simular uma requisição ao endpoint
      const simulateEndpoint = async () => {
        const testEmail = `test-endpoint-${Date.now()}@example.com`;
        console.log(`   Simulando requisição com email: ${testEmail}`);
        
        const requestData = JSON.stringify({
          email: testEmail,
          phone: '(99) 99999-9999',
          isProgrammer: true,
          utmSource: 'test-endpoint',
          utmMedium: 'test-endpoint',
          utmCampaign: 'test-endpoint'
        });
        
        // Criar uma versão simplificada do módulo saveQualifiedLead
        const { saveQualifiedLead } = require('./lib/simple-lead-storage');
        
        try {
          const result = await saveQualifiedLead({
            email: testEmail,
            phone: '(99) 99999-9999',
            isProgrammer: true,
            utmSource: 'test-endpoint',
            utmMedium: 'test-endpoint',
            utmCampaign: 'test-endpoint',
            ipAddress: '127.0.0.1',
            userAgent: 'Diagnostic Script'
          });
          
          console.log('✅ Simulação do endpoint bem-sucedida:');
          console.log(`   - Resultado: ${JSON.stringify(result)}`);
        } catch (endpointError) {
          console.error(`❌ Erro na simulação do endpoint: ${endpointError.message}`);
          if (endpointError.stack) {
            console.error(`   Stack trace: ${endpointError.stack}`);
          }
        }
      };
      
      await simulateEndpoint();
    } catch (error) {
      console.error(`❌ Erro ao simular endpoint: ${error.message}`);
      if (error.stack) {
        console.error(`   Stack trace: ${error.stack}`);
      }
    }
    
    // 8. Fechar pool de conexões
    console.log('\n8. Fechando pool de conexões...');
    await pool.end();
    console.log('✅ Pool de conexões fechado');
    
    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO');
    console.log('======================');
    console.log('Se todos os testes passaram, o banco de dados Neon está funcionando corretamente.');
    console.log('Se houve algum erro, verifique as mensagens acima para identificar o problema.');
  } catch (error) {
    console.error(`\n❌ ERRO GERAL NO DIAGNÓSTICO: ${error.message}`);
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    console.log('\n❌ DIAGNÓSTICO FALHOU');
  }
}

// Executar o diagnóstico
diagnoseNeonConnection();
