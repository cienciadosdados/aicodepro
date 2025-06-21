// Supabase client para salvar leads em banco de dados externo
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase com variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmweydircrhrsyhiuhbv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2V5ZGlyY3JocnN5aGl1aGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzM3MTIsImV4cCI6MjA2MDY0OTcxMn0.ltHBeD-GtZRn9lF7onN3BWbjzXZnJgOlnxIdD54GuRQ';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Salvar lead no Supabase
 * @param {Object} leadData - Dados do lead (email, phone, isProgrammer, etc)
 * @returns {Promise} - Resultado da operação
 */
export async function saveLeadToSupabase(leadData) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`💾 [${requestId}] ${timestamp} - Tentando salvar lead no Supabase...`);
    console.log(`📧 [${requestId}] Email: ${leadData.email}`);
    
    // VERIFICAÇÃO MANUAL DE DUPLICATA com proteção contra race conditions
    console.log(`🔍 [${requestId}] Verificando se email já existe (últimos 10 segundos)...`);
    
    // Verificar duplicatas nos últimos 10 segundos para evitar race conditions
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
    
    const { data: existingLead, error: checkError } = await supabase
      .from('qualified_leads')
      .select('id, email, created_at')
      .eq('email', leadData.email)
      .gte('created_at', tenSecondsAgo)
      .limit(1)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = "The result contains 0 rows" (não encontrou)
      console.error(`❌ [${requestId}] Erro na verificação de duplicata:`, checkError);
    }
    
    if (existingLead) {
      console.log(`⚠️ [${requestId}] DUPLICATA DETECTADA - Email criado há poucos segundos:`, {
        id: existingLead.id,
        email: existingLead.email,
        created_at: existingLead.created_at,
        seconds_ago: Math.round((Date.now() - new Date(existingLead.created_at).getTime()) / 1000)
      });
      
      return {
        success: true,
        message: 'Lead já existe (criado recentemente)',
        data: existingLead,
        isDuplicate: true
      };
    }
    
    console.log(`✅ [${requestId}] Email não existe, prosseguindo com inserção...`);
    
    // Preparar dados no formato correto para a tabela qualified_leads
    const formattedData = {
      email: leadData.email,
      phone: leadData.phone,
      is_programmer: leadData.isProgrammer || false,
      utm_source: leadData.utmSource || 'direct',
      utm_medium: leadData.utmMedium || 'none',
      utm_campaign: leadData.utmCampaign || 'none',
      ip_address: leadData.ipAddress || null,
      user_agent: leadData.userAgent || null
    };

    console.log(`📝 [${requestId}] Dados formatados para inserção:`, formattedData);

    // Inserir no banco
    console.log(`🚀 [${requestId}] Executando INSERT no Supabase...`);
    const { data, error } = await supabase
      .from('qualified_leads')
      .insert([formattedData])
      .select()
      .single();

    if (error) {
      console.error(`❌ [${requestId}] Erro ao inserir no Supabase:`, {
        code: error.code,
        message: error.message,
        details: error.details
      });
      throw error;
    }

    console.log(`✅ [${requestId}] Lead INSERIDO COM SUCESSO no Supabase:`, {
      id: data.id,
      email: data.email,
      created_at: data.created_at
    });
    
    return {
      success: true,
      message: 'Lead salvo com sucesso',
      data: data
    };

  } catch (error) {
    console.error(`❌ [${requestId}] Erro geral ao salvar lead:`, error.message);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao salvar lead'
    };
  }
}

/**
 * Obter todos os leads do Supabase
 * @returns {Promise} - Array de leads
 */
export async function getAllLeads() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao obter leads do Supabase:', error);
    return { success: false, error: error.message };
  }
}

export default supabase;
