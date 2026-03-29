const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");

async function createAgente(payload) {
  const matricula = payload.matricula.trim().toUpperCase();

  const existing = await prisma.agente.findUnique({
    where: { matricula },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("Matricula ja cadastrada para outro agente.", 409);
  }

  return prisma.agente.create({
    data: {
      nome: payload.nome,
      matricula,
      telefone: payload.telefone,
      email: payload.email,
    },
  });
}

async function listAgentes() {
  return prisma.agente.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ocorrencias: true,
    },
  });
}

async function updateAgente(id, payload) {
  const existing = await prisma.agente.findUnique({
    where: { id },
    select: { id: true, matricula: true },
  });

  if (!existing) {
    throw new AppError("Agente nao encontrado.", 404);
  }

  const data = {};

  if (payload.nome !== undefined) data.nome = payload.nome;
  if (payload.telefone !== undefined) data.telefone = payload.telefone;
  if (payload.email !== undefined) data.email = payload.email;

  if (payload.matricula !== undefined) {
    const normalizedMatricula = payload.matricula.trim().toUpperCase();

    if (normalizedMatricula !== existing.matricula) {
      const anotherAgent = await prisma.agente.findUnique({
        where: { matricula: normalizedMatricula },
        select: { id: true },
      });

      if (anotherAgent) {
        throw new AppError("Matricula ja cadastrada para outro agente.", 409);
      }
    }

    data.matricula = normalizedMatricula;
  }

  return prisma.agente.update({
    where: { id },
    data,
  });
}

async function deleteAgente(id) {
  const existing = await prisma.agente.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Agente nao encontrado.", 404);
  }

  const ocorrenciasCount = await prisma.ocorrencia.count({
    where: { agenteId: id },
  });

  if (ocorrenciasCount > 0) {
    throw new AppError("Nao e possivel remover agente com ocorrencias vinculadas.", 409);
  }

  await prisma.agente.delete({
    where: { id },
  });
}

module.exports = {
  createAgente,
  listAgentes,
  updateAgente,
  deleteAgente,
};
