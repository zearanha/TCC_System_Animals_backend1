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

const updateAnimalBodySchema = z
  .object({
    nome: z.string().min(2).optional(),
    especie: z.string().min(2).optional(),
    raca: z.string().max(80).optional(),
    porte: z.string().max(30).optional(),
    sexo: z.string().max(20).optional(),
    cor: z.string().max(50).optional(),
    dataNascimento: z.coerce.date().optional(),
    proprietarioId: z.string().uuid("proprietarioId deve ser UUID valido.").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizacao.",
  });

const updateAnimalSchema = z.object({
  body: updateAnimalBodySchema,
  params: idParamsSchema,
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

const getAnimalByCodigoSchema = z.object({
  body: emptySchema,
  params: z.object({
    codigo: z
      .string()
      .regex(/^[A-Z]{2}\d{4}$/i, "codigo deve seguir o padrao LL1234."),
  }),
  query: emptySchema,
});

const animalImageParamsSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID valido."),
});

const uploadAnimalImagesSchema = z.object({
  body: emptySchema,
  params: animalImageParamsSchema,
  query: emptySchema,
});

const deleteAnimalImageSchema = z.object({
  body: emptySchema,
  params: animalImageParamsSchema.extend({
    imagemId: z.string().uuid("imagemId deve ser UUID valido."),
  }),
  query: emptySchema,
});

module.exports = {
  createAnimalSchema,
  listAnimaisSchema,
  getAnimalByIdSchema,
  getAnimalByCodigoSchema,
  updateAnimalSchema,
  uploadAnimalImagesSchema,
  deleteAnimalImageSchema,
};
