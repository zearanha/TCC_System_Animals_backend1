const { z, emptySchema } = require("./common.schema");

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("E-mail invalido."),
    senha: z.string().min(6, "Senha deve ter no minimo 6 caracteres."),
  }),
  params: emptySchema,
  query: emptySchema,
});

const registerProprietarioSchema = z.object({
  body: z.object({
    nome: z.string().min(3, "Nome deve ter no minimo 3 caracteres."),
    cpf: z.string().min(11, "CPF invalido."),
    telefone: z.string().min(8).max(20),
    email: z.string().email("E-mail invalido."),
    endereco: z.string().min(3).max(255),
    senha: z.string().min(6, "Senha deve ter no minimo 6 caracteres."),
  }),
  params: emptySchema,
  query: emptySchema,
});

const meSchema = z.object({
  body: emptySchema,
  params: emptySchema,
  query: emptySchema,
});

module.exports = {
  loginSchema,
  registerProprietarioSchema,
  meSchema,
};
