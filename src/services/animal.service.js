const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");
const { generateUniqueAnimalCode } = require("../utils/codeGenerator");
const { USER_ROLES } = require("../constants/roles");
const { removeUploadByUrl, toPublicUploadUrl } = require("../utils/uploads");

function animalInclude() {
  return {
    proprietario: true,
    identificacao: {
      include: {
        imagens: {
          orderBy: { createdAt: "desc" },
        },
      },
    },
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
        identificacao: {
          include: {
            imagens: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
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
      identificacao: {
        include: {
          imagens: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
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
      identificacao: {
        include: {
          imagens: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      ocorrencias: true,
    },
  });
}

async function uploadAnimalIdentificacaoImagens(id, files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new AppError("Envie ao menos uma imagem de identificacao.", 400);
  }

  const animal = await prisma.animal.findUnique({
    where: { id },
    select: {
      id: true,
      identificacao: {
        select: { id: true },
      },
    },
  });

  if (!animal) {
    throw new AppError("Animal nao encontrado.", 404);
  }

  if (!animal.identificacao) {
    throw new AppError("Animal sem identificacao vinculada.", 409);
  }

  await prisma.$transaction(
    files.map((file) =>
      prisma.identificacaoImagem.create({
        data: {
          identificacaoId: animal.identificacao.id,
          imagemUrl: toPublicUploadUrl(file.path),
        },
      })
    )
  );

  return prisma.animal.findUnique({
    where: { id },
    include: animalInclude(),
  });
}

async function deleteAnimalIdentificacaoImagem(id, imagemId) {
  const animal = await prisma.animal.findUnique({
    where: { id },
    select: {
      id: true,
      identificacao: {
        select: { id: true },
      },
    },
  });

  if (!animal) {
    throw new AppError("Animal nao encontrado.", 404);
  }

  if (!animal.identificacao) {
    throw new AppError("Animal sem identificacao vinculada.", 409);
  }

  const imagem = await prisma.identificacaoImagem.findUnique({
    where: { id: imagemId },
    select: {
      id: true,
      identificacaoId: true,
      imagemUrl: true,
    },
  });

  if (!imagem || imagem.identificacaoId !== animal.identificacao.id) {
    throw new AppError("Imagem de identificacao nao encontrada para este animal.", 404);
  }

  await prisma.identificacaoImagem.delete({
    where: { id: imagemId },
  });

  await removeUploadByUrl(imagem.imagemUrl);

  return prisma.animal.findUnique({
    where: { id },
    include: animalInclude(),
  });
}

async function deleteAnimal(id) {
  const existingAnimal = await prisma.animal.findUnique({
    where: { id },
    select: {
      id: true,
      identificacao: {
        select: {
          imagens: {
            select: {
              imagemUrl: true,
            },
          },
        },
      },
    },
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

  const imagens = existingAnimal.identificacao?.imagens ?? [];
  for (const imagem of imagens) {
    await removeUploadByUrl(imagem.imagemUrl);
  }
}

module.exports = {
  createAnimal,
  listAnimais,
  getAnimalById,
  getAnimalByCodigo,
  updateAnimal,
  uploadAnimalIdentificacaoImagens,
  deleteAnimalIdentificacaoImagem,
  deleteAnimal,
};
