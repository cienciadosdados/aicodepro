// Configuração do banco de dados
// Este arquivo NÃO deve ser commitado no Git

// String de conexão do Neon DB
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pMdPWN5Fy9fh@ep-soft-star-a5zvjtu7-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

module.exports = {
  databaseUrl: DATABASE_URL,
  
  // Configurações de pool de conexão
  poolConfig: {
    max: 20, // máximo de conexões no pool
    idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar inativa
    connectionTimeoutMillis: 2000, // tempo máximo para estabelecer uma conexão
  }
};
