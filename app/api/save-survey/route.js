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
    console.log(`[${requestId}] 📝 Dados da pesquisa recebidos:`, {
      email: surveyData.email,
      campos_preenchidos: Object.keys(surveyData).length
    });

    // Validação básica
    if (!surveyData.email) {
      console.log(`[${requestId}] ❌ Email obrigatório não fornecido`);
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Validar dados obrigatórios
    const requiredFields = ['profissao_atual', 'como_conheceu', 'tempo_conhece', 
                           'expectativas_treinamento', 'sonho_realizar', 'maior_dificuldade'];
    
    for (const field of requiredFields) {
      if (!surveyData[field] || surveyData[field].trim() === '') {
        console.log(`[${requestId}] ❌ Campo obrigatório ausente: ${field}`);
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${field}` },
          { status: 400 }
        );
      }
    }

    // Preparar dados com tipos corretos
    const formattedData = {
      // Dados de identificação
      email: surveyData.email?.toLowerCase()?.trim(),
      phone: surveyData.phone?.trim() || null,
      is_programmer: Boolean(surveyData.is_programmer),
      
      // Dados demográficos (ENUMs)
      idade: surveyData.idade || null,
      genero: surveyData.genero || null,
      faixa_salarial: surveyData.faixa_salarial || null,
      
      // Conhecimento técnico (ENUMs e BOOLEANs)
      usa_rag_llm: surveyData.usa_rag_llm || null,
      conhece_frameworks_ia: surveyData.conhece_frameworks_ia || null,
      ja_e_programador: surveyData.ja_e_programador === 'sim' ? true : 
                       surveyData.ja_e_programador === 'nao' ? false : null,
      ja_programa_python: surveyData.ja_programa_python === 'sim' ? true : 
                         surveyData.ja_programa_python === 'nao' ? false : null,
      usa_ml_dl: surveyData.usa_ml_dl === 'sim' ? true : 
                surveyData.usa_ml_dl === 'nao' ? false : null,
      
      // Dados profissionais (obrigatórios)
      profissao_atual: surveyData.profissao_atual?.trim(),
      como_conheceu: surveyData.como_conheceu,
      tempo_conhece: surveyData.tempo_conhece,
      
      // Motivações e desafios
      o_que_tira_sono: surveyData.o_que_tira_sono?.trim() || null,
      expectativas_treinamento: surveyData.expectativas_treinamento?.trim(),
      sonho_realizar: surveyData.sonho_realizar?.trim(),
      maior_dificuldade: surveyData.maior_dificuldade?.trim(),
      pergunta_cafe: surveyData.pergunta_cafe?.trim() || null,
      impedimento_sonho: surveyData.impedimento_sonho?.trim() || null,
      maior_desafio_ia: surveyData.maior_desafio_ia?.trim() || null,
      
      // Comprometimento (BOOLEAN)
      comprometido_projeto: surveyData.comprometido_projeto === 'sim' ? true : 
                           surveyData.comprometido_projeto === 'nao' ? false : null,
      
      // Metadados
      session_id: surveyData.session_id || `fallback_${Date.now()}`,
      ip_address: surveyData.ip_address || null,
      user_agent: surveyData.user_agent || null,
      utm_source: surveyData.utm_source || 'direct',
      utm_medium: surveyData.utm_medium || 'none',
      utm_campaign: surveyData.utm_campaign || 'none'
    };

    console.log(`[${requestId}] 🔄 Tentando salvar pesquisa no Supabase...`);

    // Usar UPSERT para evitar duplicatas
    const { data, error } = await supabase
      .from('pesquisa_ai_code_pro')
      .upsert(formattedData, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

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

    console.log(`[${requestId}] ✅ Pesquisa salva com sucesso:`, data?.id);
    return NextResponse.json({ 
      success: true, 
      id: data?.id,
      message: 'Pesquisa salva com sucesso'
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
