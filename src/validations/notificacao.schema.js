const { z, emptySchema } = require("./common.schema");

const createNotificacaoSchema = z.object({
  body: z.object({
    ocorrenciaId: z.string().uuid("ocorrenciaId deve ser UUID valido."),
    mensagem: z.string().min(5).max(500).optional(),
    canal: z.enum(["SMS", "EMAIL", "WHATSAPP"]).optional(),
    status: z.enum(["PENDENTE", "ENVIADA", "FALHA"]).optional(),
    dataEnvio: z.coerce.date().optional(),
  }),
  params: emptySchema,
  query: emptySchema,
});

const listNotificacoesSchema = z.object({
  body: emptySchema,
  params: emptySchema,
  query: emptySchema,
});

module.exports = {
  createNotificacaoSchema,
  listNotificacoesSchema,
};
