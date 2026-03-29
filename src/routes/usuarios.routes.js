const { Router } = require("express");
const controller = require("../controllers/usuario.controller");
const validate = require("../middlewares/validate.middleware");
const { requireAuth, requireRoles } = require("../middlewares/auth.middleware");
const { USER_ROLES } = require("../constants/roles");
const {
  createUsuarioSchema,
  updateUsuarioSchema,
  listUsuariosSchema,
  deleteUsuarioSchema,
} = require("../validations/usuario.schema");

const router = Router();

router.use(requireAuth, requireRoles(USER_ROLES.ADMIN));

router.get("/", validate(listUsuariosSchema), controller.list);
router.post("/", validate(createUsuarioSchema), controller.create);
router.put("/:id", validate(updateUsuarioSchema), controller.update);
router.delete("/:id", validate(deleteUsuarioSchema), controller.remove);

module.exports = router;
