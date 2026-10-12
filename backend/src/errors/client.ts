import { BaseError, BaseErrorOptions } from ".";

export class BadRequestError extends BaseError {
  constructor({ code, message }: Omit<BaseErrorOptions, "statusCode">) {
    const _message = message || "Bad Request";
    const _code = code || "bad-request";

    super({ statusCode: 400, code: _code, message: _message });
  }
}

export class UnauthorizedError extends BaseError {
  constructor({ code, message }: Omit<BaseErrorOptions, "statusCode">) {
    const _message = message || "Unauthorized";
    const _code = code || "unauthorized";

    super({ statusCode: 401, code: _code, message: _message });
  }
}

export class ForbiddenError extends BaseError {
  constructor({ code, message }: Omit<BaseErrorOptions, "statusCode">) {
    const _message = message || "Forbidden";
    const _code = code || "forbidden";

    super({ statusCode: 403, code: _code, message: _message });
  }
}

export class NotFoundError extends BaseError {
  constructor({ code, message }: Omit<BaseErrorOptions, "statusCode">) {
    const _message = message || "Not Found";
    const _code = code || "not-found";

    super({ statusCode: 404, code: _code, message: _message });
  }
}

export class ConflictError extends BaseError {
  constructor({ code, message }: Omit<BaseErrorOptions, "statusCode">) {
    const _message = message || "Conflict";
    const _code = code || "conflict";

    super({ statusCode: 409, code: _code, message: _message });
  }
}
