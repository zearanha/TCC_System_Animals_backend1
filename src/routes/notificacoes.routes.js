const { Router } = require("express");
const controller = require("../controllers/notificacao.controller");
const validate = require("../middlewares/validate.middleware");
const { requireAuth, requireRoles } = require("../middlewares/auth.middleware");
const { USER_ROLES } = require("../constants/roles");
const {
  createNotificacaoSchema,
  listNotificacoesSchema,
} = require("../validations/notificacao.schema");

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireRoles(USER_ROLES.ADMIN),
  validate(createNotificacaoSchema),
  controller.create
);
router.get(
  "/",
  requireRoles(USER_ROLES.ADMIN, USER_ROLES.PROPRIETARIO),
  validate(listNotificacoesSchema),
  controller.list
);

module.exports = router;
