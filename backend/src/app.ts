import fastify, { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import { routes } from "./routes/index";
import { config } from "./config";
import { databasePlugin } from "./database/client";
import { authPlugin } from "./auth/client";
import { swaggerConfig } from "./plugins/swagger";
import { scalarConfig } from "./plugins/scalar";

const app: FastifyInstance = fastify({
  logger: true,
});

app
  .register(fastifySwagger, swaggerConfig)
  .register(import("@scalar/fastify-api-reference"), scalarConfig)
  .register(databasePlugin, {
    dbHost: config.database.host,
    dbPort: config.database.port,
    dbUser: config.database.user,
    dbPassword: config.database.password,
    dbName: config.database.name,
  })
  .register(fastifyCors, {
    origin: config.website.baseUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    maxAge: 86400,
    credentials: true,
  })
  .register(fastifyCookie, {
    parseOptions: {
      path: "/",
      sameSite: true,
    },
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
