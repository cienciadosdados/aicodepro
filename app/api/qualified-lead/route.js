// API endpoint para salvar leads qualificados
import { NextResponse } from 'next/server';
import { saveQualifiedLead } from '@/lib/db';

// Função para validar email
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

// Função para validar telefone
function isValidPhone(phone) {
  // Remove caracteres não numéricos
  const numericPhone = phone.replace(/\D/g, '');
  // Verificar se tem pelo menos 10 dígitos (DDD + número)
  return numericPhone.length >= 10;
}

export async function POST(request) {
  try {
    // Obter dados do corpo da requisição
    const data = await request.json();
    const { email, phone, isProgrammer, utmSource, utmMedium, utmCampaign } = data;
    
    // Validar dados obrigatórios
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }
    
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Telefone inválido' },
        { status: 400 }
      );
    }
    
    // Verificar e converter explicitamente o valor para booleano
    // Isso é crucial para garantir que o valor seja armazenado corretamente
    let normalizedIsProgrammer = false;
    
    // Verificar explicitamente se o valor é true
    if (isProgrammer === true || isProgrammer === 'true' || isProgrammer === 1) {
      normalizedIsProgrammer = true;
    }
    
    // Log para depuração
    console.log('Valor original de isProgrammer recebido na API:', isProgrammer, typeof isProgrammer);
    console.log('Valor normalizado de isProgrammer:', normalizedIsProgrammer);
    
    // Obter informações adicionais da requisição
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    
    // Salvar lead no banco de dados
    const savedLead = await saveQualifiedLead({
      email,
      phone,
      isProgrammer: normalizedIsProgrammer, // Usar o valor normalizado
      utmSource,
      utmMedium,
      utmCampaign,
      ipAddress,
      userAgent
    });
    
    // Log para depuração
    console.log('Lead salvo no banco de dados:', {
      email: savedLead.email,
      isProgrammer: savedLead.is_programmer
    });
    
    // Retornar resposta de sucesso
    return NextResponse.json({ 
      success: true, 
      message: 'Lead qualificado salvo com sucesso',
      data: {
        email: savedLead.email,
        isProgrammer: savedLead.is_programmer
      }
    });
    
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    
    // Retornar resposta de erro
    return NextResponse.json(
      { error: 'Erro ao processar requisição', details: error.message },
      { status: 500 }
    );
  }
}

// Permitir apenas método POST
export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  );
}
