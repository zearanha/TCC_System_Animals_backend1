const asyncHandler = require("../utils/asyncHandler");
const usuarioService = require("../services/usuario.service");

const list = asyncHandler(async (_req, res) => {
  const usuarios = await usuarioService.listUsuarios();
  return res.status(200).json(usuarios);
});

const create = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.createUsuario(req.body);
  return res.status(201).json(usuario);
});

const update = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.updateUsuario(req.params.id, req.body);
  return res.status(200).json(usuario);
});

const remove = asyncHandler(async (req, res) => {
  await usuarioService.deleteUsuario(req.params.id, req.auth.userId);
  return res.status(204).send();
});

module.exports = {
  list,
  create,
  update,
  remove,
};
