-- Criar tabela de pesquisa para AI Code Pro
-- Vinculada aos dados de lead por email

CREATE TABLE IF NOT EXISTS pesquisa_ai_code_pro (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_programmer BOOLEAN,
  
  -- Dados demográficos
  idade VARCHAR(20),
  genero VARCHAR(20),
  
  -- Conhecimento técnico
  usa_rag_llm VARCHAR(20),
  conhece_frameworks_ia VARCHAR(20),
  ja_programa_python VARCHAR(20),
  usa_ml_dl VARCHAR(20),
  
  -- Dados profissionais
  faixa_salarial VARCHAR(50),
  profissao_atual TEXT,
  
  -- Relacionamento e descoberta
  como_conheceu VARCHAR(50),
  tempo_conhece VARCHAR(20),
  
  -- Motivações e desafios
  o_que_tira_sono TEXT,
  expectativas_treinamento TEXT,
  sonho_realizar TEXT,
  maior_dificuldade TEXT,
  pergunta_cafe TEXT,
  impedimento_sonho TEXT,
  maior_desafio_ia TEXT,
  
  -- Comprometimento
  comprometido_projeto VARCHAR(10),
  
  -- Metadados
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(email)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pesquisa_email ON pesquisa_ai_code_pro(email);
CREATE INDEX IF NOT EXISTS idx_pesquisa_created_at ON pesquisa_ai_code_pro(created_at);
CREATE INDEX IF NOT EXISTS idx_pesquisa_session_id ON pesquisa_ai_code_pro(session_id);

-- Comentários
COMMENT ON TABLE pesquisa_ai_code_pro IS 'Pesquisa detalhada dos leads do AI Code Pro - capturada após cadastro inicial';
COMMENT ON COLUMN pesquisa_ai_code_pro.email IS 'Email do lead - chave de ligação com qualified_leads';
COMMENT ON COLUMN pesquisa_ai_code_pro.session_id IS 'ID da sessão para rastreamento';
