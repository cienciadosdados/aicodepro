// Script para testar se o Umami Analytics está funcionando
// Execute este script no console do navegador na página do site

console.log('🔍 TESTE UMAMI ANALYTICS - INICIANDO...');

// 1. Verificar se o script do Umami foi carregado
const umamiScript = document.querySelector('script[src*="umami.is"]');
console.log('📜 Script Umami encontrado:', !!umamiScript);
if (umamiScript) {
  console.log('📋 Atributos do script:', {
    src: umamiScript.src,
    'data-website-id': umamiScript.getAttribute('data-website-id'),
    defer: umamiScript.defer,
    async: umamiScript.async
  });
}

// 2. Verificar se a função umami está disponível
setTimeout(() => {
  console.log('🔧 Função umami disponível:', typeof window.umami);
  
  if (typeof window.umami === 'function') {
    console.log('✅ Umami carregado com sucesso!');
    
    // 3. Testar envio de evento customizado
    try {
      window.umami.track('teste-analytics', { 
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        teste: true 
      });
      console.log('📊 Evento de teste enviado para Umami');
    } catch (error) {
      console.error('❌ Erro ao enviar evento teste:', error);
    }
  } else {
    console.warn('⚠️ Umami não carregou ou não está disponível');
    
    // Verificar possíveis problemas
    console.log('🔍 Verificando possíveis problemas:');
    console.log('- Network requests:', performance.getEntriesByType('resource').filter(r => r.name.includes('umami')));
    console.log('- Console errors:', console.error.toString());
  }
}, 3000); // Aguardar 3 segundos para o script carregar

// 4. Verificar se há bloqueadores de anúncios
console.log('🛡️ Verificando bloqueadores...');
const testElement = document.createElement('div');
testElement.className = 'adsbox';
testElement.style.position = 'absolute';
testElement.style.left = '-9999px';
document.body.appendChild(testElement);

setTimeout(() => {
  const isBlocked = testElement.offsetHeight === 0;
  console.log('🚫 Bloqueador de anúncios detectado:', isBlocked);
  document.body.removeChild(testElement);
}, 100);

// 5. Verificar requisições de rede para o Umami
console.log('🌐 Monitorando requisições de rede...');
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0] && args[0].includes && args[0].includes('umami')) {
    console.log('📡 Requisição Umami detectada:', args[0]);
  }
  return originalFetch.apply(this, args);
};

console.log('🏁 TESTE UMAMI ANALYTICS - CONCLUÍDO');
console.log('📝 Verifique os logs acima para diagnosticar problemas');
