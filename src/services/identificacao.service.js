const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");
const { generateUniqueAnimalCode } = require("../utils/codeGenerator");

async function createIdentificacao(payload) {
  const animal = await prisma.animal.findUnique({
    where: { id: payload.animalId },
    include: {
      identificacao: true,
      proprietario: {
        select: {
          nome: true,
        },
      },
    },
  });

  if (!animal) {
    throw new AppError("Animal nao encontrado.", 404);
  }

  if (animal.identificacao) {
    throw new AppError("Este animal ja possui identificacao.", 409);
  }

  const codigo = await generateUniqueAnimalCode(prisma, animal.proprietario?.nome);

  return prisma.identificacao.create({
    data: {
      codigo,
      animalId: payload.animalId,
    },
    include: {
      imagens: true,
      animal: {
        include: {
          proprietario: true,
        },
      },
    },
  });
}

module.exports = {
  createIdentificacao,
};
