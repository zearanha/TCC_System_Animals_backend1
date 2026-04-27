const nodemailer = require("nodemailer");
const env = require("../config/env");
const { logInfo } = require("../config/logger");

let smtpTransporter = null;

function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFrom) {
    throw new Error(
      "SMTP nao configurado. Defina SMTP_HOST, SMTP_USER, SMTP_PASS e SMTP_FROM."
    );
  }

  smtpTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return smtpTransporter;
}

async function sendEmailNotification(target, message, context) {
  if (!env.notificationEmailEnabled) {
    throw new Error("Canal EMAIL desativado por configuracao.");
  }

  const transporter = getSmtpTransporter();

  await transporter.sendMail({
    from: env.smtpFrom,
    to: target.destino,
    subject: `Sistema de Monitoramento Animal - Ocorrencia ${context.ocorrenciaId}`,
    text: message,
  });
}

async function sendWhatsappNotification(target, message, context) {
  if (!env.notificationWhatsappEnabled) {
    throw new Error("Canal WHATSAPP desativado por configuracao.");
  }

  if (!env.whatsappWebhookUrl) {
    throw new Error("WHATSAPP_WEBHOOK_URL nao configurada.");
  }

  const normalizedPhone = normalizePhone(target.destino);
  if (!normalizedPhone) {
    throw new Error("Telefone de destino invalido para notificacao por WHATSAPP.");
  }

  const response = await fetch(env.whatsappWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.whatsappWebhookToken
        ? { Authorization: `Bearer ${env.whatsappWebhookToken}` }
        : {}),
    },
    body: JSON.stringify({
      to: normalizedPhone,
      message,
      context: {
        ocorrenciaId: context.ocorrenciaId,
        canal: target.canal,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Falha no webhook do WHATSAPP (status ${response.status}): ${details || "sem detalhes"}`
    );
  }
}

async function dispatchChannelNotification(target, message, context) {
  if (env.notificationSimulation) {
    logInfo(
      `[SIMULACAO] Notificacao enviada via ${target.canal} para ${target.destino} (ocorrencia ${context.ocorrenciaId})`
    );
    return;
  }

  if (target.canal === "EMAIL") {
    await sendEmailNotification(target, message, context);
    return;
  }

  if (target.canal === "WHATSAPP") {
    await sendWhatsappNotification(target, message, context);
    return;
  }

  throw new Error(`Canal de notificacao nao suportado: ${target.canal}`);
}

module.exports = {
  dispatchChannelNotification,
};
