const asyncHandler = require("../utils/asyncHandler");
const animalService = require("../services/animal.service");

const create = asyncHandler(async (req, res) => {
  const animal = await animalService.createAnimal(req.body);
  return res.status(201).json(animal);
});

const list = asyncHandler(async (req, res) => {
  const animais = await animalService.listAnimais(req.auth);
  return res.status(200).json(animais);
});

const getById = asyncHandler(async (req, res) => {
  const animal = await animalService.getAnimalById(req.params.id, req.auth);
  return res.status(200).json(animal);
});

const getByCodigo = asyncHandler(async (req, res) => {
  const animal = await animalService.getAnimalByCodigo(req.params.codigo, req.auth);
  return res.status(200).json(animal);
});

const update = asyncHandler(async (req, res) => {
  const animal = await animalService.updateAnimal(req.params.id, req.body);
  return res.status(200).json(animal);
});

const remove = asyncHandler(async (req, res) => {
  await animalService.deleteAnimal(req.params.id);
  return res.status(204).send();
});

module.exports = {
  create,
  list,
  getById,
  getByCodigo,
  update,
  remove,
};
