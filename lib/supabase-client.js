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
  const requestId = Math.random().toString(36).substring(2, 8);
  console.log(`[${requestId}] 🚀 Iniciando saveLeadToSupabase para ${leadData.email}`);

  try {
    const formattedData = {
      email: leadData.email?.toLowerCase()?.trim(),
      phone: leadData.phone?.trim(),
      is_programmer: leadData.is_programmer || false,
      utm_source: leadData.utm_source || 'direct',
      utm_medium: leadData.utm_medium || 'none', 
      utm_campaign: leadData.utm_campaign || 'none',
      ip_address: leadData.ip_address,
      user_agent: leadData.user_agent
    };

    console.log(`[${requestId}] 📝 Dados formatados:`, formattedData);
    
    // ESTRATÉGIA ATÔMICA: Tentar UPSERT primeiro (se constraint existir)
    console.log(`[${requestId}] 🔄 Tentando UPSERT atômico na qualified_leads_aug25...`);
    
    const { data, error } = await supabase
      .from('qualified_leads_aug25')
      .upsert(formattedData, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.log(`[${requestId}] ⚠️ UPSERT falhou:`, error.message);
      
      // Se UPSERT falhar porque não há constraint, fazer INSERT com tratamento de duplicata
      if (error.message && error.message.includes('no unique or exclusion constraint')) {
        console.log(`[${requestId}] 🔄 Fallback: Tentando INSERT direto...`);
        
        const { data: insertData, error: insertError } = await supabase
          .from('qualified_leads_aug25')
          .insert(formattedData)
          .select()
          .single();
          
        if (insertError) {
          // Se erro 23505 (violação unique), é duplicata - tratar como sucesso
          if (insertError.code === '23505') {
            console.log(`[${requestId}] ✅ DUPLICATA DETECTADA (23505) - Lead já existe, tratando como sucesso`);
            return { success: true, isDuplicate: true, data: null };
          }
          
          console.error(`[${requestId}] ❌ Erro no INSERT:`, insertError);
          throw insertError;
        }
        
        console.log(`[${requestId}] ✅ INSERT realizado com sucesso:`, insertData);
        return { success: true, isDuplicate: false, data: insertData };
      }
      
      throw error;
    }

    console.log(`[${requestId}] ✅ UPSERT realizado com sucesso:`, data);
    return { success: true, isDuplicate: false, data };

  } catch (error) {
    console.error(`[${requestId}] ❌ Erro em saveLeadToSupabase:`, error);
    throw error;
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
