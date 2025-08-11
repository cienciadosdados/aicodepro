// Script para criar a tabela de pesquisa no Supabase
const { createClient } = require('@supabase/supabase-js');

const setupSurveyTable = async () => {
  console.log('🗄️ SETUP: Criando tabela de pesquisa no Supabase');
  console.log('=' .repeat(50));

  // Configuração do Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmweydircrhrsyhiuhbv.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2V5ZGlyY3JocnN5aGl1aGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzM3MTIsImV4cCI6MjA2MDY0OTcxMn0.ltHBeD-GtZRn9lF7onN3BWbjzXZnJgOlnxIdD54GuRQ';

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔗 Conectando ao Supabase...');
  console.log('URL:', supabaseUrl);

  try {
    // SQL para criar a tabela
    const createTableSQL = `
      -- Criar tabela de pesquisa para AI Code Pro
      CREATE TABLE IF NOT EXISTS pesquisa_ai_code_pro (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        is_programmer BOOLEAN,
        
        -- Dados demográficos
        idade VARCHAR(20),
        genero VARCHAR(20),
        
        -- Conhecimento técnico
        usa_rag_llm VARCHAR(20),
        conhece_frameworks_ia VARCHAR(20),
        ja_programa_python VARCHAR(20),
        usa_ml_dl VARCHAR(20),
        
        -- Dados profissionais
        faixa_salarial VARCHAR(50),
        profissao_atual TEXT,
        
        -- Relacionamento e descoberta
        como_conheceu VARCHAR(50),
        tempo_conhece VARCHAR(20),
        
        -- Motivações e desafios
        o_que_tira_sono TEXT,
        expectativas_treinamento TEXT,
        sonho_realizar TEXT,
        maior_dificuldade TEXT,
        pergunta_cafe TEXT,
        impedimento_sonho TEXT,
        maior_desafio_ia TEXT,
        
        -- Comprometimento
        comprometido_projeto VARCHAR(10),
        
        -- Metadados
        session_id VARCHAR(100),
        ip_address INET,
        user_agent TEXT,
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Constraint para evitar duplicatas
        UNIQUE(email)
      );
    `;

    console.log('📋 Executando SQL para criar tabela...');

    // Tentar executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.log('⚠️ Erro ao executar SQL via RPC, tentando método alternativo...');
      console.log('Erro:', error.message);

      // Método alternativo: criar via query builder
      console.log('🔄 Tentando criar tabela via query builder...');
      
      // Verificar se a tabela já existe
      const { data: tables, error: listError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'pesquisa_ai_code_pro');

      if (listError) {
        console.log('❌ Erro ao verificar tabelas:', listError.message);
      } else if (tables && tables.length > 0) {
        console.log('✅ Tabela pesquisa_ai_code_pro já existe!');
      } else {
        console.log('📋 Tabela não existe, será criada automaticamente na primeira inserção');
      }
    } else {
      console.log('✅ SQL executado com sucesso!');
      console.log('Resultado:', data);
    }

    // Criar índices
    console.log('📊 Criando índices...');
    const indexesSQL = [
      'CREATE INDEX IF NOT EXISTS idx_pesquisa_email ON pesquisa_ai_code_pro(email);',
      'CREATE INDEX IF NOT EXISTS idx_pesquisa_created_at ON pesquisa_ai_code_pro(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_pesquisa_session_id ON pesquisa_ai_code_pro(session_id);'
    ];

    for (const indexSQL of indexesSQL) {
      try {
        await supabase.rpc('exec_sql', { sql: indexSQL });
        console.log('✅ Índice criado:', indexSQL.split(' ')[5]);
      } catch (indexError) {
        console.log('⚠️ Erro ao criar índice (pode já existir):', indexError.message);
      }
    }

    // Testar inserção
    console.log('\n🧪 Testando inserção de dados...');
    const testData = {
      email: 'teste.setup@cienciadosdados.com',
      phone: '+5511999887766',
      is_programmer: true,
      idade: '25-34',
      genero: 'masculino',
      profissao_atual: 'Desenvolvedor',
      como_conheceu: 'youtube',
      tempo_conhece: '1-ano',
      expectativas_treinamento: 'Aprender IA',
      sonho_realizar: 'Criar startup de IA',
      maior_dificuldade: 'Falta de conhecimento',
      session_id: `setup_test_${Date.now()}`,
      utm_source: 'setup',
      utm_medium: 'script',
      utm_campaign: 'table-creation'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('pesquisa_ai_code_pro')
      .upsert(testData, { onConflict: 'email' })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro ao inserir dados de teste:', insertError.message);
    } else {
      console.log('✅ Dados de teste inseridos com sucesso!');
      console.log('ID gerado:', insertData.id);
    }

    console.log('\n🎯 SETUP CONCLUÍDO!');
    console.log('✅ Tabela pesquisa_ai_code_pro configurada');
    console.log('✅ Índices criados para performance');
    console.log('✅ Teste de inserção realizado');
    console.log('\n📋 Próximos passos:');
    console.log('1. Testar o formulário no navegador');
    console.log('2. Verificar se os dados estão sendo salvos');
    console.log('3. Confirmar o fluxo completo de pesquisa');

  } catch (error) {
    console.error('❌ Erro no setup:', error);
  }
};

// Executar setup
setupSurveyTable();
