// Otimizações específicas para Core Web Vitals
(() => {
  // Função para otimizar o LCP (Largest Contentful Paint)
  function optimizeLCP() {
    // Priorizar recursos críticos
    const criticalImages = document.querySelectorAll('.hero-image, .banner-image, img[data-critical="true"]');
    criticalImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.fetchPriority = 'high';
        img.loading = 'eager';
        // Garantir que a imagem tenha dimensões definidas para evitar layout shifts
        if (!img.width && !img.height && img.getAttribute('width') && img.getAttribute('height')) {
          img.width = parseInt(img.getAttribute('width'));
          img.height = parseInt(img.getAttribute('height'));
        }
      }
    });
  }

  // Função para otimizar o CLS (Cumulative Layout Shift)
  function optimizeCLS() {
    // Definir dimensões para elementos que podem causar layout shift
    const elementsWithoutDimensions = document.querySelectorAll('img:not([width]):not([height]), iframe:not([width]):not([height])');
    elementsWithoutDimensions.forEach(el => {
      if (el instanceof HTMLImageElement) {
        // Definir um aspect ratio padrão para imagens sem dimensões
        el.style.aspectRatio = '16/9';
      }
    });

    // Evitar layout shifts em fontes
    document.documentElement.classList.add('font-loaded');
  }

  // Função para otimizar o FID (First Input Delay)
  function optimizeFID() {
    // Adiar scripts não críticos
    const deferScripts = () => {
      const scripts = document.querySelectorAll('script[data-defer="true"]');
      scripts.forEach(script => {
        script.setAttribute('defer', '');
        if (!script.hasAttribute('src') && script.textContent) {
          const originalCode = script.textContent;
          script.textContent = '';
          setTimeout(() => {
            try {
              new Function(originalCode)();
            } catch (e) {
              console.error('Error executing deferred script:', e);
            }
          }, 1000);
        }
      });
    };

    // Executar após o evento load
    if (document.readyState === 'complete') {
      deferScripts();
    } else {
      window.addEventListener('load', deferScripts);
    }
  }

  // Função para otimizar o INP (Interaction to Next Paint)
  function optimizeINP() {
    // Usar requestAnimationFrame para operações visuais
    const optimizeInteractions = () => {
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      interactiveElements.forEach(el => {
        el.addEventListener('click', e => {
          if (el.classList.contains('processing')) {
            return;
          }
          
          // Adicionar classe para feedback visual imediato
          el.classList.add('processing');
          
          // Usar requestAnimationFrame para atualizações visuais
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.classList.remove('processing');
            });
          });
        });
      });
    };

    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeInteractions);
    } else {
      optimizeInteractions();
    }
  }

  // Executar otimizações
  function runOptimizations() {
    // Executar otimizações críticas imediatamente
    optimizeLCP();
    optimizeCLS();
    
    // Adiar otimizações não críticas
    requestIdleCallback(() => {
      optimizeFID();
      optimizeINP();
    }, { timeout: 1000 });
  }

  // Executar otimizações quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runOptimizations);
  } else {
    runOptimizations();
  }
})();
