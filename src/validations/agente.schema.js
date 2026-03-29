const { z, emptySchema } = require("./common.schema");

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

module.exports = {
  createAgenteSchema,
  listAgentesSchema,
};
