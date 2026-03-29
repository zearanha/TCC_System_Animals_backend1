function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next({
        name: "ZodValidationError",
        statusCode: 400,
        errors: result.error.flatten(),
      });
    }

    req.body = result.data.body;
    req.params = result.data.params;
    req.query = result.data.query;
    return next();
  };
}

module.exports = validate;
