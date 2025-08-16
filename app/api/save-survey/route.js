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

    // Validação básica
    if (!surveyData.email) {
      console.log(`[${requestId}] ❌ Email obrigatório não fornecido`);
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Log dos dados recebidos (igual ao SurveyForm original)
    console.log(`[${requestId}] 📋 Dados recebidos para processamento:`, {
      email: surveyData.email,
      campos_preenchidos: Object.keys(surveyData).filter(key => surveyData[key] && surveyData[key] !== '').length,
      total_campos: Object.keys(surveyData).length
    });

    // Preparar dados EXATAMENTE como o SurveyForm original (sem conversões forçadas)
    const formattedData = {
      // Dados de identificação
      email: surveyData.email?.toLowerCase()?.trim(),
      phone: surveyData.phone?.trim() || null,
      is_programmer: surveyData.is_programmer, // Manter como recebido
      
      // Dados demográficos (manter como string para ENUMs)
      idade: surveyData.idade || null,
      genero: surveyData.genero || null,
      faixa_salarial: surveyData.faixa_salarial || null,
      
      // Conhecimento técnico (manter como recebido, API converte depois)
      usa_rag_llm: surveyData.usa_rag_llm || null,
      conhece_frameworks_ia: surveyData.conhece_frameworks_ia || null,
      ja_e_programador: surveyData.ja_e_programador || null, // API converte para boolean
      ja_programa_python: surveyData.ja_programa_python || null, // API converte para boolean  
      usa_ml_dl: surveyData.usa_ml_dl || null, // API converte para boolean
      
      // Dados profissionais
      profissao_atual: surveyData.profissao_atual?.trim() || null,
      como_conheceu: surveyData.como_conheceu || null,
      tempo_conhece: surveyData.tempo_conhece || null,
      
      // Motivações e desafios
      o_que_tira_sono: surveyData.o_que_tira_sono?.trim() || null,
      expectativas_treinamento: surveyData.expectativas_treinamento?.trim() || null,
      sonho_realizar: surveyData.sonho_realizar?.trim() || null,
      maior_dificuldade: surveyData.maior_dificuldade?.trim() || null,
      pergunta_cafe: surveyData.pergunta_cafe?.trim() || null,
      impedimento_sonho: surveyData.impedimento_sonho?.trim() || null,
      maior_desafio_ia: surveyData.maior_desafio_ia?.trim() || null,
      
      // Comprometimento (API converte para boolean)
      comprometido_projeto: surveyData.comprometido_projeto || null,
      
      // Metadados
      session_id: surveyData.session_id || `fallback_${Date.now()}`,
      ip_address: surveyData.ip_address || null,
      user_agent: surveyData.user_agent || null,
      utm_source: surveyData.utm_source || 'direct',
      utm_medium: surveyData.utm_medium || 'none',
      utm_campaign: surveyData.utm_campaign || 'none'
    };

    console.log(`[${requestId}] 🔄 Tentando salvar pesquisa no Supabase...`);
    console.log(`[${requestId}] 💾 Dados formatados para inserção:`, formattedData);

    // Usar UPSERT para evitar duplicatas na tabela correta
    const { data, error } = await supabase
      .from('survey_responses')
      .upsert(formattedData, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    console.log(`[${requestId}] 🔍 Resultado Supabase:`, { data, error });

    if (error) {
      console.log(`[${requestId}] ⚠️ Erro no Supabase:`, error.message);
      
      // Log do erro e continuar com fallback
      console.log(`[${requestId}] ❌ Erro no Supabase (usando tabela survey_responses):`, error.message);
      throw error;
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
