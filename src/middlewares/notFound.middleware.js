function notFoundMiddleware(req, res) {
  return res.status(404).json({
    error: "Rota nao encontrada",
    path: req.originalUrl,
  });
}

module.exports = notFoundMiddleware;
