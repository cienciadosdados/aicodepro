-- Criar tabela para leads parciais (apenas qualificação)
-- Esta tabela armazena a escolha do usuário assim que ele clica SIM/NÃO

CREATE TABLE IF NOT EXISTS partial_leads (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL, -- ID único da sessão do usuário
  is_programmer BOOLEAN NOT NULL, -- TRUE para SIM, FALSE para NÃO
  utm_source VARCHAR(255) DEFAULT 'direct',
  utm_medium VARCHAR(255) DEFAULT 'none', 
  utm_campaign VARCHAR(255) DEFAULT 'none',
  ip_address VARCHAR(45) DEFAULT 'unknown',
  user_agent TEXT DEFAULT 'unknown',
  qualification_timestamp TIMESTAMPTZ DEFAULT NOW(), -- Quando clicou SIM/NÃO
  status VARCHAR(50) DEFAULT 'partial', -- 'partial', 'completed', 'abandoned'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_partial_leads_session_id ON partial_leads(session_id);
CREATE INDEX IF NOT EXISTS idx_partial_leads_qualification_timestamp ON partial_leads(qualification_timestamp);
CREATE INDEX IF NOT EXISTS idx_partial_leads_status ON partial_leads(status);

-- Comentários para documentação
COMMENT ON TABLE partial_leads IS 'Armazena dados parciais de leads capturados na primeira interação (qualificação)';
COMMENT ON COLUMN partial_leads.session_id IS 'ID único gerado no frontend para identificar a sessão do usuário';
COMMENT ON COLUMN partial_leads.is_programmer IS 'Resposta à pergunta "Você já programa?" - TRUE=SIM, FALSE=NÃO';
COMMENT ON COLUMN partial_leads.qualification_timestamp IS 'Timestamp exato de quando o usuário clicou SIM ou NÃO';
COMMENT ON COLUMN partial_leads.status IS 'Status do lead: partial=só qualificação, completed=dados completos, abandoned=abandonou';

-- RLS (Row Level Security) - Desabilitado para simplificar
ALTER TABLE partial_leads DISABLE ROW LEVEL SECURITY;
