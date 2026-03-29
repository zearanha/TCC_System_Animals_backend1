const asyncHandler = require("../utils/asyncHandler");
const animalService = require("../services/animal.service");

const create = asyncHandler(async (req, res) => {
  const animal = await animalService.createAnimal(req.body);
  return res.status(201).json(animal);
});

const list = asyncHandler(async (_req, res) => {
  const animais = await animalService.listAnimais();
  return res.status(200).json(animais);
});

const getById = asyncHandler(async (req, res) => {
  const animal = await animalService.getAnimalById(req.params.id);
  return res.status(200).json(animal);
});

module.exports = {
  create,
  list,
  getById,
};
