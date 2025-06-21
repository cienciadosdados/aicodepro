-- Criar tabela de teste qualified_leads_jun25 com constraint UNIQUE
CREATE TABLE qualified_leads_jun25 (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  is_programmer BOOLEAN DEFAULT false,
  utm_source VARCHAR(255) DEFAULT 'direct',
  utm_medium VARCHAR(255) DEFAULT 'none',
  utm_campaign VARCHAR(255) DEFAULT 'none',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para performance
CREATE INDEX idx_qualified_leads_jun25_email ON qualified_leads_jun25(email);
CREATE INDEX idx_qualified_leads_jun25_created_at ON qualified_leads_jun25(created_at);

-- Comentário da tabela
COMMENT ON TABLE qualified_leads_jun25 IS 'Tabela de leads qualificados - Junho 2025 - Com constraint UNIQUE para evitar duplicatas';
