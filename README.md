# AI Code Pro

Uma landing page moderna e otimizada para captura de leads, integrada com Hotmart Send e armazenamento de leads qualificados no Neon PostgreSQL.

## Características

- Design moderno e responsivo
- Formulário de captura otimizado
- Integração com Hotmart Send
- Armazenamento de leads qualificados no Neon PostgreSQL
- Animações suaves de scroll
- Seções de benefícios e depoimentos
- Alta taxa de conversão

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`
   - Adicione sua URL do webhook do Hotmart Send
   - Copie o arquivo `.env.database.example` para `.env.local` e configure a URL do banco de dados Neon

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Para produção:
```bash
npm run build
npm start
```

## Integração com Hotmart Send

1. No Hotmart Send, crie uma nova automação:
   - Acesse sua conta do Hotmart Send
   - Vá para a seção "Configurações" ou "Integrações"
   - Procure por "Webhook" ou "API"

2. Configure o webhook para receber os leads:
   - Crie uma tag para identificar os leads (ex: "AI-HackAgents-01-25")
   - Nas configurações do formulário, selecione esta tag
   - O sistema irá gerar uma URL de webhook única

3. Configure o arquivo `.env.local`:
   ```
   NEXT_PUBLIC_HOTMART_WEBHOOK_URL=sua_url_do_webhook_aqui
   NEXT_PUBLIC_HOTMART_FORM_TAG=sua_tag_aqui
   ```

4. Utilize o componente de formulário:
   ```jsx
   import { HotmartForm } from '@/components/forms/hotmart-form';
   
   // Na sua página
   <HotmartForm redirectTo="/obrigado" />
   ```

5. Teste a integração:
   - Preencha o formulário no site
   - Verifique se o lead aparece no Hotmart Send com a tag correta

## Armazenamento de Leads Qualificados

O sistema possui duas implementações para armazenamento de leads qualificados no banco de dados Neon PostgreSQL:

### 1. Implementação com módulo pg (lib/simple-lead-storage.js)

Esta implementação usa o módulo `pg` para se conectar ao banco de dados Neon. Funciona bem em ambiente de desenvolvimento, mas pode apresentar problemas em ambientes serverless como o Vercel.

### 2. Implementação com API HTTP (lib/neon-http-storage.js)

Esta implementação usa a API HTTP do Neon para se conectar ao banco de dados, sem depender do módulo `pg`. É mais robusta para ambientes serverless e é a implementação recomendada para produção.

Para configurar o armazenamento de leads qualificados:

1. Configure a variável de ambiente `DATABASE_URL` com a URL de conexão do seu banco de dados Neon:
   ```
   DATABASE_URL=postgresql://user:password@db.example.neon.tech/neondb?sslmode=require
   ```

2. Inicialize o banco de dados (opcional, o sistema cria a tabela automaticamente se não existir):
   ```bash
   node scripts/init-db.js
   ```

3. Teste a conexão com o banco de dados:
   ```bash
   node scripts/test-neon-http.js
   ```

4. Verifique os registros no banco de dados:
   ```bash
   node scripts/check-database.js
   ```

## Diagnóstico do Banco de Dados

O sistema possui endpoints de diagnóstico para verificar a conexão com o banco de dados:

- `/api/db-diagnostic?diagnostic=true` - Verifica a conexão com o banco de dados
- `/api/qualified-lead?diagnostic=true` - Verifica a conexão com o banco de dados e retorna informações sobre o endpoint de qualificação de leads

## Deploy

Esta aplicação pode ser facilmente deployada em plataformas como:
- Vercel
- Netlify
- DigitalOcean

### Configuração no Vercel

1. Configure a variável de ambiente `DATABASE_URL` no painel do Vercel
2. Certifique-se de que o banco de dados Neon está configurado para aceitar conexões do Vercel
3. Após o deploy, teste a conexão com o banco de dados acessando `/api/db-diagnostic?diagnostic=true`

## Tecnologias Utilizadas

- Next.js 14
- React
- TailwindCSS
- React Hook Form
- Zod para validação
- Neon PostgreSQL
- API HTTP do Neon para ambientes serverless
