// Teste completo dos sistemas de backup
const { saveLeadToFallback, getAllFallbackLeads } = require('./lib/fallback-lead-storage.js');
const fs = require('fs').promises;
const path = require('path');

async function testBackupSystems() {
  console.log('🧪 TESTANDO SISTEMAS DE BACKUP');
  console.log('=' .repeat(50));
  
  try {
    // 1. TESTAR BACKUP LOCAL
    console.log('\n🔥 TESTE 1: Sistema de Backup Local');
    
    const testLead = {
      email: `backup.test.${Date.now()}@aicodepro.com`,
      phone: '(11) 99999-9999',
      is_programmer: true,
      utm_source: 'teste-backup',
      utm_medium: 'script',
      utm_campaign: 'verificacao-backup',
      ip_address: '127.0.0.1',
      user_agent: 'Backup Test Script'
    };
    
    console.log('📝 Dados do teste:', testLead);
    
    // Salvar no sistema de fallback
    const fallbackResult = await saveLeadToFallback(testLead);
    console.log('✅ Resultado do backup local:', fallbackResult);
    
    // 2. VERIFICAR SE O ARQUIVO FOI CRIADO
    console.log('\n🔥 TESTE 2: Verificação do Arquivo de Backup');
    
    const fallbackDir = path.join(process.cwd(), 'fallback-data');
    const fallbackFile = path.join(fallbackDir, 'leads.json');
    
    try {
      const fileExists = await fs.access(fallbackFile).then(() => true).catch(() => false);
      console.log(`📁 Diretório fallback-data existe: ${fileExists}`);
      
      if (fileExists) {
        const fileStats = await fs.stat(fallbackFile);
        console.log(`📄 Arquivo leads.json existe: ${fileStats.isFile()}`);
        console.log(`📊 Tamanho do arquivo: ${fileStats.size} bytes`);
        console.log(`🕒 Última modificação: ${fileStats.mtime}`);
        
        // Ler conteúdo do arquivo
        const fileContent = await fs.readFile(fallbackFile, 'utf8');
        const leads = JSON.parse(fileContent);
        console.log(`📈 Total de leads no backup: ${leads.length}`);
        
        // Mostrar os últimos 3 leads
        const recentLeads = leads.slice(-3);
        console.log('\n📋 Últimos 3 leads no backup:');
        recentLeads.forEach((lead, i) => {
          console.log(`   ${i + 1}. ${lead.email} - ${lead.timestamp}`);
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar arquivo:', error);
    }
    
    // 3. TESTAR RECUPERAÇÃO DE LEADS
    console.log('\n🔥 TESTE 3: Recuperação de Leads do Backup');
    
    const allLeads = await getAllFallbackLeads();
    console.log(`📊 Total de leads recuperados: ${allLeads.length}`);
    
    if (allLeads.length > 0) {
      console.log('✅ Sistema de backup local funcionando corretamente!');
    } else {
      console.log('⚠️ Nenhum lead encontrado no backup');
    }
    
    // 4. TESTAR MÚLTIPLOS SAVES
    console.log('\n🔥 TESTE 4: Múltiplos Saves Simultâneos');
    
    const promises = Array(3).fill().map((_, i) => {
      return saveLeadToFallback({
        ...testLead,
        email: `backup.multi.${Date.now()}.${i}@aicodepro.com`,
        user_agent: `Backup Test Script - ${i + 1}`
      });
    });
    
    const results = await Promise.all(promises);
    console.log('📊 Resultados dos saves múltiplos:');
    results.forEach((result, i) => {
      console.log(`   Save ${i + 1}: ${result.success ? '✅' : '❌'} ${result.message}`);
    });
    
    // 5. VERIFICAR VARIÁVEIS DE AMBIENTE PARA NEON
    console.log('\n🔥 TESTE 5: Verificação de Configuração Neon');
    
    console.log('🔍 Variáveis de ambiente:');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
    console.log(`   DATABASE_SSL: ${process.env.DATABASE_SSL || 'não definida'}`);
    console.log(`   BACKUP_WEBHOOK_URL: ${process.env.BACKUP_WEBHOOK_URL ? '✅ Configurada' : '❌ Não configurada'}`);
    
    // 6. TESTAR CONEXÃO NEON (se configurada)
    if (process.env.DATABASE_URL) {
      console.log('\n🔥 TESTE 6: Teste de Conexão Neon');
      
      try {
        const { Client } = require('pg');
        const client = new Client({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_SSL === 'true' ? {
            rejectUnauthorized: false,
            sslmode: 'require'
          } : false
        });
        
        await client.connect();
        console.log('✅ Conexão Neon estabelecida com sucesso!');
        
        // Verificar se a tabela qualified_leads existe
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'qualified_leads'
          );
        `);
        
        console.log(`📋 Tabela qualified_leads existe: ${tableCheck.rows[0].exists ? '✅' : '❌'}`);
        
        await client.end();
      } catch (neonError) {
        console.error('❌ Erro na conexão Neon:', neonError.message);
      }
    } else {
      console.log('⚠️ DATABASE_URL não configurada - pulando teste Neon');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 TESTE DE BACKUP CONCLUÍDO');
}

testBackupSystems();
