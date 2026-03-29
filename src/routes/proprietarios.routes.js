const { Router } = require("express");
const controller = require("../controllers/proprietario.controller");
const validate = require("../middlewares/validate.middleware");
const { requireAuth, requireRoles } = require("../middlewares/auth.middleware");
const { USER_ROLES } = require("../constants/roles");
const {
  createProprietarioSchema,
  updateProprietarioSchema,
  getProprietarioByIdSchema,
  listProprietariosSchema,
} = require("../validations/proprietario.schema");

const router = Router();

router.use(requireAuth, requireRoles(USER_ROLES.ADMIN));

router.post("/", validate(createProprietarioSchema), controller.create);
router.get("/", validate(listProprietariosSchema), controller.list);
router.get("/:id", validate(getProprietarioByIdSchema), controller.getById);
router.put("/:id", validate(updateProprietarioSchema), controller.update);
router.delete("/:id", validate(getProprietarioByIdSchema), controller.remove);

module.exports = router;
