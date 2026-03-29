const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");
const { isValidCPF, normalizeCPF } = require("../utils/cpf");

async function createProprietario(payload) {
  const cpf = normalizeCPF(payload.cpf);

  if (!isValidCPF(cpf)) {
    throw new AppError("CPF invalido.", 400);
  }

  const existing = await prisma.proprietario.findUnique({
    where: { cpf },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("CPF ja cadastrado.", 409);
  }

  const proprietario = await prisma.proprietario.create({
    data: {
      nome: payload.nome,
      cpf,
      telefone: payload.telefone,
      email: payload.email,
      endereco: payload.endereco,
    },
  });

  return proprietario;
}

async function listProprietarios() {
  return prisma.proprietario.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      animais: {
        include: {
          identificacao: true,
        },
      },
    },
  });
}

async function getProprietarioById(id) {
  const proprietario = await prisma.proprietario.findUnique({
    where: { id },
    include: {
      animais: {
        include: {
          identificacao: true,
        },
      },
      notificacoes: true,
    },
  });

  if (!proprietario) {
    throw new AppError("Proprietario nao encontrado.", 404);
  }

  return proprietario;
}

async function updateProprietario(id, payload) {
  const existing = await prisma.proprietario.findUnique({
    where: { id },
    select: { id: true, cpf: true },
  });

  if (!existing) {
    throw new AppError("Proprietario nao encontrado.", 404);
  }

  const data = {};

  if (payload.nome !== undefined) data.nome = payload.nome;
  if (payload.telefone !== undefined) data.telefone = payload.telefone;
  if (payload.email !== undefined) data.email = payload.email;
  if (payload.endereco !== undefined) data.endereco = payload.endereco;

  if (payload.cpf !== undefined) {
    const normalizedCPF = normalizeCPF(payload.cpf);
    if (!isValidCPF(normalizedCPF)) {
      throw new AppError("CPF invalido.", 400);
    }

    if (normalizedCPF !== existing.cpf) {
      const anotherOwner = await prisma.proprietario.findUnique({
        where: { cpf: normalizedCPF },
        select: { id: true },
      });

      if (anotherOwner) {
        throw new AppError("CPF ja cadastrado.", 409);
      }
    }

    data.cpf = normalizedCPF;
  }

  return prisma.proprietario.update({
    where: { id },
    data,
  });
}

async function deleteProprietario(id) {
  const existing = await prisma.proprietario.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Proprietario nao encontrado.", 404);
  }

  const animalsCount = await prisma.animal.count({
    where: { proprietarioId: id },
  });

  if (animalsCount > 0) {
    throw new AppError(
      "Nao e possivel remover proprietario com animais vinculados.",
      409
    );
  }

  const hasUser = await prisma.usuario.findFirst({
    where: { proprietarioId: id },
    select: { id: true },
  });

  if (hasUser) {
    throw new AppError(
      "Nao e possivel remover proprietario com usuario vinculado.",
      409
    );
  }

  await prisma.proprietario.delete({
    where: { id },
  });
}

module.exports = {
  createProprietario,
  listProprietarios,
  getProprietarioById,
  updateProprietario,
  deleteProprietario,
};
