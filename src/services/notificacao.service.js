const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");
const { logInfo, logError } = require("../config/logger");
const { USER_ROLES } = require("../constants/roles");

function notificationInclude() {
  return {
    ocorrencia: {
      include: {
        animal: {
          include: {
            identificacao: true,
          },
        },
        agente: true,
      },
    },
    proprietario: true,
  };
}

function buildDefaultMessage(ocorrencia) {
  const codigo = ocorrencia.animal.identificacao?.codigo || "SEM_CODIGO";
  const data = ocorrencia.dataOcorrencia.toISOString();
  return `Ocorrencia registrada para o animal ${ocorrencia.animal.nome} (${codigo}) em ${ocorrencia.local} na data ${data}.`;
}

function buildOccurrenceMessage(payload) {
  const codigo = payload.codigoIdentificacao || "SEM_CODIGO";
  const data = payload.dataOcorrencia.toISOString();

  return `Ocorrencia registrada para o animal ${payload.animalNome} (${codigo}) em ${payload.local} na data ${data}.`;
}

function getDeliveryTargets(proprietario) {
  const targets = [];

  if (proprietario.telefone) {
    targets.push({
      canal: "WHATSAPP",
      destino: proprietario.telefone,
    });
  }

  if (proprietario.email) {
    targets.push({
      canal: "EMAIL",
      destino: proprietario.email,
    });
  }

  return targets;
}

async function dispatchChannelNotification(target, message, context) {
  try {
    // Ponto unico para integrar provedores reais de envio no futuro.
    logInfo(
      `Notificacao enviada via ${target.canal} para ${target.destino} (ocorrencia ${context.ocorrenciaId})`
    );

    return {
      status: "ENVIADA",
      dataEnvio: new Date(),
      mensagem: message,
      canal: target.canal,
    };
  } catch (error) {
    logError(
      `Falha ao enviar notificacao via ${target.canal} para ${target.destino} (ocorrencia ${context.ocorrenciaId})`,
      {
        message: error?.message,
      }
    );

    return {
      status: "FALHA",
      dataEnvio: null,
      mensagem: message,
      canal: target.canal,
    };
  }
}

async function createAutomaticNotificationsForOccurrence(prismaClient, payload) {
  const targets = getDeliveryTargets(payload.proprietario);

  if (targets.length === 0) {
    throw new AppError(
      "Proprietario sem telefone e e-mail para notificacao.",
      400
    );
  }

  const message = buildOccurrenceMessage(payload);

  for (const target of targets) {
    const deliveryResult = await dispatchChannelNotification(target, message, {
      ocorrenciaId: payload.ocorrenciaId,
    });

    await prismaClient.notificacao.create({
      data: {
        ocorrenciaId: payload.ocorrenciaId,
        proprietarioId: payload.proprietario.id,
        mensagem: deliveryResult.mensagem,
        canal: deliveryResult.canal,
        status: deliveryResult.status,
        dataEnvio: deliveryResult.dataEnvio,
      },
    });
  }
}

async function createNotificacao(payload) {
  const ocorrencia = await prisma.ocorrencia.findUnique({
    where: { id: payload.ocorrenciaId },
    include: {
      animal: {
        include: {
          proprietario: true,
          identificacao: true,
        },
      },
    },
  });

  if (!ocorrencia) {
    throw new AppError("Ocorrencia nao encontrada.", 404);
  }

  const proprietarioId = ocorrencia.animal.proprietario.id;
  const mensagem = payload.mensagem || buildDefaultMessage(ocorrencia);

  return prisma.notificacao.create({
    data: {
      ocorrenciaId: payload.ocorrenciaId,
      proprietarioId,
      mensagem,
      canal: payload.canal,
      status: payload.status,
      dataEnvio: payload.dataEnvio,
    },
    include: notificationInclude(),
  });
}

async function listNotificacoes(scope) {
  const where = {};

  if (scope?.perfil === USER_ROLES.PROPRIETARIO) {
    if (!scope.proprietarioId) {
      throw new AppError("Usuario proprietario sem vinculo de proprietario.", 403);
    }

    where.proprietarioId = scope.proprietarioId;
  }

  return prisma.notificacao.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: notificationInclude(),
  });
}

module.exports = {
  createNotificacao,
  listNotificacoes,
  createAutomaticNotificationsForOccurrence,
};
