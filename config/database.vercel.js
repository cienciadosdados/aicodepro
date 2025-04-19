// Configuração do banco de dados para ambiente Vercel
// Este arquivo é usado no ambiente de produção e usa variáveis de ambiente

// URL de conexão com o banco de dados Neon
const databaseUrl = process.env.DATABASE_URL;

// Configurações adicionais para o pool de conexões
const poolConfig = {
  ssl: { rejectUnauthorized: false },
  max: 20, // número máximo de clientes no pool
  idleTimeoutMillis: 30000, // tempo máximo que um cliente pode ficar inativo no pool
  connectionTimeoutMillis: 2000, // tempo máximo para estabelecer uma conexão
};

// Exportar configurações
export default {
  databaseUrl,
  poolConfig,
};
