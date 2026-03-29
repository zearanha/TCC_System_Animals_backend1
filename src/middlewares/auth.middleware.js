const prisma = require("../database/prismaClient");
const AppError = require("../utils/AppError");

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") return null;

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token.trim();
}

async function requireAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return next(new AppError("Autenticacao obrigatoria.", 401));
    }

    const session = await prisma.sessao.findUnique({
      where: { token },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
            proprietarioId: true,
            agenteId: true,
          },
        },
      },
    });

    if (!session || session.revogadaEm || session.expiraEm <= new Date()) {
      return next(new AppError("Sessao invalida ou expirada.", 401));
    }

    if (!session.usuario?.ativo) {
      return next(new AppError("Usuario inativo.", 403));
    }

    req.auth = {
      token,
      sessionId: session.id,
      userId: session.usuario.id,
      nome: session.usuario.nome,
      email: session.usuario.email,
      perfil: session.usuario.perfil,
      proprietarioId: session.usuario.proprietarioId,
      agenteId: session.usuario.agenteId,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

function requireRoles(...allowedRoles) {
  const allowed = new Set(allowedRoles);

  return (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError("Autenticacao obrigatoria.", 401));
    }

    if (!allowed.has(req.auth.perfil)) {
      return next(new AppError("Voce nao tem permissao para acessar este recurso.", 403));
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRoles,
};
