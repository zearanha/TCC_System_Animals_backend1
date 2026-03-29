const asyncHandler = require("../utils/asyncHandler");
const identificacaoService = require("../services/identificacao.service");

const create = asyncHandler(async (req, res) => {
  const identificacao = await identificacaoService.createIdentificacao(req.body);
  return res.status(201).json(identificacao);
});

module.exports = {
  create,
};
