import { UserError } from '../../../util/base.error';

export class LlmError extends UserError {
  constructor(message: string) {
    super(message);
  }
}

export class LlmResponseFailedError extends LlmError {
  constructor(message: string) {
    super(message);
  }
}
