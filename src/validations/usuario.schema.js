const { z, emptySchema, idParamsSchema } = require("./common.schema");

const userRoleSchema = z.enum(["ADMIN", "AGENTE", "PROPRIETARIO"]);

const createUsuarioSchema = z.object({
  body: z.object({
    nome: z.string().min(3, "Nome deve ter no minimo 3 caracteres."),
    email: z.string().email("E-mail invalido."),
    senha: z.string().min(6, "Senha deve ter no minimo 6 caracteres."),
    perfil: userRoleSchema,
    ativo: z.boolean().optional(),
    agenteId: z.string().uuid().nullable().optional(),
    proprietarioId: z.string().uuid().nullable().optional(),
  }),
  params: emptySchema,
  query: emptySchema,
});

const updateUsuarioBodySchema = z
  .object({
    nome: z.string().min(3).optional(),
    email: z.string().email().optional(),
    senha: z.string().min(6).optional(),
    perfil: userRoleSchema.optional(),
    ativo: z.boolean().optional(),
    agenteId: z.string().uuid().nullable().optional(),
    proprietarioId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizacao.",
  });

const updateUsuarioSchema = z.object({
  body: updateUsuarioBodySchema,
  params: idParamsSchema,
  query: emptySchema,
});

const listUsuariosSchema = z.object({
  body: emptySchema,
  params: emptySchema,
  query: emptySchema,
});

const deleteUsuarioSchema = z.object({
  body: emptySchema,
  params: idParamsSchema,
  query: emptySchema,
});

module.exports = {
  createUsuarioSchema,
  updateUsuarioSchema,
  listUsuariosSchema,
  deleteUsuarioSchema,
};
