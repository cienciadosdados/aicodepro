// API para capturar logs do frontend automaticamente
// POST /api/debug-logs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LOG_FILE = join(process.cwd(), 'debug-logs.json');

export async function POST(request) {
  try {
    const { type, message, data, timestamp } = await request.json();
    
    // Criar estrutura do log
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      type: type || 'info',
      message,
      data,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    };
    
    // Ler logs existentes
    let logs = [];
    if (existsSync(LOG_FILE)) {
      try {
        const fileContent = readFileSync(LOG_FILE, 'utf8');
        logs = JSON.parse(fileContent);
      } catch (error) {
        console.log('Erro ao ler logs existentes, criando novo arquivo');
      }
    }
    
    // Adicionar novo log
    logs.push(logEntry);
    
    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }
    
    // Salvar logs
    writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    
    console.log('📝 Log capturado:', logEntry);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erro ao salvar log:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request) {
  try {
    let logs = [];
    
    if (existsSync(LOG_FILE)) {
      const fileContent = readFileSync(LOG_FILE, 'utf8');
      logs = JSON.parse(fileContent);
    }
    
    // Filtrar logs por tipo se especificado
    const url = new URL(request.url);
    const typeFilter = url.searchParams.get('type');
    const lastN = url.searchParams.get('last');
    
    if (typeFilter) {
      logs = logs.filter(log => log.type === typeFilter);
    }
    
    if (lastN) {
      logs = logs.slice(-parseInt(lastN));
    }
    
    return new Response(JSON.stringify(logs, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erro ao ler logs:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
