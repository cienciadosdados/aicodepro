import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmweydircrhrsyhiuhbv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2V5ZGlyY3JocnN5aGl1aGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzM3MTIsImV4cCI6MjA2MDY0OTcxMn0.ltHBeD-GtZRn9lF7onN3BWbjzXZnJgOlnxIdD54GuRQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  const requestId = Math.random().toString(36).substring(2, 8);
  console.log(`[${requestId}] 📋 API save-survey chamada`);

  try {
    const surveyData = await request.json();
    console.log(`[${requestId}] 📝 DADOS COMPLETOS RECEBIDOS:`, surveyData);
    console.log(`[${requestId}] 📊 Resumo:`, {
      email: surveyData.email,
      campos_preenchidos: Object.keys(surveyData).length,
      campos: Object.keys(surveyData)
    });

    // Validação de campos obrigatórios (baseado nos erros do banco)
    const requiredFields = {
      email: 'Email é obrigatório',
      profissao_atual: 'Profissão atual é obrigatória',
      como_conheceu: 'Como conheceu é obrigatório',
      tempo_conhece: 'Tempo que conhece é obrigatório'
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!surveyData[field] || surveyData[field].trim() === '') {
        console.log(`[${requestId}] ❌ Campo obrigatório não fornecido: ${field}`);
        return NextResponse.json(
          { 
            error: 'Campo obrigatório não fornecido',
            field: field,
            message: message
          },
          { status: 400 }
        );
      }
    }

    // Log dos dados recebidos (igual ao SurveyForm original)
    console.log(`[${requestId}] 📋 Dados recebidos para processamento:`, {
      email: surveyData.email,
      campos_preenchidos: Object.keys(surveyData).filter(key => surveyData[key] && surveyData[key] !== '').length,
      total_campos: Object.keys(surveyData).length
    });

    // Preparar dados com tipos corretos para o schema
    const formattedData = {
      // Dados de identificação
      email: surveyData.email?.toLowerCase()?.trim(),
      phone: surveyData.phone?.trim() || null,
      is_programmer: Boolean(surveyData.is_programmer),
      
      // Dados demográficos - MAPEAMENTO CORRETO
      idade: surveyData.idade || null,
      genero: mapGenero(surveyData.genero),
      faixa_salarial: mapFaixaSalarial(surveyData.faixa_salarial),
      
      // Conhecimento técnico - MAPEAMENTO CORRETO
      usa_rag_llm: mapResposta(surveyData.usa_rag_llm),
      conhece_frameworks_ia: mapResposta(surveyData.conhece_frameworks_ia),
      ja_e_programador: mapBoolean(surveyData.ja_e_programador),
      ja_programa_python: mapBoolean(surveyData.ja_programa_python),
      usa_ml_dl: mapBoolean(surveyData.usa_ml_dl),
      
      // Dados profissionais - MAPEAMENTO CORRETO
      profissao_atual: surveyData.profissao_atual?.trim() || null,
      como_conheceu: mapComoConheceu(surveyData.como_conheceu),
      tempo_conhece: mapTempoConhece(surveyData.tempo_conhece),
      
      // Motivações e desafios
      o_que_tira_sono: surveyData.o_que_tira_sono?.trim() || null,
      expectativas_treinamento: surveyData.expectativas_treinamento?.trim() || null,
      sonho_realizar: surveyData.sonho_realizar?.trim() || null,
      maior_dificuldade: surveyData.maior_dificuldade?.trim() || null,
      pergunta_cafe: surveyData.pergunta_cafe?.trim() || null,
      impedimento_sonho: surveyData.impedimento_sonho?.trim() || null,
      maior_desafio_ia: surveyData.maior_desafio_ia?.trim() || null,
      
      // Comprometimento - MAPEAMENTO CORRETO
      comprometido_projeto: mapBoolean(surveyData.comprometido_projeto),
      
      // Metadados
      session_id: surveyData.session_id || `fallback_${Date.now()}`,
      ip_address: surveyData.ip_address === 'unknown' ? null : surveyData.ip_address,
      user_agent: surveyData.user_agent || null,
      utm_source: surveyData.utm_source || 'direct',
      utm_medium: surveyData.utm_medium || 'none',
      utm_campaign: surveyData.utm_campaign || 'none'
    };

  // ===== FUNÇÕES DE MAPEAMENTO COMPLETAS =====
  
  function mapGenero(valor) {
    if (!valor) return null;
    const mapeamento = {
      'Masculino': 'masculino',
      'Feminino': 'feminino',
      'Prefiro não dizer': 'prefiro-nao-dizer'
    };
    return mapeamento[valor] || null;
  }

  function mapFaixaSalarial(valor) {
    if (!valor) return null;
    const mapeamento = {
      'Até R$ 1.500': 'ate-1500',
      'R$ 1.500 - R$ 3.000': '1500-3000',
      'R$ 3.000 - R$ 5.000': '3000-5000',
      'R$ 5.000 - R$ 10.000': '5000-7000',
      'Acima de R$ 10.000': 'acima-11000'
    };
    return mapeamento[valor] || null;
  }

  function mapResposta(valor) {
    if (!valor) return null;
    const mapeamento = {
      'Sim': 'sim',
      'Não': 'nao',
      'Nem sei o que é isso': 'nem-sei',
      'Nunca ouvi falar': 'nunca-ouvi'
    };
    return mapeamento[valor] || null;
  }

  function mapBoolean(valor) {
    if (!valor) return null;
    const valorLower = valor.toString().toLowerCase();
    return valorLower === 'sim' || valorLower === 'yes' || valorLower === 'true';
  }

  function mapComoConheceu(valor) {
    if (!valor) return null;
    const mapeamento = {
      'Instagram': 'instagram',
      'Facebook': 'facebook',
      'YouTube': 'youtube',
      'LinkedIn': 'portal',
      'Google': 'portal',
      'Indicação de amigo': 'indicacao',
      'Outro': 'portal'
    };
    return mapeamento[valor] || 'portal';
  }

  function mapTempoConhece(valor) {
    if (!valor) return null;
    const mapeamento = {
      'Menos de 2 meses': 'menos-2-meses',
      '2-6 meses': '6-meses',
      '6 meses - 1 ano': '1-ano',
      'Mais de 1 ano': '2-anos'
    };
    return mapeamento[valor] || 'menos-2-meses';
  }

    console.log(`[${requestId}] 🔄 Tentando salvar pesquisa no Supabase...`);
    console.log(`[${requestId}] 💾 Dados formatados para inserção:`, formattedData);

    // Usar UPSERT para evitar duplicatas na tabela correta
    const { data, error } = await supabase
      .from('pesquisa_ai_code_pro')
      .upsert(formattedData, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    console.log(`[${requestId}] 🔍 Resultado Supabase:`, { data, error });

    if (error) {
      console.log(`[${requestId}] ⚠️ Erro no Supabase:`, error.message);
      
      // Se a tabela não existir, tentar criar
      if (error.message && error.message.includes('relation "pesquisa_ai_code_pro" does not exist')) {
        console.log(`[${requestId}] 📋 Tabela pesquisa_ai_code_pro não existe. Criando...`);
        
        // Executar SQL para criar a tabela
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS pesquisa_ai_code_pro (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            is_programmer BOOLEAN,
            idade VARCHAR(20),
            genero VARCHAR(20),
            usa_rag_llm VARCHAR(20),
            conhece_frameworks_ia VARCHAR(20),
            ja_e_programador VARCHAR(20),
            ja_programa_python VARCHAR(20),
            usa_ml_dl VARCHAR(20),
            faixa_salarial VARCHAR(50),
            profissao_atual TEXT,
            como_conheceu VARCHAR(50),
            tempo_conhece VARCHAR(20),
            o_que_tira_sono TEXT,
            expectativas_treinamento TEXT,
            sonho_realizar TEXT,
            maior_dificuldade TEXT,
            pergunta_cafe TEXT,
            impedimento_sonho TEXT,
            maior_desafio_ia TEXT,
            comprometido_projeto VARCHAR(10),
            session_id VARCHAR(100),
            ip_address INET,
            user_agent TEXT,
            utm_source VARCHAR(100),
            utm_medium VARCHAR(100),
            utm_campaign VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(email)
          );
        `;

        try {
          await supabase.rpc('exec_sql', { sql: createTableSQL });
          console.log(`[${requestId}] ✅ Tabela criada com sucesso`);
          
          // Tentar inserir novamente
          const { data: retryData, error: retryError } = await supabase
            .from('pesquisa_ai_code_pro')
            .upsert(formattedData, { 
              onConflict: 'email',
              ignoreDuplicates: false 
            })
            .select()
            .single();

          if (retryError) {
            throw retryError;
          }

          console.log(`[${requestId}] ✅ Pesquisa salva após criar tabela:`, retryData?.id);
          return NextResponse.json({ 
            success: true, 
            id: retryData?.id,
            message: 'Pesquisa salva com sucesso (tabela criada)'
          });
        } catch (createError) {
          console.log(`[${requestId}] ❌ Erro ao criar tabela:`, createError.message);
          throw createError;
        }
      } else {
        throw error;
      }
    }

    console.log(`[${requestId}] ✅ Pesquisa salva com sucesso:`, {
      id: data?.id,
      email: data?.email,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      id: data?.id,
      email: data?.email,
      message: 'Pesquisa salva com sucesso no banco de dados'
    });

  } catch (error) {
    console.error(`[${requestId}] ❌ Erro ao salvar pesquisa:`, error);
    
    // Backup local em caso de erro
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const backupDir = path.join(process.cwd(), 'fallback-data');
      const backupFile = path.join(backupDir, 'surveys-backup.json');
      
      // Criar diretório se não existir
      try {
        await fs.access(backupDir);
      } catch {
        await fs.mkdir(backupDir, { recursive: true });
      }
      
      // Ler backup existente ou criar novo
      let surveys = [];
      try {
        const existingData = await fs.readFile(backupFile, 'utf8');
        surveys = JSON.parse(existingData);
      } catch {
        // Arquivo não existe, começar com array vazio
      }
      
      // Adicionar nova pesquisa
      const surveyData = await request.json();
      surveys.push({
        ...surveyData,
        timestamp: new Date().toISOString(),
        backup_reason: 'supabase_error'
      });
      
      // Salvar backup
      await fs.writeFile(backupFile, JSON.stringify(surveys, null, 2));
      console.log(`[${requestId}] 💾 Pesquisa salva em backup local`);
      
      return NextResponse.json({ 
        success: true, 
        backup: true,
        message: 'Pesquisa salva em backup local'
      });
      
    } catch (backupError) {
      console.error(`[${requestId}] ❌ Erro no backup:`, backupError);
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
