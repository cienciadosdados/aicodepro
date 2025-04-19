// Integração com Supabase para armazenamento de leads
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
)

export async function saveQualifiedLead(leadData) {
  const { data, error } = await supabase
    .from('qualified_leads')
    .insert([{
      email: leadData.email,
      phone: leadData.phone,
      is_programmer: leadData.isProgrammer,
      utm_source: leadData.utmSource,
      utm_medium: leadData.utmMedium,
      utm_campaign: leadData.utmCampaign,
      ip_address: leadData.ipAddress,
      user_agent: leadData.userAgent
    }])
    .select()

  if (error) throw error
  return data[0]
}

export async function testDatabaseConnection() {
  const { count, error } = await supabase
    .from('qualified_leads')
    .select('*', { count: 'exact', head: true })

  return {
    success: !error,
    message: error ? `Erro de conexão: ${error.message}` : 'Conexão com Supabase estabelecida com sucesso'
  }
}
