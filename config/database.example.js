// Configuração do banco de dados usando variáveis de ambiente
// Copie este arquivo para database.js e preencha as variáveis de ambiente

// URL de conexão com o banco de dados Neon
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname';

// Configurações adicionais para o pool de conexões
const poolConfig = {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // número máximo de clientes no pool
  idleTimeoutMillis: 30000, // tempo máximo que um cliente pode ficar inativo no pool
  connectionTimeoutMillis: 2000, // tempo máximo para estabelecer uma conexão
};

// Exportar configurações
export default {
  databaseUrl,
  poolConfig,
};
