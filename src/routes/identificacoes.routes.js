const { Router } = require("express");
const controller = require("../controllers/identificacao.controller");
const validate = require("../middlewares/validate.middleware");
const { requireAuth, requireRoles } = require("../middlewares/auth.middleware");
const { USER_ROLES } = require("../constants/roles");
const { createIdentificacaoSchema } = require("../validations/identificacao.schema");

const router = Router();

router.use(requireAuth, requireRoles(USER_ROLES.ADMIN));

router.post("/", validate(createIdentificacaoSchema), controller.create);

module.exports = router;
