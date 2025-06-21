/**
 * Sistema de fallback para armazenamento de leads quando o banco de dados Neon não está disponível
 * Este sistema garante que nenhum lead seja perdido, mesmo em caso de falha do banco principal
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { saveLeadToNeon } = require('./neon-backup');

// Configuração do diretório de armazenamento local
const FALLBACK_DIR = path.join(process.cwd(), 'fallback-data');
const FALLBACK_FILE = path.join(FALLBACK_DIR, 'leads.json');

// URL de um webhook externo para backup (opcional)
const BACKUP_WEBHOOK_URL = process.env.BACKUP_WEBHOOK_URL || '';

/**
 * Inicializa o sistema de fallback, criando o diretório se necessário
 */
async function initializeFallbackSystem() {
  try {
    await fs.mkdir(FALLBACK_DIR, { recursive: true });
    // Verifica se o arquivo de leads existe, se não, cria um novo com array vazio
    try {
      await fs.access(FALLBACK_FILE);
    } catch (error) {
      await fs.writeFile(FALLBACK_FILE, JSON.stringify([]));
    }
    return true;
  } catch (error) {
    console.error('Erro ao inicializar sistema de fallback:', error);
    return false;
  }
}

/**
 * Salva um lead no sistema de fallback
 * @param {Object} leadData - Dados do lead a serem salvos
 * @returns {Promise<Object>} - Resultado da operação
 */
async function saveLeadToFallback(leadData) {
  try {
    // Adiciona timestamp ao lead
    const leadWithTimestamp = {
      ...leadData,
      timestamp: new Date().toISOString(),
      source: 'fallback_system'
    };

    // Inicializa o sistema de fallback
    await initializeFallbackSystem();

    // Lê o arquivo atual
    const fileContent = await fs.readFile(FALLBACK_FILE, 'utf8');
    const leads = JSON.parse(fileContent);
    
    // Adiciona o novo lead
    leads.push(leadWithTimestamp);
    
    // Salva o arquivo atualizado
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(leads, null, 2));
    
    // Tenta salvar no backup Neon
    let neonBackupResult = null;
    try {
      neonBackupResult = await saveLeadToNeon(leadWithTimestamp);
      if (neonBackupResult.success) {
        console.log('✅ Lead também salvo no backup Neon');
      } else {
        console.log('⚠️ Falha no backup Neon:', neonBackupResult.message);
      }
    } catch (neonError) {
      console.error('❌ Erro no backup Neon:', neonError.message);
    }
    
    // Tenta enviar para o webhook de backup, se configurado
    if (BACKUP_WEBHOOK_URL) {
      try {
        await axios.post(BACKUP_WEBHOOK_URL, leadWithTimestamp);
      } catch (webhookError) {
        console.error('Erro ao enviar para webhook de backup:', webhookError);
        // Continua mesmo se o webhook falhar
      }
    }
    
    return { 
      success: true, 
      message: 'Lead salvo no sistema de fallback',
      data: leadWithTimestamp,
      neonBackup: neonBackupResult
    };
  } catch (error) {
    console.error('Erro ao salvar lead no sistema de fallback:', error);
    return { 
      success: false, 
      message: 'Erro ao salvar no sistema de fallback',
      error: error.message
    };
  }
}

/**
 * Recupera todos os leads armazenados no sistema de fallback
 * @returns {Promise<Array>} - Array com todos os leads
 */
async function getAllFallbackLeads() {
  try {
    await initializeFallbackSystem();
    const fileContent = await fs.readFile(FALLBACK_FILE, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Erro ao recuperar leads do fallback:', error);
    return [];
  }
}

module.exports = {
  saveLeadToFallback,
  getAllFallbackLeads,
  initializeFallbackSystem
};
