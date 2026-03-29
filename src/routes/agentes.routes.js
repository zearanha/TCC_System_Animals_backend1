const { Router } = require("express");
const controller = require("../controllers/agente.controller");
const validate = require("../middlewares/validate.middleware");
const {
  createAgenteSchema,
  listAgentesSchema,
} = require("../validations/agente.schema");

const router = Router();

router.post("/", validate(createAgenteSchema), controller.create);
router.get("/", validate(listAgentesSchema), controller.list);

module.exports = router;
