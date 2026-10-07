import { FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { config } from "../config";

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
  mode: "dynamic",
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Overload API",
      description: 'The main and only API behind "overload"',
      version: "0.0.1",
    },
    externalDocs: {
      url: "https://github.com/fredrikj31/overload",
      description: "Find more info here",
    },
    servers: [
      {
        url: `http://127.0.0.1:${config.api.port}/api`,
        description: "Local running API",
      },
    ],
    components: {
      securitySchemes: {
        session: {
          name: "better-auth.session_token",
          in: "cookie",
          type: "apiKey",
          description: "Authentication with your better-auth session cookie",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
};
