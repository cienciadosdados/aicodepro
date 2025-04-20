import { NextResponse } from 'next/server';
import { saveLeadToSupabase } from '@/lib/supabase-client';

export async function POST(request) {
  console.log('Recebendo requisição para salvar lead no Supabase');
  
  try {
    // Obter dados do lead
    const data = await request.json();
    console.log('Dados do lead recebidos:', data);
    
    const { email, phone, isProgrammer } = data;
    
    // Validar dados
    if (!email || !phone) {
      console.error('Validação falhou: Email ou telefone ausentes');
      return NextResponse.json(
        { success: false, error: 'Email e telefone são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Obter informações adicionais do request
    const headers = request.headers;
    const userAgent = headers.get('user-agent') || '';
    const ip = headers.get('x-forwarded-for') || 
               headers.get('x-real-ip') || 
               '0.0.0.0';
    
    // Criar objeto completo do lead
    const leadData = {
      email,
      phone,
      isProgrammer,
      utmSource: data.utmSource || 'direct',
      utmMedium: data.utmMedium || 'none',
      utmCampaign: data.utmCampaign || 'none',
      ipAddress: ip,
      userAgent: userAgent
    };
    
    // Salvar no Supabase com a estrutura correta para qualified_leads
    console.log('Tentando salvar lead no Supabase...');
    const result = await saveLeadToSupabase(leadData);
    
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido ao salvar no Supabase');
    }
    
    // Resposta de sucesso
    console.log('Lead salvo com sucesso no Supabase');
    return NextResponse.json({ 
      success: true, 
      message: 'Lead salvo com sucesso no Supabase'
    });
  } catch (error) {
    console.error('Erro ao processar/salvar lead no Supabase:', error);
    return NextResponse.json(
      { success: false, error: `Erro ao salvar lead: ${error.message}` },
      { status: 500 }
    );
  }
}
