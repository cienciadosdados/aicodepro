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
  console.log('📝 Recebida requisição POST para /api/webhook-lead via sendBeacon');
  console.log(`🔍 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log(`🔍 Vercel Env: ${process.env.VERCEL_ENV || 'local'}`);
  console.log(`🔍 DATABASE_URL configurada: ${!!process.env.DATABASE_URL}`);
  
  try {
    // Obter dados do corpo da requisição com tratamento de erros robusto
    let data;
    try {
      data = await request.json();
      console.log('Dados recebidos via webhook:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ Erro ao processar JSON da requisição:', parseError.message);
      return new Response(JSON.stringify({
        error: 'Formato de dados inválido',
        details: parseError.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { email, phone, isProgrammer, utmSource, utmMedium, utmCampaign } = data;
    
    // Validar dados obrigatórios de forma simplificada (sendBeacon não espera resposta)
    if (!email || !phone) {
      console.error('❌ Dados incompletos recebidos via webhook');
      return new Response(JSON.stringify({
        error: 'Dados incompletos',
        details: 'Email e telefone são obrigatórios'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Log detalhado dos dados recebidos
    console.log('📝 Dados do webhook:');
    console.log('- Email:', email);
    console.log('- Telefone:', phone);
    console.log('- isProgrammer:', isProgrammer, typeof isProgrammer);
    console.log('- UTM Source:', utmSource || 'não definido');
    console.log('- UTM Medium:', utmMedium || 'não definido');
    console.log('- UTM Campaign:', utmCampaign || 'não definido');
    
    // Obter informações adicionais da requisição
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
                     
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Normalizar o valor de isProgrammer para garantir que seja um booleano válido
    let normalizedIsProgrammer = false;
    
    if (isProgrammer === true || 
        String(isProgrammer) === 'true' || 
        Number(isProgrammer) === 1 || 
        String(isProgrammer) === '1') {
      normalizedIsProgrammer = true;
    }
    
    console.log('- isProgrammer normalizado:', normalizedIsProgrammer, typeof normalizedIsProgrammer);
    
    // Salvar lead no banco de dados com tratamento de erros simplificado
    // Como é chamado via sendBeacon, não precisamos de timeout ou resposta elaborada
    try {
      console.log('🔍 Salvando lead via webhook...');
      
      let savedLead;
      let usedFallback = false;
      
      try {
        // Tenta salvar no banco de dados principal (Supabase)
        const supabaseResult = await saveLeadToSupabase({
          email,
          phone,
          isProgrammer: normalizedIsProgrammer,
          utmSource,
          utmMedium,
          utmCampaign,
          ipAddress,
          userAgent
        });
        
        if (supabaseResult.success) {
          console.log('✅ Lead salvo com sucesso no Supabase via webhook:', {
            email: email,
            isProgrammer: normalizedIsProgrammer
          });
          savedLead = { email, is_programmer: normalizedIsProgrammer };
        } else {
          throw new Error(supabaseResult.error);
        }
      } catch (primaryDbError) {
        // Se falhar, usa o sistema de fallback
        console.error('⚠️ Erro ao salvar no Supabase:', primaryDbError.message);
        console.log('🔄 Usando sistema de fallback para salvar o lead...');
        
        const fallbackResult = await saveLeadToFallback({
          email,
          phone,
          isProgrammer: normalizedIsProgrammer,
          utmSource,
          utmMedium,
          utmCampaign,
          ipAddress,
          userAgent,
          error: primaryDbError.message
        });
        
        if (fallbackResult.success) {
          console.log('✅ Lead salvo com sucesso no sistema de fallback');
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
      console.error('❌ Erro ao salvar lead via webhook:', dbError.message);
      console.error('Detalhes do erro:', dbError.stack);
      
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
    console.error('❌ Erro ao processar requisição webhook:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({
      error: 'Erro ao processar requisição webhook',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
