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

module.exports = {
  createAgente,
  listAgentes,
};
