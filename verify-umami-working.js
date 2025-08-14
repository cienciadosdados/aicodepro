// Script para verificar se o Umami Analytics está funcionando
// Execute este script no console do navegador na página do site

(function() {
  console.log('🔍 VERIFICAÇÃO UMAMI ANALYTICS - INICIANDO...');
  
  // Verificar se o script está presente no DOM
  const umamiScript = document.querySelector('script[src*="umami.is"]');
  console.log('📜 Script Umami encontrado:', !!umamiScript);
  
  if (umamiScript) {
    console.log('✅ Script encontrado com configurações:');
    console.log('- src:', umamiScript.src);
    console.log('- data-website-id:', umamiScript.getAttribute('data-website-id'));
    console.log('- defer:', umamiScript.defer);
    console.log('- async:', umamiScript.async);
  } else {
    console.error('❌ Script do Umami não encontrado no DOM');
    return;
  }
  
  // Verificar se a função umami está disponível
  function checkUmamiFunction() {
    if (typeof window.umami === 'function') {
      console.log('✅ Função window.umami disponível!');
      
      // Testar envio de evento
      try {
        window.umami.track('analytics-test', {
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          test: 'verification'
        });
        console.log('📊 Evento de teste enviado com sucesso!');
        
        // Verificar se há dados sendo enviados
        console.log('🌐 Monitorando requisições...');
        return true;
      } catch (error) {
        console.error('❌ Erro ao enviar evento:', error);
        return false;
      }
    } else {
      console.warn('⚠️ Função window.umami não disponível ainda');
      return false;
    }
  }
  
  // Verificar imediatamente
  if (!checkUmamiFunction()) {
    // Se não estiver disponível, aguardar um pouco
    console.log('⏳ Aguardando carregamento do script...');
    
    setTimeout(() => {
      if (!checkUmamiFunction()) {
        console.error('❌ Umami não carregou após 5 segundos');
        
        // Verificar possíveis problemas
        console.log('🔍 Diagnóstico:');
        
        // Verificar requisições de rede
        const resources = performance.getEntriesByType('resource');
        const umamiResource = resources.find(r => r.name.includes('umami'));
        
        if (umamiResource) {
          console.log('📡 Requisição do script encontrada:', {
            name: umamiResource.name,
            status: umamiResource.responseStatus,
            duration: umamiResource.duration,
            size: umamiResource.transferSize
          });
        } else {
          console.error('❌ Nenhuma requisição para umami.is encontrada');
        }
        
        // Verificar bloqueadores
        console.log('🛡️ Possível bloqueio por ad-blocker ou firewall');
      }
    }, 5000);
  }
  
  // Monitorar requisições de rede para o Umami
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (url && typeof url === 'string' && url.includes('umami')) {
      console.log('📡 Requisição Umami interceptada:', url);
    }
    return originalFetch.apply(this, args);
  };
  
  console.log('🏁 Verificação iniciada. Aguarde os resultados...');
})();
