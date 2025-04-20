/**
 * API endpoint para salvar leads qualificados
 * Implementação robusta com tratamento de erros e logs detalhados
 * Força o uso do runtime Node.js para compatibilidade com o módulo pg
 * Versão otimizada para ambiente de produção no Vercel
 */

// Definir explicitamente o runtime como Node.js
export const runtime = 'nodejs';

// Definir o timeout da Edge Function para 10 segundos (máximo permitido)
export const maxDuration = 10;

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

// Função para normalizar valor booleano com melhor tratamento de tipos
function normalizeBooleanValue(value) {
  // Log para depuração do valor recebido
  console.log('normalizeBooleanValue recebeu:', value, typeof value);
  
  // Verificar valores que devem ser considerados como true
  if (value === true || 
      value === 'true' || 
      value === 1 || 
      value === '1' || 
      (typeof value === 'string' && value.toLowerCase() === 'true')) {
    return true;
  }
  
  // Todos os outros casos são false
  return false;
}

// Handler para método POST
export async function POST(request) {
  console.log('📝 Recebida requisição POST para /api/qualified-lead');
  console.log(`🔍 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log(`🔍 Vercel Env: ${process.env.VERCEL_ENV || 'local'}`);
  console.log(`🔍 DATABASE_URL configurada: ${!!process.env.DATABASE_URL}`);
  
  try {
    // Obter dados do corpo da requisição com tratamento de erros robusto
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
    
    // Log detalhado para depuração
    console.log('Valor original de isProgrammer recebido na API:', isProgrammer, typeof isProgrammer);
    console.log('Valor como string:', String(isProgrammer));
    console.log('Valor normalizado de isProgrammer:', normalizedIsProgrammer, typeof normalizedIsProgrammer);
    
    // Obter informações adicionais da requisição
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
                     
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Salvar lead no banco de dados com tratamento de erros avançado
    try {
      console.log('🔍 Salvando lead usando método robusto e otimizado para produção...');
      
      // Implementar timeout para evitar que a função fique bloqueada indefinidamente
      const savePromise = saveQualifiedLead({
        email,
        phone,
        isProgrammer: normalizedIsProgrammer,
        utmSource,
        utmMedium,
        utmCampaign,
        ipAddress,
        userAgent
      });
      
      // Definir um timeout de 8 segundos (dentro do limite de 10s do Vercel Edge Functions)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao salvar lead no banco de dados')), 8000);
      });
      
      // Usar Promise.race para garantir que não exceda o timeout
      const savedLead = await Promise.race([savePromise, timeoutPromise]);
      
      // Verificar se o lead foi salvo como mock (indica problema no banco)
      if (savedLead._mock) {
        console.warn('⚠️ Lead salvo como mock devido a:', savedLead._mockReason);
        
        // Retornar resposta de sucesso parcial
        return NextResponse.json({ 
          success: true, // Manter como true para não bloquear o fluxo do usuário
          message: 'Lead recebido, mas salvo temporariamente',
          warning: 'Os dados foram recebidos, mas podem não ter sido armazenados permanentemente',
          reason: savedLead._mockReason,
          data: {
            email: savedLead.email,
            isProgrammer: savedLead.is_programmer
          }
        });
      }
      
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
      console.error('❌ Erro ao salvar lead no banco de dados:', dbError.message);
      console.error('Detalhes do erro:', dbError.stack);
      
      // Tentar registrar o erro em um serviço de monitoramento se estiver em produção
      if (process.env.VERCEL_ENV === 'production') {
        try {
          // Aqui poderia ser implementada integração com serviços como Sentry, LogRocket, etc.
          console.error(`[CRITICAL] Erro de produção ao salvar lead: ${email}`);
        } catch (monitorError) {
          // Ignorar erros do serviço de monitoramento
        }
      }
      
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
      console.log('🔍 Executando diagnóstico completo da API e banco de dados...');
      
      // Testar conexão com o banco de dados com timeout
      let connectionTest;
      try {
        const testPromise = testDatabaseConnection();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao testar conexão com o banco')), 5000);
        });
        
        connectionTest = await Promise.race([testPromise, timeoutPromise]);
      } catch (dbError) {
        connectionTest = {
          success: false,
          message: `Erro ao testar conexão: ${dbError.message}`,
          error: dbError.message,
          stack: dbError.stack
        };
      }
      
      // Verificar informações do ambiente
      const environmentInfo = {
        NODE_ENV: process.env.NODE_ENV || 'não definido',
        VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DATABASE_SSL: process.env.DATABASE_SSL || 'não definido',
        RUNTIME: process.env.NEXT_RUNTIME || 'não definido',
        SERVER_RUNTIME: process.env.SERVER_RUNTIME || 'não definido'
      };
      
      // Verificar informações do sistema
      const systemInfo = {
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      };
      
      return NextResponse.json({
        status: connectionTest.success ? 'API e banco de dados operacionais' : 'API operacional, mas com problemas no banco de dados',
        timestamp: new Date().toISOString(),
        database: connectionTest,
        environment: environmentInfo,
        system: systemInfo,
        request: {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries())
        }
      });
    } catch (error) {
      console.error('❌ Erro ao executar diagnóstico:', error);
      
      return NextResponse.json({
        status: 'API operacional, mas com problemas no diagnóstico',
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'não definido',
          VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
          DATABASE_URL_SET: !!process.env.DATABASE_URL
        }
      });
    }
  }
  
  // Resposta padrão para método não permitido
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  );
}
