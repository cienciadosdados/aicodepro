# Deploy Rápido para Testes com Vercel

Este guia mostra como fazer um deploy rápido do site para obter URLs válidas para configuração do Hotmart Send.

## Pré-requisitos

- Conta no GitHub
- Conta na Vercel (pode criar gratuitamente com sua conta GitHub)

## Passos para Deploy

1. **Prepare seu repositório**

   Certifique-se de que seu código está em um repositório GitHub:
   ```bash
   git add .
   git commit -m "Preparando para deploy de teste"
   git push
   ```

2. **Deploy na Vercel**

   a. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
   
   b. Clique em "Add New..." e selecione "Project"
   
   c. Importe seu repositório GitHub
   
   d. Configure as variáveis de ambiente (opcional neste momento)
   
   e. Clique em "Deploy"

3. **Obtenha as URLs**

   Após o deploy, a Vercel fornecerá URLs para seu site:
   
   - URL principal: `https://seu-projeto.vercel.app`
   - URL da página de agradecimento: `https://seu-projeto.vercel.app/obrigado`

4. **Configure o Hotmart Send**

   Use a URL da página de agradecimento (`https://seu-projeto.vercel.app/obrigado`) na configuração do formulário do Hotmart Send.

## Configuração Local para Testes

Se preferir testar localmente antes do deploy, você pode usar o ngrok para criar um túnel temporário:

1. **Instale o ngrok**

   Baixe em [ngrok.com](https://ngrok.com) e siga as instruções de instalação.

2. **Inicie seu servidor local**

   ```bash
   npm run dev
   ```

3. **Crie um túnel com ngrok**

   ```bash
   ngrok http 3000
   ```

4. **Use a URL fornecida**

   O ngrok fornecerá uma URL pública (ex: `https://abc123.ngrok.io`) que você pode usar temporariamente para testes.
   
   URL da página de agradecimento: `https://abc123.ngrok.io/obrigado`

## Notas Importantes

- Os deploys na Vercel são atualizados automaticamente quando você faz push para o repositório
- As URLs do ngrok mudam a cada vez que você reinicia o serviço
- Para um ambiente de produção, considere usar um domínio personalizado
