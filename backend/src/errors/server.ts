import { BaseError, BaseErrorOptions } from ".";

export class InternalServerError extends BaseError {
  constructor({ code, message }: Omit<BaseErrorOptions, "statusCode">) {
    const _message = message || "Internal Server Error";
    const _code = code || "internal-server-error";

    super({ statusCode: 500, code: _code, message: _message });
  }
}
