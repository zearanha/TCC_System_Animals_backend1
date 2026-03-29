const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");
const { generateUniqueAnimalCode } = require("../utils/codeGenerator");

async function createAnimal(payload) {
  const owner = await prisma.proprietario.findUnique({
    where: { id: payload.proprietarioId },
    select: { id: true },
  });

  if (!owner) {
    throw new AppError("Proprietario informado nao encontrado.", 404);
  }

  return prisma.$transaction(async (tx) => {
    const animal = await tx.animal.create({
      data: {
        nome: payload.nome,
        especie: payload.especie,
        raca: payload.raca,
        porte: payload.porte,
        sexo: payload.sexo,
        cor: payload.cor,
        dataNascimento: payload.dataNascimento,
        proprietarioId: payload.proprietarioId,
      },
    });

    const codigo = await generateUniqueAnimalCode(tx);

    await tx.identificacao.create({
      data: {
        codigo,
        animalId: animal.id,
      },
    });

    return tx.animal.findUnique({
      where: { id: animal.id },
      include: {
        proprietario: true,
        identificacao: true,
      },
    });
  });
}

async function listAnimais() {
  return prisma.animal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      proprietario: true,
      identificacao: true,
      ocorrencias: true,
    },
  });
}

async function getAnimalById(id) {
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: {
      proprietario: true,
      identificacao: true,
      ocorrencias: {
        include: {
          agente: true,
        },
      },
    },
  });

  if (!animal) {
    throw new AppError("Animal nao encontrado.", 404);
  }

  return animal;
}

module.exports = {
  createAnimal,
  listAnimais,
  getAnimalById,
};
