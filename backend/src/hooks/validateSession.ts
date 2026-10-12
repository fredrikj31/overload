import { FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { UnauthorizedError } from "../errors/client";
import { InternalServerError } from "../errors/server";
import { logger } from "../logger";

export const validateSession = () => {
  return async (request: FastifyRequest) => {
    const session = await request.server.auth.api
      .getSession({ headers: fromNodeHeaders(request.headers) })
      .catch((error) => {
        logger.error(error, "Error while validating session");
        throw new InternalServerError({
          code: "unknown-error-validating-session",
          message: "Unknown error while trying to validate session",
        });
      });

    if (!session) {
      throw new UnauthorizedError({
        code: "session-not-found",
        message: "No valid session was found in the request",
      });
    }

    request.userId = session.user.id;
  };
};
