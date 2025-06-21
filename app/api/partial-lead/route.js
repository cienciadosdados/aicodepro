// API para capturar dados parciais do lead (apenas qualificação)
// Salva o isProgrammer assim que o usuário clica SIM/NÃO

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  const requestId = Math.random().toString(36).substring(2, 8);
  
  try {
    console.log(`🚀 [${requestId}] Iniciando captura de lead parcial...`);
    
    const data = await request.json();
    console.log(`📝 [${requestId}] Dados recebidos:`, data);
    
    const { 
      sessionId, 
      isProgrammer, 
      utmSource, 
      utmMedium, 
      utmCampaign,
      userAgent,
      ipAddress 
    } = data;
    
    // Validar dados obrigatórios
    if (!sessionId || isProgrammer === undefined || isProgrammer === null) {
      console.error(`❌ [${requestId}] Dados incompletos:`, { sessionId, isProgrammer });
      return new Response(JSON.stringify({
        error: 'Dados incompletos',
        details: 'sessionId e isProgrammer são obrigatórios'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Normalizar isProgrammer
    const normalizedIsProgrammer = isProgrammer === true || 
                                   String(isProgrammer) === 'true' || 
                                   Number(isProgrammer) === 1;
    
    console.log(`🔍 [${requestId}] isProgrammer normalizado:`, normalizedIsProgrammer);
    
    // Obter IP da requisição se não fornecido
    const clientIp = ipAddress || 
                     request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const clientUserAgent = userAgent || request.headers.get('user-agent') || 'unknown';
    
    // Dados para salvar
    const partialLeadData = {
      session_id: sessionId,
      is_programmer: normalizedIsProgrammer,
      utm_source: utmSource || 'direct',
      utm_medium: utmMedium || 'none',
      utm_campaign: utmCampaign || 'none',
      ip_address: clientIp,
      user_agent: clientUserAgent,
      qualification_timestamp: new Date().toISOString(),
      status: 'partial' // Indica que é um lead parcial
    };
    
    console.log(`💾 [${requestId}] Salvando lead parcial:`, partialLeadData);
    
    // Salvar na tabela de leads parciais
    const { data: savedData, error } = await supabase
      .from('partial_leads')
      .upsert(partialLeadData, { 
        onConflict: 'session_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (error) {
      console.error(`❌ [${requestId}] Erro ao salvar lead parcial:`, error);
      return new Response(JSON.stringify({
        error: 'Erro interno',
        details: 'Falha ao salvar dados parciais'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`✅ [${requestId}] Lead parcial salvo com sucesso:`, savedData);
    
    return new Response(JSON.stringify({
      success: true,
      sessionId: sessionId,
      isProgrammer: normalizedIsProgrammer,
      message: 'Qualificação salva com sucesso'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error(`💥 [${requestId}] Erro inesperado:`, error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Método GET para verificar status
export async function GET(request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    return new Response(JSON.stringify({
      error: 'sessionId é obrigatório'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const { data, error } = await supabase
      .from('partial_leads')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (error || !data) {
      return new Response(JSON.stringify({
        found: false,
        message: 'Lead parcial não encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      found: true,
      data: data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Erro interno',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
