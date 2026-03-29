const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");
const { generateUniqueAnimalCode } = require("../utils/codeGenerator");
const { USER_ROLES } = require("../constants/roles");

function animalInclude() {
  return {
    proprietario: true,
    identificacao: true,
    ocorrencias: true,
  };
}

function assertProprietarioCanAccessAnimal(scope, animal) {
  if (scope?.perfil !== USER_ROLES.PROPRIETARIO) return;

  if (!scope.proprietarioId || animal.proprietarioId !== scope.proprietarioId) {
    throw new AppError("Voce nao tem permissao para acessar este animal.", 403);
  }
}

async function createAnimal(payload) {
  const owner = await prisma.proprietario.findUnique({
    where: { id: payload.proprietarioId },
    select: { id: true, nome: true },
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

    const codigo = await generateUniqueAnimalCode(tx, owner.nome);

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

async function listAnimais(scope) {
  const where = {};

  if (scope?.perfil === USER_ROLES.PROPRIETARIO) {
    if (!scope.proprietarioId) {
      throw new AppError("Usuario proprietario sem vinculo de proprietario.", 403);
    }
    where.proprietarioId = scope.proprietarioId;
  }

  return prisma.animal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: animalInclude(),
  });
}

async function getAnimalById(id, scope) {
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: animalInclude(),
  });

  if (!animal) {
    throw new AppError("Animal nao encontrado.", 404);
  }

  assertProprietarioCanAccessAnimal(scope, animal);

  return animal;
}

async function getAnimalByCodigo(codigo, scope) {
  const normalizedCode = String(codigo ?? "").trim().toUpperCase();

  const animal = await prisma.animal.findFirst({
    where: {
      identificacao: {
        codigo: normalizedCode,
      },
    },
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
    throw new AppError("Codigo de identificacao nao encontrado.", 404);
  }

  assertProprietarioCanAccessAnimal(scope, animal);

  return animal;
}

async function updateAnimal(id, payload) {
  const existingAnimal = await prisma.animal.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingAnimal) {
    throw new AppError("Animal nao encontrado.", 404);
  }

  if (payload.proprietarioId !== undefined) {
    const owner = await prisma.proprietario.findUnique({
      where: { id: payload.proprietarioId },
      select: { id: true },
    });

    if (!owner) {
      throw new AppError("Proprietario informado nao encontrado.", 404);
    }
  }

  const data = {};

  if (payload.nome !== undefined) data.nome = payload.nome;
  if (payload.especie !== undefined) data.especie = payload.especie;
  if (payload.raca !== undefined) data.raca = payload.raca;
  if (payload.porte !== undefined) data.porte = payload.porte;
  if (payload.sexo !== undefined) data.sexo = payload.sexo;
  if (payload.cor !== undefined) data.cor = payload.cor;
  if (payload.dataNascimento !== undefined) data.dataNascimento = payload.dataNascimento;
  if (payload.proprietarioId !== undefined) data.proprietarioId = payload.proprietarioId;

  return prisma.animal.update({
    where: { id },
    data,
    include: {
      proprietario: true,
      identificacao: true,
      ocorrencias: true,
    },
  });
}

async function deleteAnimal(id) {
  const existingAnimal = await prisma.animal.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingAnimal) {
    throw new AppError("Animal nao encontrado.", 404);
  }

  const occurrencesCount = await prisma.ocorrencia.count({
    where: { animalId: id },
  });

  if (occurrencesCount > 0) {
    throw new AppError("Nao e possivel remover animal com ocorrencias vinculadas.", 409);
  }

  await prisma.animal.delete({
    where: { id },
  });
}

module.exports = {
  createAnimal,
  listAnimais,
  getAnimalById,
  getAnimalByCodigo,
  updateAnimal,
  deleteAnimal,
};
