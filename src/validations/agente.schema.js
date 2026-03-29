const { z, emptySchema, idParamsSchema } = require("./common.schema");

const createAgenteSchema = z.object({
  body: z.object({
    nome: z.string().min(3, "Nome deve ter no minimo 3 caracteres."),
    matricula: z.string().min(3).max(30),
    telefone: z.string().min(8).max(20).optional(),
    email: z.string().email().optional(),
  }),
  params: emptySchema,
  query: emptySchema,
});

const listAgentesSchema = z.object({
  body: emptySchema,
  params: emptySchema,
  query: emptySchema,
});

const updateAgenteBodySchema = z
  .object({
    nome: z.string().min(3).optional(),
    matricula: z.string().min(3).max(30).optional(),
    telefone: z.string().min(8).max(20).optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizacao.",
  });

const getAgenteByIdSchema = z.object({
  body: emptySchema,
  params: idParamsSchema,
  query: emptySchema,
});

const updateAgenteSchema = z.object({
  body: updateAgenteBodySchema,
  params: idParamsSchema,
  query: emptySchema,
});

module.exports = {
  createAgenteSchema,
  listAgentesSchema,
  getAgenteByIdSchema,
  updateAgenteSchema,
};
