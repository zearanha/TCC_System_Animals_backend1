const asyncHandler = require("../utils/asyncHandler");
const notificacaoService = require("../services/notificacao.service");

const create = asyncHandler(async (req, res) => {
  const notificacao = await notificacaoService.createNotificacao(req.body);
  return res.status(201).json(notificacao);
});

const list = asyncHandler(async (req, res) => {
  const notificacoes = await notificacaoService.listNotificacoes(req.auth);
  return res.status(200).json(notificacoes);
});

module.exports = {
  create,
  list,
};
