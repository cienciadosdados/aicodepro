-- CRIAR TABELA qualified_leads_aug25
-- Execute este SQL no painel do Supabase

CREATE TABLE qualified_leads_aug25 (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_programmer BOOLEAN NOT NULL DEFAULT FALSE,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100), 
    utm_campaign VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar constraint UNIQUE no email
ALTER TABLE qualified_leads_aug25 
ADD CONSTRAINT qualified_leads_aug25_email_unique UNIQUE (email);

-- Desabilitar RLS
ALTER TABLE qualified_leads_aug25 DISABLE ROW LEVEL SECURITY;
