const { z, emptySchema } = require("./common.schema");

const createIdentificacaoSchema = z.object({
  body: z.object({
    animalId: z.string().uuid("animalId deve ser UUID valido."),
  }),
  params: emptySchema,
  query: emptySchema,
});

module.exports = {
  createIdentificacaoSchema,
};
