const express = require("express");
const routes = require("./routes");
const { logInfo } = require("./config/logger");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const elapsedMs = Date.now() - startedAt;
    logInfo(`${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsedMs}ms`);
  });

  next();
});

app.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "sistema-municipal-animais-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
