// Supabase client para salvar leads em banco de dados externo
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase com variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmweydircrhrsyhiuhbv.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2V5ZGlyY3JocnN5aGl1aGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzM3MTIsImV4cCI6MjA2MDY0OTcxMn0.ltHBeD-GtZRn9lF7onN3BWbjzXZnJgOlnxIdD54GuRQ';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Salvar lead no Supabase
 * @param {Object} leadData - Dados do lead (email, phone, isProgrammer, etc)
 * @returns {Promise} - Resultado da operação
 */
export async function saveLeadToSupabase(leadData) {
  try {
    // Preparar dados no formato correto para a tabela qualified_leads
    const formattedData = {
      email: leadData.email,
      phone: leadData.phone,
      is_programmer: leadData.isProgrammer || false,
      utm_source: leadData.utmSource || '',
      utm_medium: leadData.utmMedium || '',
      utm_campaign: leadData.utmCampaign || '',
      ip_address: leadData.ipAddress || '',
      user_agent: leadData.userAgent || ''
    };
    
    // Inserir na tabela 'qualified_leads'
    const { data, error } = await supabase
      .from('qualified_leads')
      .insert([formattedData]);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao salvar lead no Supabase:', error);
    return { success: false, error: error.message };
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
