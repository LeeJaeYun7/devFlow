import { HttpStatus } from '@nestjs/common';

export class UserError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = HttpStatus.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class SystemError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
  }
}
