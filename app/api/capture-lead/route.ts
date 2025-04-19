import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Aqui você vai configurar a URL do webhook do Hotmart Send
    const HOTMART_WEBHOOK_URL = process.env.HOTMART_WEBHOOK_URL;
    
    if (!HOTMART_WEBHOOK_URL) {
      throw new Error('HOTMART_WEBHOOK_URL não configurada');
    }

    // Enviar dados para o Hotmart Send
    const response = await fetch(HOTMART_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        phone: body.phone,
        // Adicione outros campos conforme necessário
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar para Hotmart');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar lead:', error);
    return NextResponse.json(
      { error: 'Erro ao processar inscrição' },
      { status: 500 }
    );
  }
}
