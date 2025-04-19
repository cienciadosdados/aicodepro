/**
 * Endpoint para verificar e criar a tabela qualified_leads no banco de dados Neon
 * Este endpoint é útil para garantir que a tabela exista antes de tentar salvar leads
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('🔧 Verificando e criando tabela qualified_leads se necessário');
  
  try {
    // Verificar se a variável de ambiente DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        message: 'Variável de ambiente DATABASE_URL não encontrada'
      }, { status: 500 });
    }
    
    // Extrair informações da URL do banco de dados
    const dbUrl = new URL(process.env.DATABASE_URL);
    const username = dbUrl.username;
    const password = dbUrl.password;
    const host = dbUrl.hostname;
    const database = dbUrl.pathname.substring(1);
    
    // Construir URL para a API Neon HTTP
    const neonApiUrl = `https://${host}/sql`;
    
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
      return NextResponse.json({
        success: true,
        message: 'Tabela qualified_leads já existe',
        exists: true
      });
    }
    
    // Criar a tabela se ela não existir
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
    
    // Inserir um registro de teste para verificar se a tabela está funcionando
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
    
    return NextResponse.json({
      success: true,
      message: 'Tabela qualified_leads criada com sucesso',
      created: true,
      test_record: insertResult.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao verificar/criar tabela:', error.message);
    return NextResponse.json({
      success: false,
      message: `Erro ao verificar/criar tabela: ${error.message}`
    }, { status: 500 });
  }
}
