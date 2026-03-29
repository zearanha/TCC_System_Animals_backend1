const { Router } = require("express");
const controller = require("../controllers/notificacao.controller");
const validate = require("../middlewares/validate.middleware");
const {
  createNotificacaoSchema,
  listNotificacoesSchema,
} = require("../validations/notificacao.schema");

const router = Router();

router.post("/", validate(createNotificacaoSchema), controller.create);
router.get("/", validate(listNotificacoesSchema), controller.list);

module.exports = router;
