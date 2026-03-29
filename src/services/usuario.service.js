const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");
const { USER_ROLES } = require("../constants/roles");
const { hashPassword } = require("../utils/security");
const { normalizeEmail, buildPublicUser } = require("./auth.service");

function normalizeOptionalUuid(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function validateRoleBindings(perfil, agenteId, proprietarioId) {
  if (perfil === USER_ROLES.ADMIN) {
    if (agenteId || proprietarioId) {
      throw new AppError("Usuario ADMIN nao pode ter vinculo com agente ou proprietario.", 400);
    }
    return;
  }

  if (perfil === USER_ROLES.AGENTE) {
    if (!agenteId) {
      throw new AppError("Usuario AGENTE deve ser vinculado a um agente.", 400);
    }

    if (proprietarioId) {
      throw new AppError("Usuario AGENTE nao pode ser vinculado a proprietario.", 400);
    }

    return;
  }

  if (perfil === USER_ROLES.PROPRIETARIO) {
    if (!proprietarioId) {
      throw new AppError("Usuario PROPRIETARIO deve ser vinculado a um proprietario.", 400);
    }

    if (agenteId) {
      throw new AppError("Usuario PROPRIETARIO nao pode ser vinculado a agente.", 400);
    }
  }
}

async function ensureAgenteExists(prismaClient, agenteId) {
  if (!agenteId) return;

  const agente = await prismaClient.agente.findUnique({
    where: { id: agenteId },
    select: { id: true },
  });

  if (!agente) {
    throw new AppError("Agente vinculado nao encontrado.", 404);
  }
}

async function ensureProprietarioExists(prismaClient, proprietarioId) {
  if (!proprietarioId) return;

  const proprietario = await prismaClient.proprietario.findUnique({
    where: { id: proprietarioId },
    select: { id: true },
  });

  if (!proprietario) {
    throw new AppError("Proprietario vinculado nao encontrado.", 404);
  }
}

async function ensureLinkAvailability(prismaClient, agenteId, proprietarioId, currentUserId = null) {
  if (agenteId) {
    const existingAgentLink = await prismaClient.usuario.findFirst({
      where: {
        agenteId,
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
      },
      select: { id: true },
    });

    if (existingAgentLink) {
      throw new AppError("Este agente ja esta vinculado a outro usuario.", 409);
    }
  }

  if (proprietarioId) {
    const existingOwnerLink = await prismaClient.usuario.findFirst({
      where: {
        proprietarioId,
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
      },
      select: { id: true },
    });

    if (existingOwnerLink) {
      throw new AppError("Este proprietario ja esta vinculado a outro usuario.", 409);
    }
  }
}

function includeUsuarioRelations() {
  return {
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
  };
}

async function listUsuarios() {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: "desc" },
    include: includeUsuarioRelations(),
  });

  return usuarios.map(buildPublicUser);
}

async function createUsuario(payload) {
  const email = normalizeEmail(payload.email);

  if (!email) {
    throw new AppError("E-mail e obrigatorio.", 400);
  }

  const agenteId = normalizeOptionalUuid(payload.agenteId);
  const proprietarioId = normalizeOptionalUuid(payload.proprietarioId);

  validateRoleBindings(payload.perfil, agenteId, proprietarioId);

  return prisma.$transaction(async (tx) => {
    const existingEmail = await tx.usuario.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      throw new AppError("Ja existe usuario com este e-mail.", 409);
    }

    await ensureAgenteExists(tx, agenteId);
    await ensureProprietarioExists(tx, proprietarioId);
    await ensureLinkAvailability(tx, agenteId, proprietarioId);

    const usuario = await tx.usuario.create({
      data: {
        nome: payload.nome.trim(),
        email,
        senhaHash: hashPassword(payload.senha),
        perfil: payload.perfil,
        ativo: payload.ativo ?? true,
        agenteId,
        proprietarioId,
      },
      include: includeUsuarioRelations(),
    });

    return buildPublicUser(usuario);
  });
}

async function updateUsuario(id, payload) {
  const existing = await prisma.usuario.findUnique({
    where: { id },
    include: includeUsuarioRelations(),
  });

  if (!existing) {
    throw new AppError("Usuario nao encontrado.", 404);
  }

  const nextPerfil = payload.perfil ?? existing.perfil;
  const nextAgenteId =
    payload.agenteId !== undefined
      ? normalizeOptionalUuid(payload.agenteId)
      : existing.agenteId;
  const nextProprietarioId =
    payload.proprietarioId !== undefined
      ? normalizeOptionalUuid(payload.proprietarioId)
      : existing.proprietarioId;

  validateRoleBindings(nextPerfil, nextAgenteId, nextProprietarioId);

  return prisma.$transaction(async (tx) => {
    const data = {};

    if (payload.nome !== undefined) data.nome = payload.nome.trim();

    if (payload.email !== undefined) {
      const email = normalizeEmail(payload.email);
      if (!email) {
        throw new AppError("E-mail e obrigatorio.", 400);
      }

      if (email !== existing.email) {
        const anotherEmail = await tx.usuario.findUnique({
          where: { email },
          select: { id: true },
        });

        if (anotherEmail) {
          throw new AppError("Ja existe usuario com este e-mail.", 409);
        }
      }

      data.email = email;
    }

    if (payload.senha !== undefined) {
      data.senhaHash = hashPassword(payload.senha);
    }

    if (payload.ativo !== undefined) data.ativo = payload.ativo;
    if (payload.perfil !== undefined) data.perfil = payload.perfil;
    if (payload.agenteId !== undefined) data.agenteId = nextAgenteId;
    if (payload.proprietarioId !== undefined) data.proprietarioId = nextProprietarioId;

    await ensureAgenteExists(tx, nextAgenteId);
    await ensureProprietarioExists(tx, nextProprietarioId);
    await ensureLinkAvailability(tx, nextAgenteId, nextProprietarioId, id);

    const usuario = await tx.usuario.update({
      where: { id },
      data,
      include: includeUsuarioRelations(),
    });

    return buildPublicUser(usuario);
  });
}

async function deleteUsuario(id, requesterId) {
  if (id === requesterId) {
    throw new AppError("Nao e permitido excluir o proprio usuario logado.", 409);
  }

  const existing = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Usuario nao encontrado.", 404);
  }

  await prisma.usuario.delete({
    where: { id },
  });
}

module.exports = {
  listUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
