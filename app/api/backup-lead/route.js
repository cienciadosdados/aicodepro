/**
 * API endpoint para salvar leads em múltiplos sistemas de backup
 * Esta solução é independente do banco de dados Neon e do módulo pg
 */

// Usar runtime edge para máxima compatibilidade
export const runtime = 'edge';

import { NextResponse } from 'next/server';

// Handler para método POST
export async function POST(request) {
  console.log('📝 Recebida requisição POST para /api/backup-lead');
  
  try {
    // Obter dados do corpo da requisição
    let data;
    try {
      data = await request.json();
      console.log('Dados recebidos:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ Erro ao processar JSON da requisição:', parseError.message);
      return NextResponse.json(
        { error: 'Formato de dados inválido', details: parseError.message },
        { status: 400 }
      );
    }
    
    const { email, phone, isProgrammer, utmSource, utmMedium, utmCampaign } = data;
    
    // Validar dados obrigatórios
    if (!email || !phone) {
      console.error('❌ Dados incompletos recebidos');
      return NextResponse.json(
        { error: 'Dados incompletos', details: 'Email e telefone são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Criar objeto com dados do lead
    const leadData = {
      email,
      phone,
      isProgrammer: isProgrammer === true,
      utmSource: utmSource || 'not_set',
      utmMedium: utmMedium || 'not_set',
      utmCampaign: utmCampaign || 'not_set',
      timestamp: new Date().toISOString(),
      source: 'backup_system'
    };
    
    // Tentar salvar em serviços externos
    const results = {
      success: true,
      message: 'Lead recebido com sucesso',
      backups: {}
    };
    
    // 1. Tentar salvar no serviço webhook.site (serviço público de teste)
    try {
      const webhookResponse = await fetch('https://webhook.site/d8a7b3e5-9b3a-4f1d-9a5e-8f7c6d5e4c3b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      
      results.backups.webhook = {
        success: webhookResponse.ok,
        status: webhookResponse.status
      };
    } catch (webhookError) {
      console.error('❌ Erro ao salvar no webhook.site:', webhookError);
      results.backups.webhook = {
        success: false,
        error: webhookError.message
      };
    }
    
    // 2. Tentar salvar no serviço RequestBin
    try {
      const requestbinResponse = await fetch('https://eo9v8lqq6jtc8.x.pipedream.net/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      
      results.backups.requestbin = {
        success: requestbinResponse.ok,
        status: requestbinResponse.status
      };
    } catch (requestbinError) {
      console.error('❌ Erro ao salvar no RequestBin:', requestbinError);
      results.backups.requestbin = {
        success: false,
        error: requestbinError.message
      };
    }
    
    // Retornar resultados
    return NextResponse.json(results);
  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição', details: error.message },
      { status: 500 }
    );
  }
}
