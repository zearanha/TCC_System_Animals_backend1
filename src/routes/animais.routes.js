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
  uploadAnimalImagesSchema,
  deleteAnimalImageSchema,
} = require("../validations/animal.schema");
const {
  uploadIdentificacaoImagens,
} = require("../middlewares/upload.middleware");

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
router.post(
  "/:id/imagens-identificacao",
  requireRoles(USER_ROLES.ADMIN),
  validate(uploadAnimalImagesSchema),
  uploadIdentificacaoImagens.array("imagens", 5),
  controller.uploadIdentificacaoImagens
);
router.put(
  "/:id/imagens-identificacao",
  requireRoles(USER_ROLES.ADMIN),
  validate(uploadAnimalImagesSchema),
  uploadIdentificacaoImagens.array("imagens", 5),
  controller.uploadIdentificacaoImagens
);
router.patch(
  "/:id/imagens-identificacao",
  requireRoles(USER_ROLES.ADMIN),
  validate(uploadAnimalImagesSchema),
  uploadIdentificacaoImagens.array("imagens", 5),
  controller.uploadIdentificacaoImagens
);
router.delete(
  "/:id/imagens-identificacao/:imagemId",
  requireRoles(USER_ROLES.ADMIN),
  validate(deleteAnimalImageSchema),
  controller.deleteIdentificacaoImagem
);
router.delete(
  "/:id",
  requireRoles(USER_ROLES.ADMIN),
  validate(getAnimalByIdSchema),
  controller.remove
);

module.exports = router;
