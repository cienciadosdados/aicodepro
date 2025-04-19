-- Schema para tabela de qualificação de leads
CREATE TABLE IF NOT EXISTS qualified_leads (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    is_programmer BOOLEAN NOT NULL,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_qualified_leads_email ON qualified_leads(email);
CREATE INDEX IF NOT EXISTS idx_qualified_leads_is_programmer ON qualified_leads(is_programmer);
CREATE INDEX IF NOT EXISTS idx_qualified_leads_created_at ON qualified_leads(created_at);

-- Comentários para documentação
COMMENT ON TABLE qualified_leads IS 'Armazena leads qualificados com informação se já programa ou não';
COMMENT ON COLUMN qualified_leads.is_programmer IS 'True se o lead já programa, False caso contrário';
