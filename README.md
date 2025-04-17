# AI Code Pro

Uma landing page moderna e otimizada para captura de leads, integrada com Hotmart Send.

## Características

- Design moderno e responsivo
- Formulário de captura otimizado
- Integração com Hotmart Send
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

## Deploy

Esta aplicação pode ser facilmente deployada em plataformas como:
- Vercel
- Netlify
- DigitalOcean

## Tecnologias Utilizadas

- Next.js 14
- React
- TailwindCSS
- React Hook Form
- Zod para validação
