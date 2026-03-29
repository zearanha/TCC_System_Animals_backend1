const dotenv = require("dotenv");

dotenv.config();

function toPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  authSessionTtlHours: toPositiveNumber(process.env.AUTH_SESSION_TTL_HOURS, 24),
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || "admin@municipio.local",
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "admin123456",
  defaultAdminName: process.env.DEFAULT_ADMIN_NAME || "Administrador do Sistema",
};

if (!env.databaseUrl) {
  throw new Error("Variavel DATABASE_URL nao definida.");
}

module.exports = env;
