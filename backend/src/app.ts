import fastify, { FastifyInstance } from "fastify";
import { routes } from "./routes/index";
import { config } from "./config";
import { databasePlugin } from "./database/client";
import { authPlugin } from "./auth/client";

const app: FastifyInstance = fastify({
  logger: true,
});

app
  .register(databasePlugin, {
    dbHost: config.database.host,
    dbPort: config.database.port,
    dbUser: config.database.user,
    dbPassword: config.database.password,
    dbName: config.database.name,
  })
  .register(authPlugin, {
    database: app.database,
  })
  .after(() => {
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
