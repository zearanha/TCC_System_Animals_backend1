const { z } = require("zod");

const emptySchema = z.object({}).optional().default({});

const idParamsSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID valido."),
});

module.exports = {
  z,
  emptySchema,
  idParamsSchema,
};
