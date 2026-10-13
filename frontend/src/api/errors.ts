import { z } from "zod";

export const ApiErrorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
});

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
