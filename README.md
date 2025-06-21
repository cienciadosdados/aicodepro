# AI Code Pro

Uma landing page moderna e otimizada para captura de leads com **sistema anti-duplicação robusto** e **backup triplo**.

## Características

- **Sistema Anti-Duplicação**: UPSERT atômico elimina race conditions
- **Backup Triplo**: Supabase + Local + Neon PostgreSQL
- **Design Responsivo**: Interface moderna e otimizada
- **Formulário Inteligente**: Captura em 2 etapas com validação
- **Integração Completa**: Hotmart Send + N8N + Webhooks
- **Monitoramento**: Logs detalhados com request IDs únicos

## Configuração

### 1. **Clone e Dependências**
```bash
git clone [repositório]
cd aicodepro
npm install
```

### 2. **Variáveis de Ambiente (.env.local)**
```env
# Supabase (Principal)
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Neon PostgreSQL (Backup)
DATABASE_URL=sua_connection_string_neon
DATABASE_SSL=true

# Webhooks (Opcionais)
BACKUP_WEBHOOK_URL=url_webhook_backup
NEXT_PUBLIC_HOTMART_WEBHOOK_URL=url_hotmart
NEXT_PUBLIC_HOTMART_FORM_TAG=sua_tag
```

### 3. **Configuração do Banco**
```sql
-- Criar tabela no Supabase
CREATE TABLE qualified_leads_jun25 (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  is_programmer BOOLEAN DEFAULT false,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desabilitar RLS (configuração recomendada)
ALTER TABLE qualified_leads_jun25 DISABLE ROW LEVEL SECURITY;
```

## Integração com Hotmart Send

### **Configuração:**
1. Crie automação no Hotmart Send
2. Configure webhook para receber leads
3. Defina tag de identificação
4. Configure URL no `.env.local`

### **Uso do Componente:**
```jsx
import { HotmartForm } from '@/components/forms/hotmart-form';

<HotmartForm redirectTo="/obrigado" />
```

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
