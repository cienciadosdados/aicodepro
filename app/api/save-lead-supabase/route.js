import { NextResponse } from 'next/server';
import { saveLeadToSupabase } from '@/lib/supabase-client';

export async function POST(request) {
  try {
    // Obter dados do lead
    const data = await request.json();
    const { email, phone, isProgrammer } = data;
    
    // Validar dados
    if (!email || !phone) {
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
    
    // Salvar no Supabase com a estrutura correta para qualified_leads
    const result = await saveLeadToSupabase({
      email,
      phone,
      isProgrammer,
      utmSource: data.utmSource || 'direct',
      utmMedium: data.utmMedium || 'none',
      utmCampaign: data.utmCampaign || 'none',
      ipAddress: ip,
      userAgent: userAgent
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Resposta de sucesso
    return NextResponse.json({ 
      success: true, 
      message: 'Lead salvo com sucesso no Supabase'
    });
  } catch (error) {
    console.error('Erro ao salvar lead no Supabase:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar lead no Supabase' },
      { status: 500 }
    );
  }
}
