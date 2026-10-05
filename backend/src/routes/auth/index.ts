import { FastifyPluginAsync } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { logger } from "../../logger";

export const authRoutes: FastifyPluginAsync = async (instance) => {
  instance.route({
    method: ["GET", "POST"],
    url: "/auth/*",
    schema: {
      hide: true,
    },
    async handler(request, reply) {
      try {
        // Construct request URL
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = fromNodeHeaders(request.headers);
        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });
        // Process authentication request
        const response = await instance.auth.handler(req);
        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        return reply.send(response.body ? await response.text() : null);
      } catch (error) {
        logger.error(error, "Authentication Error");
        return reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });
};
