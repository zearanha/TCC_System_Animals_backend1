const { Router } = require("express");
const controller = require("../controllers/ocorrencia.controller");
const validate = require("../middlewares/validate.middleware");
const { requireAuth, requireRoles } = require("../middlewares/auth.middleware");
const { USER_ROLES } = require("../constants/roles");
const {
  createOcorrenciaSchema,
  listOcorrenciasSchema,
  getOcorrenciaByIdSchema,
  updateOcorrenciaStatusSchema,
} = require("../validations/ocorrencia.schema");

const router = Router();

router.use(requireAuth, requireRoles(USER_ROLES.ADMIN, USER_ROLES.AGENTE));

router.post("/", validate(createOcorrenciaSchema), controller.create);
router.get("/", validate(listOcorrenciasSchema), controller.list);
router.get("/:id", validate(getOcorrenciaByIdSchema), controller.getById);
router.put("/:id/status", validate(updateOcorrenciaStatusSchema), controller.updateStatus);
router.delete(
  "/:id",
  requireRoles(USER_ROLES.ADMIN),
  validate(getOcorrenciaByIdSchema),
  controller.remove
);

module.exports = router;
