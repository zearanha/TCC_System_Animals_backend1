const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");

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

async function listNotificacoes() {
  return prisma.notificacao.findMany({
    orderBy: { createdAt: "desc" },
    include: notificationInclude(),
  });
}

module.exports = {
  createNotificacao,
  listNotificacoes,
};
