/**
 * API endpoint para salvar leads qualificados
 * Implementação robusta com tratamento de erros e logs detalhados
 * Força o uso do runtime Node.js para compatibilidade com o módulo pg
 */

// Definir explicitamente o runtime como Node.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

// Importar serviço simples de armazenamento de leads
// Esta solução usa import dinâmico para o módulo pg
import { saveQualifiedLead, testDatabaseConnection } from '@/lib/simple-lead-storage';

// Função para validar email
function isValidEmail(email) {
  if (!email) return false;
  
  try {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  } catch (error) {
    console.error('Erro ao validar email:', error);
    return false;
  }
}

// Função para validar telefone
function isValidPhone(phone) {
  if (!phone) return false;
  
  try {
    // Remove caracteres não numéricos
    const numericPhone = String(phone).replace(/\D/g, '');
    // Verificar se tem pelo menos 8 dígitos (número básico)
    return numericPhone.length >= 8;
  } catch (error) {
    console.error('Erro ao validar telefone:', error);
    return false;
  }
}

// Função para normalizar valor booleano
function normalizeBooleanValue(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') {
    return true;
  }
  return false;
}

// Handler para método POST
export async function POST(request) {
  console.log('📝 Recebida requisição POST para /api/qualified-lead');
  
  try {
    // Obter dados do corpo da requisição
    const data = await request.json();
    console.log('Dados recebidos:', JSON.stringify(data, null, 2));
    
    const { email, phone, isProgrammer, utmSource, utmMedium, utmCampaign } = data;
    
    // Validar dados obrigatórios
    if (!email || !isValidEmail(email)) {
      console.warn('Email inválido recebido:', email);
      return NextResponse.json(
        { error: 'Email inválido', details: 'Formato de email não reconhecido' },
        { status: 400 }
      );
    }
    
    if (!phone || !isValidPhone(phone)) {
      console.warn('Telefone inválido recebido:', phone);
      return NextResponse.json(
        { error: 'Telefone inválido', details: 'Formato de telefone não reconhecido' },
        { status: 400 }
      );
    }
    
    // Normalizar o valor de isProgrammer para garantir que seja um booleano válido
    const normalizedIsProgrammer = normalizeBooleanValue(isProgrammer);
    
    // Log para depuração
    console.log('Valor original de isProgrammer recebido na API:', isProgrammer, typeof isProgrammer);
    console.log('Valor normalizado de isProgrammer:', normalizedIsProgrammer);
    
    // Obter informações adicionais da requisição
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
                     
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Salvar lead no banco de dados
    try {
      console.log('Salvando lead usando método simples e robusto...');
      
      const savedLead = await saveQualifiedLead({
        email,
        phone,
        isProgrammer: normalizedIsProgrammer,
        utmSource,
        utmMedium,
        utmCampaign,
        ipAddress,
        userAgent
      });
      
      // Log para depuração
      console.log('✅ Lead salvo com sucesso no banco de dados:', {
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
    } catch (dbError) {
      console.error('❌ Erro ao salvar lead no banco de dados:', dbError);
      console.error('Detalhes do erro:', dbError.stack);
      
      // Retornar resposta de erro, mas com código 200 para não bloquear o fluxo do usuário
      return NextResponse.json({ 
        success: true, // Mantém como true para não bloquear o fluxo do usuário
        message: 'Lead recebido, mas houve um problema ao salvar no banco de dados',
        warning: 'Os dados foram recebidos, mas podem não ter sido armazenados permanentemente',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error);
    console.error('Stack trace:', error.stack);
    
    // Retornar resposta de erro
    return NextResponse.json(
      { error: 'Erro ao processar requisição', details: error.message },
      { status: 500 }
    );
  }
}

// Handler para método GET (diagnóstico)
export async function GET(request) {
  // Verificar se é uma requisição de diagnóstico
  const { searchParams } = new URL(request.url);
  const isDiagnostic = searchParams.get('diagnostic') === 'true';
  
  if (isDiagnostic) {
    try {
      // Testar conexão com o banco de dados
      const connectionTest = await testDatabaseConnection();
      
      return NextResponse.json({
        status: 'API operacional',
        database: connectionTest,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV,
          DATABASE_URL_SET: !!process.env.DATABASE_URL
        }
      });
    } catch (error) {
      return NextResponse.json({
        status: 'API operacional, mas com problemas',
        error: error.message
      });
    }
  }
  
  // Resposta padrão para método não permitido
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  );
}
