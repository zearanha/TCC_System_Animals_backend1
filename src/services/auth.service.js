const prisma = require("../database/prismaClient");
const env = require("../config/env");
const { logInfo } = require("../config/logger");
const AppError = require("../utils/AppError");
const { hashPassword, verifyPassword, generateSessionToken } = require("../utils/security");
const { isValidCPF, normalizeCPF } = require("../utils/cpf");
const { USER_ROLES } = require("../constants/roles");

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function buildPublicUser(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    ativo: usuario.ativo,
    createdAt: usuario.createdAt ?? null,
    updatedAt: usuario.updatedAt ?? null,
    proprietarioId: usuario.proprietarioId ?? null,
    agenteId: usuario.agenteId ?? null,
    proprietario: usuario.proprietario
      ? {
          id: usuario.proprietario.id,
          nome: usuario.proprietario.nome,
        }
      : null,
    agente: usuario.agente
      ? {
          id: usuario.agente.id,
          nome: usuario.agente.nome,
          matricula: usuario.agente.matricula,
        }
      : null,
  };
}

async function createSessionForUser(prismaClient, usuarioId) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + env.authSessionTtlHours * 60 * 60 * 1000);

  await prismaClient.sessao.create({
    data: {
      token,
      usuarioId,
      expiraEm: expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

async function getUsuarioWithRelationsById(id) {
  return prisma.usuario.findUnique({
    where: { id },
    include: {
      proprietario: {
        select: {
          id: true,
          nome: true,
        },
      },
      agente: {
        select: {
          id: true,
          nome: true,
          matricula: true,
        },
      },
    },
  });
}

async function login(payload) {
  const email = normalizeEmail(payload.email);

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: {
      proprietario: {
        select: {
          id: true,
          nome: true,
        },
      },
      agente: {
        select: {
          id: true,
          nome: true,
          matricula: true,
        },
      },
    },
  });

  if (!usuario || !verifyPassword(payload.senha, usuario.senhaHash)) {
    throw new AppError("Email ou senha invalidos.", 401);
  }

  if (!usuario.ativo) {
    throw new AppError("Usuario inativo.", 403);
  }

  const session = await createSessionForUser(prisma, usuario.id);

  return {
    token: session.token,
    expiresAt: session.expiresAt.toISOString(),
    user: buildPublicUser(usuario),
  };
}

async function registerProprietario(payload) {
  const cpf = normalizeCPF(payload.cpf);
  if (!isValidCPF(cpf)) {
    throw new AppError("CPF invalido.", 400);
  }

  const email = normalizeEmail(payload.email);
  if (!email) {
    throw new AppError("E-mail e obrigatorio.", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.usuario.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError("Ja existe uma conta com este e-mail.", 409);
    }

    const existingOwner = await tx.proprietario.findUnique({
      where: { cpf },
      select: { id: true },
    });

    if (existingOwner) {
      throw new AppError("CPF ja cadastrado.", 409);
    }

    const proprietario = await tx.proprietario.create({
      data: {
        nome: payload.nome,
        cpf,
        telefone: payload.telefone,
        email,
        endereco: payload.endereco,
      },
    });

    const usuario = await tx.usuario.create({
      data: {
        nome: payload.nome,
        email,
        senhaHash: hashPassword(payload.senha),
        perfil: USER_ROLES.PROPRIETARIO,
        proprietarioId: proprietario.id,
      },
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
          },
        },
        agente: {
          select: {
            id: true,
            nome: true,
            matricula: true,
          },
        },
      },
    });

    const session = await createSessionForUser(tx, usuario.id);

    return {
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      user: buildPublicUser(usuario),
    };
  });

  return result;
}

async function getCurrentUser(userId) {
  const usuario = await getUsuarioWithRelationsById(userId);

  if (!usuario) {
    throw new AppError("Usuario nao encontrado.", 404);
  }

  return buildPublicUser(usuario);
}

async function logout(token) {
  await prisma.sessao.updateMany({
    where: {
      token,
      revogadaEm: null,
    },
    data: {
      revogadaEm: new Date(),
    },
  });
}

async function ensureDefaultAdminUser() {
  const email = normalizeEmail(env.defaultAdminEmail);
  if (!email) return;

  const existing = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) return;

  await prisma.usuario.create({
    data: {
      nome: env.defaultAdminName,
      email,
      senhaHash: hashPassword(env.defaultAdminPassword),
      perfil: USER_ROLES.ADMIN,
    },
  });

  logInfo(
    `Usuario admin padrao criado (${email}). Altere a senha inicial apos o primeiro acesso.`
  );
}

module.exports = {
  login,
  registerProprietario,
  getCurrentUser,
  logout,
  ensureDefaultAdminUser,
  normalizeEmail,
  buildPublicUser,
};
