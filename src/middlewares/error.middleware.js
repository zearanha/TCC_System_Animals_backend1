const { logError } = require("../config/logger");
const AppError = require("../utils/AppError");

function errorMiddleware(error, _req, res, _next) {
  if (error?.name === "ZodValidationError") {
    return res.status(error.statusCode || 400).json({
      error: "Erro de validacao",
      details: error.errors,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  if (error?.code === "P2002") {
    return res.status(409).json({
      error: "Registro duplicado para campo unico.",
      target: error.meta?.target || [],
    });
  }

  if (error?.code === "P2025") {
    return res.status(404).json({
      error: "Registro nao encontrado.",
    });
  }

  logError("Erro nao tratado", {
    message: error?.message,
    stack: error?.stack,
  });

  return res.status(500).json({
    error: "Erro interno do servidor.",
  });
}

module.exports = errorMiddleware;
