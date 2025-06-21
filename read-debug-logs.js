// Script para ler logs de debug automaticamente
// Executa: node read-debug-logs.js

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LOG_FILE = join(process.cwd(), 'debug-logs.json');

console.log('📋 LENDO LOGS DE DEBUG...\n');

try {
  if (!existsSync(LOG_FILE)) {
    console.log('⚠️ Arquivo de logs não encontrado. Execute alguns testes primeiro.');
    process.exit(0);
  }

  const fileContent = readFileSync(LOG_FILE, 'utf8');
  const logs = JSON.parse(fileContent);

  if (logs.length === 0) {
    console.log('📭 Nenhum log encontrado.');
    process.exit(0);
  }

  console.log(`📊 Total de logs: ${logs.length}\n`);

  // Agrupar logs por tipo
  const logsByType = {};
  logs.forEach(log => {
    if (!logsByType[log.type]) {
      logsByType[log.type] = [];
    }
    logsByType[log.type].push(log);
  });

  // Mostrar resumo por tipo
  console.log('📈 RESUMO POR TIPO:');
  Object.keys(logsByType).forEach(type => {
    console.log(`- ${type}: ${logsByType[type].length} logs`);
  });
  console.log('');

  // Mostrar logs mais recentes
  console.log('🔍 ÚLTIMOS 10 LOGS:');
  const recentLogs = logs.slice(-10);
  
  recentLogs.forEach((log, index) => {
    const time = new Date(log.timestamp).toLocaleTimeString('pt-BR');
    console.log(`\n${index + 1}. [${time}] ${log.type.toUpperCase()}: ${log.message}`);
    
    if (log.data) {
      console.log('   Dados:', JSON.stringify(log.data, null, 2).split('\n').map(line => '   ' + line).join('\n'));
    }
  });

  // Análise específica para sessionId
  console.log('\n🆔 ANÁLISE DE SESSION ID:');
  
  const sessionLogs = logs.filter(log => 
    log.type === 'session' || 
    (log.data && log.data.sessionId) ||
    log.message.includes('sessionId')
  );
  
  if (sessionLogs.length > 0) {
    console.log(`📊 Logs relacionados a sessionId: ${sessionLogs.length}`);
    
    sessionLogs.forEach((log, index) => {
      const time = new Date(log.timestamp).toLocaleTimeString('pt-BR');
      console.log(`\n${index + 1}. [${time}] ${log.message}`);
      
      if (log.data && log.data.sessionId) {
        console.log(`   SessionId: ${log.data.sessionId}`);
      }
      
      if (log.data && log.data.hasSessionId !== undefined) {
        console.log(`   Tem SessionId: ${log.data.hasSessionId}`);
      }
    });
  } else {
    console.log('⚠️ Nenhum log relacionado a sessionId encontrado');
  }

  // Análise de leads parciais
  console.log('\n🎯 ANÁLISE DE LEADS PARCIAIS:');
  
  const partialLogs = logs.filter(log => 
    log.type === 'partial_lead' || 
    log.message.includes('parcial')
  );
  
  if (partialLogs.length > 0) {
    console.log(`📊 Logs de leads parciais: ${partialLogs.length}`);
    
    partialLogs.forEach((log, index) => {
      const time = new Date(log.timestamp).toLocaleTimeString('pt-BR');
      console.log(`\n${index + 1}. [${time}] ${log.message}`);
      
      if (log.data && log.data.isProgrammer !== undefined) {
        console.log(`   isProgrammer: ${log.data.isProgrammer}`);
      }
    });
  } else {
    console.log('⚠️ Nenhum log de lead parcial encontrado');
  }

  // Análise de submissões completas
  console.log('\n📤 ANÁLISE DE SUBMISSÕES COMPLETAS:');
  
  const submitLogs = logs.filter(log => 
    log.type === 'form_submit' || 
    log.message.includes('Enviando dados completos')
  );
  
  if (submitLogs.length > 0) {
    console.log(`📊 Logs de submissões: ${submitLogs.length}`);
    
    submitLogs.forEach((log, index) => {
      const time = new Date(log.timestamp).toLocaleTimeString('pt-BR');
      console.log(`\n${index + 1}. [${time}] ${log.message}`);
      
      if (log.data) {
        console.log(`   Email: ${log.data.email}`);
        console.log(`   Tem SessionId: ${log.data.hasSessionId}`);
        console.log(`   SessionId: ${log.data.sessionId}`);
        console.log(`   isProgrammer: ${log.data.isProgrammer}`);
      }
    });
  } else {
    console.log('⚠️ Nenhum log de submissão encontrado');
  }

} catch (error) {
  console.error('❌ Erro ao ler logs:', error.message);
}

console.log('\n🏁 ANÁLISE CONCLUÍDA');
