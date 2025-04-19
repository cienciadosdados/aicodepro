import { NextResponse } from 'next/server';
import { saveQualifiedLead } from '@/lib/supabase-storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(' recebido no corpo da requisição da API');
    console.log(body);
    
    const { email, phone, isProgrammer, utm_source, utm_medium, utm_campaign } = body;

    const HOTMART_WEBHOOK_URL = process.env.HOTMART_WEBHOOK_URL;
    if (!HOTMART_WEBHOOK_URL) {
      console.error('HOTMART_WEBHOOK_URL não configurada');
    }

    if (HOTMART_WEBHOOK_URL) {
      console.log('Enviando para Hotmart...');
      const hotmartPayload = {
        name: body.name || email,
        email: email,
        phone: phone,
      };
      console.log('Payload Hotmart:', hotmartPayload);

      const response = await fetch(HOTMART_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotmartPayload),
      });

      if (!response.ok) {
        console.error('Erro ao enviar para Hotmart. Status:', response.status);
        const errorBody = await response.text();
        console.error('Corpo do erro Hotmart:', errorBody);
      } else {
        console.log('✅ Enviado para Hotmart com sucesso!');
      }
    } else {
      console.warn('URL do webhook Hotmart não configurada. Pulando envio.');
    }

    console.log('Tentando salvar lead qualificado no Supabase...');
    const leadData = {
      email,
      phone,
      isProgrammer,
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
    };
    console.log('Dados para salvar no Neon:', leadData);

    try {
      const savedLead = await saveQualifiedLead(leadData);
      console.log('✅ Lead salvo no Supabase com sucesso:', savedLead.email);
    } catch (dbError) {
      console.error('❌ Erro ao salvar lead no Supabase:', dbError);
    }

    return NextResponse.json({ success: true, message: 'Lead processado.' });

  } catch (error) {
    console.error('Erro GERAL ao processar lead:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar inscrição', details: errorMessage },
      { status: 500 }
    );
  }
}
