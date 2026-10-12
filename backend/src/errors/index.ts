export interface BaseErrorOptions {
  statusCode: number;
  code: string;
  message: string;
}

export class BaseError {
  public statusCode: number;
  public code: string;
  public message: string;

  constructor({ statusCode, code, message }: BaseErrorOptions) {
    this.statusCode = statusCode;
    this.code = code;
    this.message = message;
  }

  toJSON = () => {
    return {
      code: this.code,
      message: this.message,
    };
  };
}
