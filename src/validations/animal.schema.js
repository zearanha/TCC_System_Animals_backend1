const { z, emptySchema, idParamsSchema } = require("./common.schema");

const createAnimalSchema = z.object({
  body: z.object({
    nome: z.string().min(2, "Nome do animal deve ter no minimo 2 caracteres."),
    especie: z.string().min(2),
    raca: z.string().max(80).optional(),
    porte: z.string().max(30).optional(),
    sexo: z.string().max(20).optional(),
    cor: z.string().max(50).optional(),
    dataNascimento: z.coerce.date().optional(),
    proprietarioId: z.string().uuid("proprietarioId deve ser UUID valido."),
  }),
  params: emptySchema,
  query: emptySchema,
});

const listAnimaisSchema = z.object({
  body: emptySchema,
  params: emptySchema,
  query: emptySchema,
});

const getAnimalByIdSchema = z.object({
  body: emptySchema,
  params: idParamsSchema,
  query: emptySchema,
});

module.exports = {
  createAnimalSchema,
  listAnimaisSchema,
  getAnimalByIdSchema,
};
