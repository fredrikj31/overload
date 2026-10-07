import { FastifyApiReferenceOptions } from "@scalar/fastify-api-reference";

export const scalarConfig: FastifyApiReferenceOptions = {
  routePrefix: "/docs",
  configuration: {
    mcp: {
      disabled: true,
    },
    agent: {
      disabled: true,
    },
    hideClientButton: true,
    sources: [
      { url: "/api/docs/json", title: "API" }, // API endpoints
      { url: "/api/auth/open-api/generate-schema", title: "Auth" }, // Better Auth schema generation endpoint
    ],
  },
};
