# Guia de Integração com Hotmart Send

Este documento explica como configurar a integração entre o site AI Lab e o Hotmart Send para captura e gerenciamento de leads.

## Método de Integração com Automação Personalizada

Com base na interface atual do Hotmart Send, vamos usar a funcionalidade de "Automação Personalizada" para integrar o site com o sistema de captura de leads.

## Passo a Passo para Configuração

### 1. Acessar o Hotmart Send

1. Faça login na sua conta do Hotmart
2. Acesse o Hotmart Send
3. Vá para a seção "Automações"

### 2. Criar uma Automação Personalizada

1. Na página de automações, localize e clique em "Automação Personalizada"
2. Isso permitirá que você crie um fluxo personalizado para seus leads

### 3. Configurar a Tag para Identificação dos Leads

1. Durante a configuração da automação, você precisará definir uma tag para identificar os leads
2. Use "AI-HackAgents-01-25" como sua tag de identificação
3. Esta tag será usada no seu site para direcionar os leads para a automação correta

### 4. Configurar o Formulário no Hotmart Send

1. Na seção de configuração do formulário, defina os campos que deseja capturar (nome, email, whatsapp, etc.)
2. Associe o formulário à tag "AI-HackAgents-01-25"
3. Configure as opções de confirmação (simples ou dupla) conforme sua preferência

### 5. Obter o Link do Formulário

1. Após configurar o formulário, o Hotmart Send fornecerá um link para o formulário
2. Este link pode ser usado para direcionar os usuários diretamente para o formulário do Hotmart Send
3. Alternativamente, você pode usar o formulário personalizado do seu site e enviar os dados para o Hotmart Send

### 6. Configurar o Arquivo `.env.local`

1. Crie um arquivo `.env.local` na raiz do projeto (se ainda não existir)
2. Adicione as seguintes variáveis:
```
NEXT_PUBLIC_HOTMART_FORM_TAG=AI-HackAgents-01-25
NEXT_PUBLIC_HOTMART_FORM_URL=https://seu-link-do-formulario-hotmart
```

Substitua a URL pelo link do formulário que você obteve do Hotmart Send.

## Como Funciona a Integração

Existem duas opções para integrar seu site com o Hotmart Send:

### Opção 1: Redirecionamento para o Formulário do Hotmart

1. Configure seu botão "Quero me inscrever" para redirecionar para o link do formulário do Hotmart Send
2. Os usuários preencherão o formulário diretamente no Hotmart Send
3. Vantagem: Integração mais simples e direta

### Opção 2: Formulário Personalizado com Envio para o Hotmart

1. Use o formulário personalizado do seu site
2. Quando o usuário preencher o formulário, redirecione-o para a página de agradecimento
3. Simultaneamente, envie os dados para o Hotmart Send através de uma API interna
4. Vantagem: Experiência de usuário mais consistente e personalizada

## Testando a Integração

1. Após configurar tudo, preencha o formulário no seu site
2. Acesse o Hotmart Send e verifique se o lead foi registrado
3. Confirme se a tag foi aplicada corretamente

## Solução de Problemas

Se os leads não estiverem sendo registrados no Hotmart Send:

1. Verifique se a tag está configurada corretamente no Hotmart Send
2. Confirme se o formulário está associado à tag correta
3. Verifique os logs do console no navegador para possíveis erros
4. Teste o formulário diretamente no Hotmart Send para verificar se está funcionando

## Configuração Quando o Site Ainda Não Está Deployado

Se seu site ainda não está deployado e o Hotmart Send solicita a URL da página de agradecimento, você tem algumas opções:

### Opção 1: Deploy Temporário

A maneira mais direta é fazer um deploy temporário do site para obter URLs válidas:

1. Use serviços como Vercel ou Netlify para um deploy rápido
2. Obtenha a URL da página de agradecimento (ex: `https://seu-projeto.vercel.app/obrigado`)
3. Use esta URL na configuração do Hotmart Send

Consulte o arquivo `docs/deploy-instructions.md` para instruções detalhadas de deploy.

### Opção 2: Usar uma Página Temporária do Hotmart

Se não puder fazer o deploy imediatamente:

1. Na configuração do formulário do Hotmart Send, selecione a opção "Padrão Hotmart Send" para a página de confirmação
2. Isso usará uma página de agradecimento padrão do Hotmart
3. Depois que seu site estiver deployado, você pode atualizar a configuração para usar sua própria página de agradecimento

### Opção 3: Configuração em Duas Etapas

1. **Etapa 1 (Antes do Deploy)**:
   - Configure o formulário no Hotmart Send usando a página padrão de agradecimento
   - Obtenha o link do formulário e a tag
   - Configure seu site para usar esses valores

2. **Etapa 2 (Após o Deploy)**:
   - Atualize a configuração no Hotmart Send para usar sua página personalizada de agradecimento
   - Não será necessário alterar nada no código do site

### Testando Localmente com Túnel

Para testes locais, você pode usar um serviço de túnel como ngrok:

1. Execute seu site localmente (`npm run dev`)
2. Use ngrok para criar um túnel (`ngrok http 3000`)
3. Use a URL fornecida pelo ngrok para a página de agradecimento
4. Lembre-se que esta URL é temporária e mudará se você reiniciar o ngrok

## Recursos Adicionais

- [Documentação oficial do Hotmart Send](https://help.hotmart.com/pt-br/article/o-que-e-o-hotmart-send/360039426133)
- [Guia de Automações do Hotmart Send](https://help.hotmart.com/pt-br/article/como-criar-uma-automacao-no-hotmart-send/360039425973)
