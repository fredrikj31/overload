import { z } from "zod";

/** JSON body of every error response, i.e. what `BaseError.toJSON()` returns. */
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export interface BaseErrorOptions {
  statusCode: number;
  code: string;
  message: string;
}

export class BaseError extends Error {
  public statusCode: number;
  public code: string;

  constructor({ statusCode, code, message }: BaseErrorOptions) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
  }

  toJSON = () => {
    return {
      code: this.code,
      message: this.message,
    };
  };
}
