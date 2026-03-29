const { Router } = require("express");
const controller = require("../controllers/agente.controller");
const validate = require("../middlewares/validate.middleware");
const { requireAuth, requireRoles } = require("../middlewares/auth.middleware");
const { USER_ROLES } = require("../constants/roles");
const {
  createAgenteSchema,
  listAgentesSchema,
  getAgenteByIdSchema,
  updateAgenteSchema,
} = require("../validations/agente.schema");

const router = Router();

router.use(requireAuth, requireRoles(USER_ROLES.ADMIN));

router.post("/", validate(createAgenteSchema), controller.create);
router.get("/", validate(listAgentesSchema), controller.list);
router.put("/:id", validate(updateAgenteSchema), controller.update);
router.delete("/:id", validate(getAgenteByIdSchema), controller.remove);

module.exports = router;
