import fastify, { FastifyInstance } from "fastify";
import { routes } from "./routes";
import { config } from "./config";

const app: FastifyInstance = fastify({
  logger: true,
});

app.after(() => {
  app.register(routes, { prefix: "/api" });
});

app.listen(
  { host: config.api.host, port: config.api.port },
  (err: Error | null) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  },
);

process.on("SIGINT", () => {
  app.log.warn(`SIGINT signal detected, terminating service`);
  app.close();
});

process.on("SIGTERM", () => {
  app.log.warn(`SIGTERM signal detected, terminating service`);
  app.close();
});
