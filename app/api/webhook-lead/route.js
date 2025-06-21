/**
 * API endpoint otimizado para receber dados via navigator.sendBeacon
 * Este endpoint é projetado para ser chamado antes do redirecionamento da página
 * Implementação robusta com tratamento de erros e logs detalhados
 */

// Definir explicitamente o runtime como Node.js
export const runtime = 'nodejs';

// Definir o timeout da Edge Function para 10 segundos (máximo permitido)
export const maxDuration = 10;

import { NextResponse } from 'next/server';

// Importar serviços de armazenamento de leads
import { saveLeadToSupabase } from '@/lib/supabase-client';
import { saveLeadToFallback } from '@/lib/fallback-lead-storage';

// Handler para método POST
export async function POST(request) {
  const requestId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString();
  
  console.log(`📝 [${requestId}] ${timestamp} - Recebida requisição POST para /api/webhook-lead via sendBeacon`);
  console.log(`🔍 [${requestId}] Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log(`🔍 [${requestId}] Vercel Env: ${process.env.VERCEL_ENV || 'local'}`);
  console.log(`🔍 [${requestId}] DATABASE_URL configurada: ${!!process.env.DATABASE_URL}`);
  
  try {
    // Obter dados do corpo da requisição com tratamento de erros robusto
    let data;
    try {
      data = await request.json();
      console.log(`📝 [${requestId}] Dados recebidos via webhook:`, JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error(`❌ [${requestId}] Erro ao processar JSON da requisição:`, parseError.message);
      return new Response(JSON.stringify({
        error: 'Formato de dados inválido',
        details: parseError.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { email, phone, isProgrammer, sessionId, utmSource, utmMedium, utmCampaign } = data;
    
    // Validar dados obrigatórios de forma simplificada (sendBeacon não espera resposta)
    if (!email || !phone) {
      console.error(`❌ [${requestId}] Dados incompletos recebidos via webhook`);
      return new Response(JSON.stringify({
        error: 'Dados incompletos',
        details: 'Email e telefone são obrigatórios'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Log detalhado dos dados recebidos
    console.log(`📝 [${requestId}] Dados do webhook:`);
    console.log(`- [${requestId}] Email:`, email);
    console.log(`- [${requestId}] Telefone:`, phone);
    console.log(`- [${requestId}] isProgrammer (fallback):`, isProgrammer, typeof isProgrammer);
    console.log(`- [${requestId}] sessionId:`, sessionId);
    console.log(`- [${requestId}] UTM Source:`, utmSource || 'não definido');
    console.log(`- [${requestId}] UTM Medium:`, utmMedium || 'não definido');
    console.log(`- [${requestId}] UTM Campaign:`, utmCampaign || 'não definido');
    
    // Buscar dados parciais se sessionId estiver disponível
    let finalIsProgrammer = false;
    let dataSource = 'fallback';
    
    if (sessionId) {
      try {
        console.log(`🔍 [${requestId}] Buscando dados parciais para sessionId: ${sessionId}`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: partialData, error: partialError } = await supabase
          .from('partial_leads')
          .select('is_programmer, qualification_timestamp')
          .eq('session_id', sessionId)
          .single();
        
        if (partialError) {
          console.log(`⚠️ [${requestId}] Dados parciais não encontrados:`, partialError.message);
          console.log(`🔄 [${requestId}] Usando isProgrammer do formulário como fallback`);
        } else {
          console.log(`✅ [${requestId}] Dados parciais encontrados:`, partialData);
          finalIsProgrammer = partialData.is_programmer;
          dataSource = 'partial_leads';
          console.log(`🎯 [${requestId}] Usando isProgrammer dos dados parciais: ${finalIsProgrammer}`);
        }
        
      } catch (partialSearchError) {
        console.error(`❌ [${requestId}] Erro ao buscar dados parciais:`, partialSearchError.message);
        console.log(`🔄 [${requestId}] Usando isProgrammer do formulário como fallback`);
      }
    } else {
      console.log(`⚠️ [${requestId}] SessionId não fornecido, usando isProgrammer do formulário`);
    }
    
    // Se não encontrou dados parciais, usar o valor do formulário como fallback
    if (dataSource === 'fallback') {
      if (isProgrammer === true || 
          String(isProgrammer) === 'true' || 
          Number(isProgrammer) === 1 || 
          String(isProgrammer) === '1') {
        finalIsProgrammer = true;
      }
    }
    
    console.log(`📊 [${requestId}] isProgrammer FINAL: ${finalIsProgrammer} (fonte: ${dataSource})`);
    
    // Obter informações adicionais da requisição
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
                     
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Salvar lead no banco de dados com tratamento de erros simplificado
    // Como é chamado via sendBeacon, não precisamos de timeout ou resposta elaborada
    try {
      console.log(`🔍 [${requestId}] Salvando lead via webhook...`);
      
      let savedLead;
      let usedFallback = false;
      
      try {
        // Tenta salvar no banco de dados principal (Supabase)
        const supabaseResult = await saveLeadToSupabase({
          email,
          phone,
          is_programmer: finalIsProgrammer,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          ip_address: ipAddress,
          user_agent: userAgent
        });
        
        if (supabaseResult.success) {
          console.log(`✅ [${requestId}] Lead salvo com sucesso no Supabase via webhook:`, {
            email: email,
            is_programmer: finalIsProgrammer
          });
          savedLead = { email, is_programmer: finalIsProgrammer };
        } else {
          throw new Error(supabaseResult.error);
        }
      } catch (primaryDbError) {
        // Se falhar, usa o sistema de fallback
        console.error(`⚠️ [${requestId}] Erro ao salvar no Supabase:`, primaryDbError.message);
        console.log(`🔄 [${requestId}] Usando sistema de fallback para salvar o lead...`);
        
        const fallbackResult = await saveLeadToFallback({
          email,
          phone,
          is_programmer: finalIsProgrammer,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          ip_address: ipAddress,
          user_agent: userAgent,
          error: primaryDbError.message
        });
        
        if (fallbackResult.success) {
          console.log(`✅ [${requestId}] Lead salvo com sucesso no sistema de fallback`);
          savedLead = fallbackResult.data;
          usedFallback = true;
        } else {
          throw new Error(`Falha no sistema principal e no fallback: ${fallbackResult.error}`);
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: usedFallback ? 'Lead salvo no sistema de fallback' : 'Lead salvo com sucesso',
        usedFallback
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.error(`❌ [${requestId}] Erro ao salvar lead via webhook:`, dbError.message);
      console.error(`Detalhes do erro:`, dbError.stack);
      
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Erro ao salvar lead via webhook',
        error: dbError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error(`❌ [${requestId}] Erro ao processar requisição webhook:`, error);
    console.error(`Stack trace:`, error.stack);
    
    return new Response(JSON.stringify({
      error: 'Erro ao processar requisição webhook',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
