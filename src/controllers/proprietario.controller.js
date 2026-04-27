const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
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
  const hasPayload = Object.keys(req.body ?? {}).length > 0;
  if (!hasPayload && !req.file) {
    throw new AppError("Envie ao menos um campo ou uma foto para atualizacao.", 400);
  }

  const proprietario = await proprietarioService.updateProprietario(
    req.params.id,
    req.body,
    req.file
  );
  return res.status(200).json(proprietario);
});

const uploadFotoPerfil = asyncHandler(async (req, res) => {
  const proprietario = await proprietarioService.updateFotoPerfilProprietario(
    req.params.id,
    req.file
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
  uploadFotoPerfil,
  remove,
};
