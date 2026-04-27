const dotenv = require("dotenv");

dotenv.config();

function toPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  authSessionTtlHours: toPositiveNumber(process.env.AUTH_SESSION_TTL_HOURS, 24),
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || "admin@municipio.local",
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "admin123456",
  defaultAdminName: process.env.DEFAULT_ADMIN_NAME || "Administrador do Sistema",
  notificationSimulation: toBoolean(process.env.NOTIFICATION_SIMULATION, false),
  notificationEmailEnabled: toBoolean(process.env.NOTIFICATION_EMAIL_ENABLED, true),
  notificationWhatsappEnabled: toBoolean(process.env.NOTIFICATION_WHATSAPP_ENABLED, true),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: toPositiveNumber(process.env.SMTP_PORT, 587),
  smtpSecure: toBoolean(process.env.SMTP_SECURE, false),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "",
  whatsappWebhookUrl: process.env.WHATSAPP_WEBHOOK_URL || "",
  whatsappWebhookToken: process.env.WHATSAPP_WEBHOOK_TOKEN || "",
};

if (!env.databaseUrl) {
  throw new Error("Variavel DATABASE_URL nao definida.");
}

module.exports = env;
