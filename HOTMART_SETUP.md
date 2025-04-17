# Configuração da Integração com Hotmart

Este documento explica como configurar a integração do formulário de leads com a Hotmart.

## 1. Configuração do Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
NEXT_PUBLIC_HOTMART_WEBHOOK_URL=https://sua-url-de-webhook-da-hotmart.com
```

## 2. Configuração na Hotmart

### Passo a passo para configurar o webhook na Hotmart:

1. **Acesse sua conta Hotmart**:
   - Faça login em [https://app-vlc.hotmart.com/](https://app-vlc.hotmart.com/)

2. **Acesse a área de Desenvolvedores**:
   - No menu lateral, clique em "Ferramentas" e depois em "Desenvolvedores"

3. **Crie uma nova aplicação**:
   - Clique em "Criar Aplicação"
   - Preencha os dados básicos da aplicação (nome, descrição)
   - Defina os escopos necessários (mínimo: `payments.read`, `subscriptions.read`, `users.read`)

4. **Configure o Webhook**:
   - Na seção de Webhooks, clique em "Adicionar Webhook"
   - Selecione os eventos que deseja receber (recomendado: `PURCHASE.APPROVED`, `SUBSCRIPTION.APPROVED`)
   - Defina a URL de callback (esta será a URL que você colocará no arquivo `.env.local`)
   - Defina uma chave secreta para validação (opcional, mas recomendado)

5. **Obtenha as credenciais**:
   - Após criar a aplicação, você receberá um Client ID e Client Secret
   - Guarde essas informações em um local seguro

6. **Teste a integração**:
   - A Hotmart oferece uma ferramenta de teste de webhook
   - Use-a para verificar se sua aplicação está recebendo os eventos corretamente

## 3. Configuração no Vercel

Para que a integração funcione no ambiente de produção, você precisa adicionar a variável de ambiente no Vercel:

1. Acesse o dashboard do Vercel
2. Selecione seu projeto
3. Vá para a aba "Settings"
4. Na seção "Environment Variables", adicione:
   - Nome: `NEXT_PUBLIC_HOTMART_WEBHOOK_URL`
   - Valor: URL do webhook da Hotmart
5. Clique em "Save"
6. Faça um novo deploy para que as alterações tenham efeito

## 4. Monitoramento de Conversões

Para monitorar as conversões e o Connect Rate, recomendamos:

1. **Google Analytics**:
   - Configure eventos personalizados para cada etapa do funil
   - Crie um funil de conversão no GA4

2. **Facebook Pixel**:
   - Use eventos padrão como `Lead` e `CompleteRegistration`
   - Configure conversões personalizadas no Facebook Ads Manager

3. **Hotmart Analytics**:
   - Utilize as ferramentas nativas da Hotmart para acompanhar conversões
   - Analise a taxa de conversão entre leads capturados e vendas realizadas

4. **Planilha de Acompanhamento**:
   - Crie uma planilha para acompanhar diariamente:
     - Número de visitantes
     - Número de leads capturados
     - Taxa de conversão (leads/visitantes)
     - Origem do tráfego (UTM parameters)
