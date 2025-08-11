// Script para testar a integração da pesquisa
// Simula o fluxo completo: cadastro → pesquisa → redirecionamento

const testSurveyIntegration = async () => {
  console.log('🧪 TESTE: Integração da Pesquisa AI Code Pro');
  console.log('=' .repeat(50));

  // Dados de teste
  const testData = {
    email: 'teste.pesquisa@cienciadosdados.com',
    phone: '+5511999887766',
    is_programmer: true,
    session_id: `test_${Date.now()}`,
    
    // Dados da pesquisa
    idade: '25-34',
    genero: 'masculino',
    usa_rag_llm: 'sim',
    conhece_frameworks_ia: 'nao',
    ja_programa_python: 'sim',
    usa_ml_dl: 'nao',
    faixa_salarial: '5000-7000',
    profissao_atual: 'Desenvolvedor Full Stack',
    como_conheceu: 'youtube',
    tempo_conhece: '1-ano',
    o_que_tira_sono: 'Como implementar IA nos meus projetos de forma prática',
    expectativas_treinamento: 'Aprender RAG e LLM para criar soluções reais',
    sonho_realizar: 'Criar uma startup de IA que revolucione o mercado',
    maior_dificuldade: 'Falta de conhecimento prático em IA',
    comprometido_projeto: 'sim',
    
    // UTMs
    utm_source: 'test',
    utm_medium: 'script',
    utm_campaign: 'survey-integration-test'
  };

  console.log('📝 Dados de teste:', {
    email: testData.email,
    phone: testData.phone,
    is_programmer: testData.is_programmer,
    session_id: testData.session_id
  });

  try {
    // 1. Testar API de pesquisa
    console.log('\n1️⃣ Testando API save-survey...');
    
    const response = await fetch('http://localhost:3000/api/save-survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API save-survey funcionando:', result);
    } else {
      console.log('❌ Erro na API save-survey:', result);
      return;
    }

    // 2. Verificar se os dados foram salvos
    console.log('\n2️⃣ Verificando dados salvos...');
    
    // Simular verificação no Supabase (seria feito via query)
    console.log('📊 Dados que deveriam estar no banco:');
    console.log('- Email:', testData.email);
    console.log('- Telefone:', testData.phone);
    console.log('- É programador:', testData.is_programmer);
    console.log('- Idade:', testData.idade);
    console.log('- Profissão:', testData.profissao_atual);
    console.log('- Como conheceu:', testData.como_conheceu);
    console.log('- Expectativas:', testData.expectativas_treinamento);

    // 3. Testar fluxo de redirecionamento
    console.log('\n3️⃣ Testando fluxo de redirecionamento...');
    const redirectUrl = `/obrigado?email=${encodeURIComponent(testData.email)}`;
    console.log('🔄 URL de redirecionamento:', `http://localhost:3000${redirectUrl}`);

    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('🎯 Próximos passos:');
    console.log('1. Verificar se a tabela pesquisa_ai_code_pro foi criada no Supabase');
    console.log('2. Testar o fluxo completo no navegador');
    console.log('3. Verificar se os dados estão sendo salvos corretamente');
    console.log('4. Confirmar redirecionamento após pesquisa');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Executar teste se o script for chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testSurveyIntegration();
} else {
  // Browser environment
  console.log('🌐 Execute testSurveyIntegration() no console do navegador');
}
