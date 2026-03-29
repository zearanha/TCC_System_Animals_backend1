const { Router } = require("express");
const proprietariosRoutes = require("./proprietarios.routes");
const animaisRoutes = require("./animais.routes");
const identificacoesRoutes = require("./identificacoes.routes");
const agentesRoutes = require("./agentes.routes");
const ocorrenciasRoutes = require("./ocorrencias.routes");
const notificacoesRoutes = require("./notificacoes.routes");

const router = Router();

router.use("/proprietarios", proprietariosRoutes);
router.use("/animais", animaisRoutes);
router.use("/identificacoes", identificacoesRoutes);
router.use("/agentes", agentesRoutes);
router.use("/ocorrencias", ocorrenciasRoutes);
router.use("/notificacoes", notificacoesRoutes);

module.exports = router;
