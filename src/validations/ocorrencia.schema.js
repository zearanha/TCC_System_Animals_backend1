const { z, emptySchema, idParamsSchema } = require("./common.schema");

const createOcorrenciaSchema = z.object({
  body: z.object({
    codigoIdentificacao: z
      .string()
      .regex(
        /^[A-Z]{2}\d{4}$/i,
        "codigoIdentificacao deve seguir o padrao LL1234."
      )
      .transform((value) => value.toUpperCase()),
    agenteId: z.string().uuid("agenteId deve ser UUID valido."),
    local: z.string().min(3).max(255),
    descricao: z.string().min(5).max(500),
    dataOcorrencia: z.coerce.date().optional(),
    status: z.enum(["ABERTA", "RESOLVIDA", "CANCELADA"]).optional(),
  }),
  params: emptySchema,
  query: emptySchema,
});

const listOcorrenciasSchema = z.object({
  body: emptySchema,
  params: emptySchema,
  query: emptySchema,
});

const getOcorrenciaByIdSchema = z.object({
  body: emptySchema,
  params: idParamsSchema,
  query: emptySchema,
});

module.exports = {
  createOcorrenciaSchema,
  listOcorrenciasSchema,
  getOcorrenciaByIdSchema,
};
