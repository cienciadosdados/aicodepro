-- Tabela de pesquisa AI Code Pro - SCHEMA CORRIGIDO
-- Tipos apropriados e estrutura normalizada

-- Enum para faixa etária
CREATE TYPE faixa_etaria AS ENUM (
  '18-24', '25-34', '35-44', '45-54', '55+'
);

-- Enum para gênero
CREATE TYPE genero_tipo AS ENUM (
  'masculino', 'feminino', 'prefiro-nao-dizer'
);

-- Enum para faixa salarial
CREATE TYPE faixa_salarial_tipo AS ENUM (
  'ate-1500', '1500-3000', '3000-5000', '5000-7000', 
  '7000-9000', '9000-11000', 'acima-11000'
);

-- Enum para respostas sim/não/neutro
CREATE TYPE resposta_conhecimento AS ENUM (
  'sim', 'nao', 'nem-sei', 'nunca-ouvi'
);

-- Enum para canais de aquisição
CREATE TYPE canal_aquisicao AS ENUM (
  'instagram', 'facebook', 'youtube', 'indicacao', 
  'portal', 'anuncio'
);

-- Enum para tempo de relacionamento
CREATE TYPE tempo_relacionamento AS ENUM (
  'menos-2-meses', '6-meses', '1-ano', '2-anos', 'mais-2-anos'
);

CREATE TABLE IF NOT EXISTS pesquisa_ai_code_pro (
  id SERIAL PRIMARY KEY,
  
  -- Dados de identificação
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_programmer BOOLEAN NOT NULL,
  
  -- Dados demográficos (tipos apropriados)
  idade faixa_etaria,
  genero genero_tipo,
  faixa_salarial faixa_salarial_tipo,
  
  -- Conhecimento técnico (booleans para sim/não)
  usa_rag_llm resposta_conhecimento,
  conhece_frameworks_ia resposta_conhecimento,
  ja_e_programador BOOLEAN, -- Campo duplicado do is_programmer para validação
  ja_programa_python BOOLEAN,
  usa_ml_dl BOOLEAN,
  
  -- Dados profissionais
  profissao_atual TEXT NOT NULL,
  como_conheceu canal_aquisicao NOT NULL,
  tempo_conhece tempo_relacionamento NOT NULL,
  
  -- Motivações e desafios (textos livres)
  o_que_tira_sono TEXT,
  expectativas_treinamento TEXT NOT NULL,
  sonho_realizar TEXT NOT NULL,
  maior_dificuldade TEXT NOT NULL,
  pergunta_cafe TEXT,
  impedimento_sonho TEXT,
  maior_desafio_ia TEXT,
  
  -- Comprometimento
  comprometido_projeto BOOLEAN,
  
  -- Metadados
  session_id VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  utm_source VARCHAR(100) DEFAULT 'direct',
  utm_medium VARCHAR(100) DEFAULT 'none',
  utm_campaign VARCHAR(100) DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_email UNIQUE(email),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9\s\(\)\-]{10,20}$')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pesquisa_email ON pesquisa_ai_code_pro(email);
CREATE INDEX IF NOT EXISTS idx_pesquisa_created_at ON pesquisa_ai_code_pro(created_at);
CREATE INDEX IF NOT EXISTS idx_pesquisa_session_id ON pesquisa_ai_code_pro(session_id);

-- Comentários
COMMENT ON TABLE pesquisa_ai_code_pro IS 'Pesquisa detalhada dos leads do AI Code Pro - capturada após cadastro inicial';
COMMENT ON COLUMN pesquisa_ai_code_pro.email IS 'Email do lead - chave de ligação com qualified_leads';
COMMENT ON COLUMN pesquisa_ai_code_pro.session_id IS 'ID da sessão para rastreamento';
