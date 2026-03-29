const { Router } = require("express");
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  loginSchema,
  registerProprietarioSchema,
  meSchema,
} = require("../validations/auth.schema");

const router = Router();

router.post("/login", validate(loginSchema), controller.login);
router.post(
  "/registrar-proprietario",
  validate(registerProprietarioSchema),
  controller.registerProprietario
);
router.get("/me", requireAuth, validate(meSchema), controller.me);
router.post("/logout", requireAuth, validate(meSchema), controller.logout);

module.exports = router;
