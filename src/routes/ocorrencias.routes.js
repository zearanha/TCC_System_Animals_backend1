const { Router } = require("express");
const controller = require("../controllers/ocorrencia.controller");
const validate = require("../middlewares/validate.middleware");
const {
  createOcorrenciaSchema,
  listOcorrenciasSchema,
  getOcorrenciaByIdSchema,
} = require("../validations/ocorrencia.schema");

const router = Router();

router.post("/", validate(createOcorrenciaSchema), controller.create);
router.get("/", validate(listOcorrenciasSchema), controller.list);
router.get("/:id", validate(getOcorrenciaByIdSchema), controller.getById);

module.exports = router;
