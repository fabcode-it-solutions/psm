import { PoolConfig } from "pg";

export const getPoolConfig = (): PoolConfig => {
  const env = process.env.NODE_ENV;
  const isProd = env === "production";
  const isTest = env === "test";

  if (isTest) {
    return {
      connectionString: process.env.DATABASE_URL,
      max: 1,
      min: 0,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 3000,
      ssl: false,
      application_name: "test-env",
    };
  }

  if (isProd) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
      min: 0,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      query_timeout: 15000,
      statement_timeout: 15000,
      idle_in_transaction_session_timeout: 15000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      application_name: "prod-env",
    };
  }

  // Development
  return {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
    min: 0,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 3000,
    query_timeout: 30000,
    statement_timeout: 30000,
    keepAlive: false,
    application_name: "dev-env",
  };
};
