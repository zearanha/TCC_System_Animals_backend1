const { Router } = require("express");
const controller = require("../controllers/identificacao.controller");
const validate = require("../middlewares/validate.middleware");
const { createIdentificacaoSchema } = require("../validations/identificacao.schema");

const router = Router();

router.post("/", validate(createIdentificacaoSchema), controller.create);

module.exports = router;
