const asyncHandler = require("../utils/asyncHandler");
const proprietarioService = require("../services/proprietario.service");

const create = asyncHandler(async (req, res) => {
  const proprietario = await proprietarioService.createProprietario(req.body);
  return res.status(201).json(proprietario);
});

const list = asyncHandler(async (_req, res) => {
  const proprietarios = await proprietarioService.listProprietarios();
  return res.status(200).json(proprietarios);
});

const getById = asyncHandler(async (req, res) => {
  const proprietario = await proprietarioService.getProprietarioById(req.params.id);
  return res.status(200).json(proprietario);
});

const update = asyncHandler(async (req, res) => {
  const proprietario = await proprietarioService.updateProprietario(
    req.params.id,
    req.body
  );
  return res.status(200).json(proprietario);
});

const remove = asyncHandler(async (req, res) => {
  await proprietarioService.deleteProprietario(req.params.id);
  return res.status(204).send();
});

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
};
