const { Router } = require("express");
const controller = require("../controllers/animal.controller");
const validate = require("../middlewares/validate.middleware");
const { requireAuth, requireRoles } = require("../middlewares/auth.middleware");
const { USER_ROLES } = require("../constants/roles");
const {
  createAnimalSchema,
  listAnimaisSchema,
  getAnimalByIdSchema,
  getAnimalByCodigoSchema,
  updateAnimalSchema,
} = require("../validations/animal.schema");

const router = Router();

router.use(requireAuth);

router.post("/", requireRoles(USER_ROLES.ADMIN), validate(createAnimalSchema), controller.create);
router.get(
  "/",
  requireRoles(USER_ROLES.ADMIN, USER_ROLES.PROPRIETARIO),
  validate(listAnimaisSchema),
  controller.list
);
router.get(
  "/codigo/:codigo",
  requireRoles(USER_ROLES.ADMIN, USER_ROLES.AGENTE),
  validate(getAnimalByCodigoSchema),
  controller.getByCodigo
);
router.get(
  "/:id",
  requireRoles(USER_ROLES.ADMIN, USER_ROLES.PROPRIETARIO),
  validate(getAnimalByIdSchema),
  controller.getById
);
router.put(
  "/:id",
  requireRoles(USER_ROLES.ADMIN),
  validate(updateAnimalSchema),
  controller.update
);
router.delete(
  "/:id",
  requireRoles(USER_ROLES.ADMIN),
  validate(getAnimalByIdSchema),
  controller.remove
);

module.exports = router;
