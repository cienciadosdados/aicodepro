#!/usr/bin/env node

/**
 * Script para facilitar a configuração da integração com Hotmart Send
 * 
 * Este script ajuda a configurar as variáveis de ambiente necessárias
 * para a integração com o Hotmart Send.
 * 
 * Uso:
 * node scripts/setup-hotmart.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Caminho para o arquivo .env.local
const envPath = path.join(process.cwd(), '.env.local');

// Verifica se o arquivo já existe
const fileExists = fs.existsSync(envPath);

console.log('\n===== Configuração da Integração com Hotmart Send =====\n');

// Função para perguntar ao usuário
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setup() {
  console.log('Este script irá configurar as variáveis de ambiente necessárias para a integração com o Hotmart Send.\n');
  
  if (fileExists) {
    console.log('O arquivo .env.local já existe. Deseja sobrescrever as configurações do Hotmart Send?');
    const overwrite = await askQuestion('Sobrescrever? (s/n): ');
    
    if (overwrite.toLowerCase() !== 's') {
      console.log('\nOperação cancelada. O arquivo .env.local não foi modificado.');
      rl.close();
      return;
    }
  }
  
  // Perguntar ao usuário sobre as configurações
  console.log('\nPor favor, forneça as seguintes informações:');
  
  const formTag = await askQuestion('Tag do formulário (padrão: AI-HackAgents-01-25): ') || 'AI-HackAgents-01-25';
  const formUrl = await askQuestion('URL do formulário do Hotmart Send: ');
  
  // Verificar se a URL foi fornecida
  if (!formUrl) {
    console.log('\nAtenção: Nenhuma URL de formulário foi fornecida.');
    console.log('O site usará apenas o fluxo de redirecionamento para a página de agradecimento.');
  }
  
  // Ler o conteúdo atual do arquivo, se existir
  let currentContent = '';
  if (fileExists) {
    currentContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Remover configurações existentes do Hotmart Send
  const lines = currentContent.split('\n').filter(line => {
    return !line.startsWith('NEXT_PUBLIC_HOTMART_FORM_TAG=') && 
           !line.startsWith('NEXT_PUBLIC_HOTMART_FORM_URL=');
  });
  
  // Adicionar as novas configurações
  lines.push('# Hotmart Send Integration');
  lines.push(`NEXT_PUBLIC_HOTMART_FORM_TAG=${formTag}`);
  if (formUrl) {
    lines.push(`NEXT_PUBLIC_HOTMART_FORM_URL=${formUrl}`);
  }
  
  // Escrever o arquivo
  fs.writeFileSync(envPath, lines.join('\n'));
  
  console.log('\n✅ Configuração concluída com sucesso!');
  console.log(`O arquivo .env.local foi ${fileExists ? 'atualizado' : 'criado'} com as configurações do Hotmart Send.`);
  
  // Instruções adicionais
  console.log('\n===== Próximos Passos =====');
  console.log('1. Reinicie o servidor de desenvolvimento (se estiver rodando)');
  console.log('2. Teste o formulário para verificar a integração');
  
  if (!formUrl) {
    console.log('\n⚠️ Lembre-se: Como você não forneceu uma URL de formulário, o site usará apenas');
    console.log('o fluxo de redirecionamento para a página de agradecimento.');
    console.log('Quando tiver a URL do formulário do Hotmart Send, execute este script novamente.');
  }
  
  rl.close();
}

// Executar o setup
setup().catch(err => {
  console.error('Erro durante a configuração:', err);
  rl.close();
});
