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

const update = asyncHandler(async (req, res) => {
  const agente = await agenteService.updateAgente(req.params.id, req.body);
  return res.status(200).json(agente);
});

const remove = asyncHandler(async (req, res) => {
  await agenteService.deleteAgente(req.params.id);
  return res.status(204).send();
});

module.exports = {
  create,
  list,
  update,
  remove,
};
