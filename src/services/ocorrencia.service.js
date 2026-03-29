const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");
const { USER_ROLES } = require("../constants/roles");
const {
  createAutomaticNotificationsForOccurrence,
} = require("./notificacao.service");

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

function applyScopeToOccurrenceWhere(where, scope) {
  if (scope?.perfil === USER_ROLES.AGENTE) {
    if (!scope.agenteId) {
      throw new AppError("Usuario agente sem vinculo de agente.", 403);
    }

    where.agenteId = scope.agenteId;
  }
}

function resolveAgenteId(payload, scope) {
  if (scope?.perfil === USER_ROLES.AGENTE) {
    if (!scope.agenteId) {
      throw new AppError("Usuario agente sem vinculo de agente.", 403);
    }

    if (payload.agenteId && payload.agenteId !== scope.agenteId) {
      throw new AppError("Agente nao pode registrar ocorrencia para outro agente.", 403);
    }

    return scope.agenteId;
  }

  if (!payload.agenteId) {
    throw new AppError("agenteId e obrigatorio para registrar ocorrencia.", 400);
  }

  return payload.agenteId;
}

async function createOcorrencia(payload, scope) {
  const agenteId = resolveAgenteId(payload, scope);

  const agente = await prisma.agente.findUnique({
    where: { id: agenteId },
    select: { id: true },
  });

  if (!agente) {
    throw new AppError("Agente nao encontrado.", 404);
  }

  const identificacao = await prisma.identificacao.findUnique({
    where: { codigo: payload.codigoIdentificacao.toUpperCase() },
    include: {
      animal: {
        select: {
          id: true,
          nome: true,
          proprietario: {
            select: {
              id: true,
              nome: true,
              telefone: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!identificacao) {
    throw new AppError("Codigo de identificacao nao encontrado.", 404);
  }

  if (!identificacao.animal?.proprietario) {
    throw new AppError("Proprietario do animal nao encontrado.", 404);
  }

  return prisma.$transaction(async (tx) => {
    const ocorrencia = await tx.ocorrencia.create({
      data: {
        animalId: identificacao.animal.id,
        agenteId,
        local: payload.local,
        descricao: payload.descricao,
        dataOcorrencia: payload.dataOcorrencia,
        status: payload.status,
      },
    });

    await createAutomaticNotificationsForOccurrence(tx, {
      ocorrenciaId: ocorrencia.id,
      proprietario: identificacao.animal.proprietario,
      animalNome: identificacao.animal.nome,
      codigoIdentificacao: payload.codigoIdentificacao.toUpperCase(),
      local: payload.local,
      dataOcorrencia: ocorrencia.dataOcorrencia,
    });

    return tx.ocorrencia.findUnique({
      where: { id: ocorrencia.id },
      include: occurrenceInclude(),
    });
  });
}

async function listOcorrencias(scope) {
  const where = {};
  applyScopeToOccurrenceWhere(where, scope);

  return prisma.ocorrencia.findMany({
    where,
    orderBy: { dataOcorrencia: "desc" },
    include: occurrenceInclude(),
  });
}

async function getOcorrenciaById(id, scope) {
  const where = { id };
  applyScopeToOccurrenceWhere(where, scope);

  const ocorrencia = await prisma.ocorrencia.findFirst({
    where,
    include: occurrenceInclude(),
  });

  if (!ocorrencia) {
    throw new AppError("Ocorrencia nao encontrada.", 404);
  }

  return ocorrencia;
}

async function updateOcorrenciaStatus(id, status, scope) {
  const ocorrencia = await getOcorrenciaById(id, scope);

  if (scope?.perfil === USER_ROLES.AGENTE && status !== "RESOLVIDA") {
    throw new AppError("Agente pode apenas concluir ocorrencias (status RESOLVIDA).", 403);
  }

  return prisma.ocorrencia.update({
    where: { id: ocorrencia.id },
    data: { status },
    include: occurrenceInclude(),
  });
}

async function deleteOcorrencia(id) {
  const existing = await prisma.ocorrencia.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Ocorrencia nao encontrada.", 404);
  }

  await prisma.ocorrencia.delete({
    where: { id },
  });
}

module.exports = {
  createOcorrencia,
  listOcorrencias,
  getOcorrenciaById,
  updateOcorrenciaStatus,
  deleteOcorrencia,
};
