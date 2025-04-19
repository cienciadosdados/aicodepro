// Script de configuração do Supabase
console.log(`
Passos para configurar o Supabase:

1. Crie uma conta em https://supabase.com
2. Crie um novo projeto
3. Acesse o SQL Editor e execute:
   
   CREATE TABLE qualified_leads (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     email TEXT NOT NULL,
     phone TEXT,
     is_programmer BOOLEAN,
     utm_source TEXT,
     utm_medium TEXT,
     utm_campaign TEXT,
     ip_address TEXT,
     user_agent TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

4. Em Project Settings > API:
   - Copie a URL (NEXT_PUBLIC_SUPABASE_URL)
   - Gere uma Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

5. Configure as variáveis no .env.local:
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   SUPABASE_SERVICE_ROLE_KEY=sua_chave
`)
