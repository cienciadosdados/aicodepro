// Script para otimizar a performance do site
document.addEventListener('DOMContentLoaded', function() {
  // Lazy loading para imagens
  const images = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.removeAttribute('data-src');
          imageObserver.unobserve(image);
        }
      });
    });
    
    images.forEach(function(image) {
      imageObserver.observe(image);
    });
  } else {
    // Fallback para navegadores que não suportam IntersectionObserver
    images.forEach(function(image) {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
  }
  
  // Adiar carregamento de scripts não críticos
  setTimeout(function() {
    const deferredScripts = document.querySelectorAll('script[data-defer]');
    deferredScripts.forEach(function(script) {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
      } else {
        newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript);
      script.remove();
    });
  }, 2000);
});
