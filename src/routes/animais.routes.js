const { Router } = require("express");
const controller = require("../controllers/animal.controller");
const validate = require("../middlewares/validate.middleware");
const {
  createAnimalSchema,
  listAnimaisSchema,
  getAnimalByIdSchema,
} = require("../validations/animal.schema");

const router = Router();

router.post("/", validate(createAnimalSchema), controller.create);
router.get("/", validate(listAnimaisSchema), controller.list);
router.get("/:id", validate(getAnimalByIdSchema), controller.getById);

module.exports = router;
