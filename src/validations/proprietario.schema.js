const { z, emptySchema, idParamsSchema } = require("./common.schema");

const createProprietarioSchema = z.object({
  body: z.object({
    nome: z.string().min(3, "Nome deve ter no minimo 3 caracteres."),
    cpf: z.string().min(11, "CPF invalido."),
    telefone: z.string().min(8).max(20).optional(),
    email: z.string().email("E-mail invalido.").optional(),
    endereco: z.string().max(255).optional(),
  }),
  params: emptySchema,
  query: emptySchema,
});

const updateProprietarioBodySchema = z
  .object({
    nome: z.string().min(3).optional(),
    cpf: z.string().min(11).optional(),
    telefone: z.string().min(8).max(20).optional(),
    email: z.string().email().optional(),
    endereco: z.string().max(255).optional(),
  });

const updateProprietarioSchema = z.object({
  body: updateProprietarioBodySchema.optional().default({}),
  params: idParamsSchema,
  query: emptySchema,
});

const getProprietarioByIdSchema = z.object({
  body: emptySchema,
  params: idParamsSchema,
  query: emptySchema,
});

const listProprietariosSchema = z.object({
  body: emptySchema,
  params: emptySchema,
  query: emptySchema,
});

module.exports = {
  createProprietarioSchema,
  updateProprietarioSchema,
  getProprietarioByIdSchema,
  listProprietariosSchema,
};
