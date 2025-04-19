// scripts/analyze-performance.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configurações para o Lighthouse
const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
    },
  },
};

// URLs para testar
const urls = [
  'http://localhost:3000/',
  // Adicione outras URLs do seu site aqui
];

async function runLighthouse() {
  // Iniciar Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  });

  // Diretório para salvar os relatórios
  const reportDir = path.join(__dirname, '../lighthouse-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Executar Lighthouse para cada URL
  for (const url of urls) {
    console.log(`Analisando: ${url}`);
    
    const options = {
      logLevel: 'info',
      output: 'html',
      port: chrome.port,
      ...config,
    };
    
    try {
      const runnerResult = await lighthouse(url, options);
      
      // Salvar relatório HTML
      const reportHtml = runnerResult.report;
      const fileName = `lighthouse-${new URL(url).pathname.replace(/\//g, '-') || 'home'}-${Date.now()}.html`;
      fs.writeFileSync(path.join(reportDir, fileName), reportHtml);
      
      // Exibir resultados no console
      console.log('Relatório salvo:', fileName);
      console.log('Pontuações:');
      console.log('- Performance:', runnerResult.lhr.categories.performance.score * 100);
      console.log('- Acessibilidade:', runnerResult.lhr.categories.accessibility.score * 100);
      console.log('- Melhores Práticas:', runnerResult.lhr.categories['best-practices'].score * 100);
      console.log('- SEO:', runnerResult.lhr.categories.seo.score * 100);
      console.log('-----------------------------------');
    } catch (error) {
      console.error(`Erro ao analisar ${url}:`, error);
    }
  }

  // Fechar Chrome
  await chrome.kill();
}

// Executar análise
runLighthouse()
  .then(() => console.log('Análise concluída!'))
  .catch(err => console.error('Erro na análise:', err));
