const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");

function occurrenceInclude() {
  return {
    animal: {
      include: {
        proprietario: true,
        identificacao: true,
      },
    },
    agente: true,
    notificacoes: true,
  };
}

async function createOcorrencia(payload) {
  const agente = await prisma.agente.findUnique({
    where: { id: payload.agenteId },
    select: { id: true },
  });

  if (!agente) {
    throw new AppError("Agente nao encontrado.", 404);
  }

  const identificacao = await prisma.identificacao.findUnique({
    where: { codigo: payload.codigoIdentificacao.toUpperCase() },
    select: { animalId: true },
  });

  if (!identificacao) {
    throw new AppError("Codigo de identificacao nao encontrado.", 404);
  }

  return prisma.ocorrencia.create({
    data: {
      animalId: identificacao.animalId,
      agenteId: payload.agenteId,
      local: payload.local,
      descricao: payload.descricao,
      dataOcorrencia: payload.dataOcorrencia,
      status: payload.status,
    },
    include: occurrenceInclude(),
  });
}

async function listOcorrencias() {
  return prisma.ocorrencia.findMany({
    orderBy: { dataOcorrencia: "desc" },
    include: occurrenceInclude(),
  });
}

async function getOcorrenciaById(id) {
  const ocorrencia = await prisma.ocorrencia.findUnique({
    where: { id },
    include: occurrenceInclude(),
  });

  if (!ocorrencia) {
    throw new AppError("Ocorrencia nao encontrada.", 404);
  }

  return ocorrencia;
}

module.exports = {
  createOcorrencia,
  listOcorrencias,
  getOcorrenciaById,
};
