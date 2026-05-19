// knex CLI config — prod migrations against SQL Server.
// Dev/demo runtime uses the in-memory store (DATA_PROVIDER=memory) and does
// not need this. Run: npm run migrate  (DATA_PROVIDER=sqlserver + creds set).
import type { Knex } from "knex";
import { config } from "./src/config.js";

const knexConfig: Knex.Config = {
  client: "mssql",
  connection: {
    server: config.SQLSERVER_HOST,
    port: config.SQLSERVER_PORT,
    database: config.SQLSERVER_DATABASE,
    user: config.SQLSERVER_USER,
    password: config.SQLSERVER_PASSWORD,
    options: {
      encrypt: config.SQLSERVER_ENCRYPT,
      trustServerCertificate: config.SQLSERVER_TRUST_SERVER_CERT,
    },
  },
  migrations: {
    directory: "./src/crm/migrations",
    extension: "ts",
  },
};

export default knexConfig;
