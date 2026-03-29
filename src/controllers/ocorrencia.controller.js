const asyncHandler = require("../utils/asyncHandler");
const ocorrenciaService = require("../services/ocorrencia.service");

const create = asyncHandler(async (req, res) => {
  const ocorrencia = await ocorrenciaService.createOcorrencia(req.body);
  return res.status(201).json(ocorrencia);
});

const list = asyncHandler(async (_req, res) => {
  const ocorrencias = await ocorrenciaService.listOcorrencias();
  return res.status(200).json(ocorrencias);
});

const getById = asyncHandler(async (req, res) => {
  const ocorrencia = await ocorrenciaService.getOcorrenciaById(req.params.id);
  return res.status(200).json(ocorrencia);
});

module.exports = {
  create,
  list,
  getById,
};
