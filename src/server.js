const app = require("./app");
const env = require("./config/env");
const prisma = require("./database/prismaClient");
const { logError, logInfo } = require("./config/logger");
const { ensureDefaultAdminUser } = require("./services/auth.service");

let server;

async function startServer() {
  try {
    await ensureDefaultAdminUser();

    server = app.listen(env.port, () => {
      logInfo(`API executando na porta ${env.port}`);
    });
  } catch (error) {
    logError("Falha ao iniciar a API.", {
      message: error?.message,
      stack: error?.stack,
    });
    process.exit(1);
  }
}

async function shutdown(signal) {
  logInfo(`Sinal ${signal} recebido. Encerrando aplicacao...`);

  if (!server) {
    await prisma.$disconnect();
    process.exit(0);
  }

  server.close(async () => {
    try {
      await prisma.$disconnect();
      logInfo("Conexao com banco encerrada.");
      process.exit(0);
    } catch (error) {
      logError("Erro ao encerrar Prisma", error);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

void startServer();
