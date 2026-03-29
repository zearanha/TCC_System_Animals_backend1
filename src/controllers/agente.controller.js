const asyncHandler = require("../utils/asyncHandler");
const agenteService = require("../services/agente.service");

const create = asyncHandler(async (req, res) => {
  const agente = await agenteService.createAgente(req.body);
  return res.status(201).json(agente);
});

const list = asyncHandler(async (_req, res) => {
  const agentes = await agenteService.listAgentes();
  return res.status(200).json(agentes);
});

module.exports = {
  create,
  list,
};
