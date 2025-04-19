// Script de otimização de performance para melhorar o Core Web Vitals
document.addEventListener('DOMContentLoaded', function() {
  // 1. Otimização de imagens - Lazy loading
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  }
  
  // 2. Otimização de fontes
  if ('fonts' in document) {
    // Pré-carregar fontes críticas
    Promise.all([
      document.fonts.load('1em Inter'),
      document.fonts.load('bold 1em Inter')
    ]).then(function() {
      document.documentElement.classList.add('fonts-loaded');
    });
  }
  
  // 3. Otimização de scripts de terceiros
  function loadScriptAsync(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  
  // 4. Adiar carregamento de recursos não críticos
  setTimeout(function() {
    // Carregar scripts não críticos após o carregamento inicial
    const nonCriticalScripts = [
      // Adicione aqui scripts não críticos que podem ser carregados posteriormente
    ];
    
    nonCriticalScripts.forEach(function(src) {
      loadScriptAsync(src).catch(function(error) {
        console.warn('Falha ao carregar script:', error);
      });
    });
    
    // Pré-conectar a domínios que serão usados em breve
    const domains = [
      'https://www.googletagmanager.com',
      'https://connect.facebook.net'
    ];
    
    domains.forEach(function(domain) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  }, 2000);
  
  // 5. Otimização de CLS (Cumulative Layout Shift)
  // Reservar espaço para elementos que podem causar layout shift
  const elementsWithHeight = document.querySelectorAll('[data-height]');
  elementsWithHeight.forEach(function(element) {
    const height = element.getAttribute('data-height');
    if (height) {
      element.style.minHeight = height + 'px';
    }
  });
  
  // 6. Otimização de LCP (Largest Contentful Paint)
  // Priorizar o carregamento de imagens grandes visíveis
  const lcpElements = document.querySelectorAll('.hero-image, .banner-image');
  lcpElements.forEach(function(element) {
    if (element.tagName === 'IMG') {
      element.fetchPriority = 'high';
      element.loading = 'eager';
    } else {
      const img = element.querySelector('img');
      if (img) {
        img.fetchPriority = 'high';
        img.loading = 'eager';
      }
    }
  });
  
  // 7. Otimização de FID (First Input Delay)
  // Dividir tarefas longas em tarefas menores
  const deferredTasks = [];
  
  function addDeferredTask(task) {
    deferredTasks.push(task);
  }
  
  function processDeferredTasks() {
    if (deferredTasks.length === 0) return;
    
    const task = deferredTasks.shift();
    task();
    
    if (deferredTasks.length > 0) {
      setTimeout(processDeferredTasks, 10);
    }
  }
  
  // Iniciar processamento de tarefas após o carregamento inicial
  setTimeout(processDeferredTasks, 1000);
  
  // 8. Otimização de formulários
  const forms = document.querySelectorAll('form');
  forms.forEach(function(form) {
    // Evitar reflow durante a digitação
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(function(input) {
      input.addEventListener('focus', function() {
        this.classList.add('active-input');
      });
      
      input.addEventListener('blur', function() {
        this.classList.remove('active-input');
      });
    });
  });
});
