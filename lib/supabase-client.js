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
  try {
    console.log('💾 Tentando salvar lead no Supabase...');
    
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

    console.log('Dados formatados para inserção:', formattedData);

    // Tentar inserir diretamente - se der erro de duplicata, tratar como sucesso
    const { data, error } = await supabase
      .from('qualified_leads')
      .insert([formattedData])
      .select()
      .single();

    if (error) {
      // Se for erro de violação de constraint unique (duplicata), considerar sucesso
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
        console.log('⚠️ Lead duplicado detectado via constraint unique - ignorando');
        
        // Buscar o lead existente para retornar
        const { data: existingLead } = await supabase
          .from('qualified_leads')
          .select('*')
          .eq('email', leadData.email)
          .single();
          
        return {
          success: true,
          message: 'Lead já existe (detectado via constraint unique)',
          data: existingLead,
          isDuplicate: true
        };
      }
      
      // Se for outro tipo de erro, lançar exceção
      console.error('❌ Erro ao inserir lead:', error);
      throw error;
    }

    console.log('✅ Lead salvo com sucesso:', data);
    return {
      success: true,
      message: 'Lead salvo com sucesso',
      data: data
    };

  } catch (error) {
    console.error('❌ Erro geral ao salvar lead:', error);
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
