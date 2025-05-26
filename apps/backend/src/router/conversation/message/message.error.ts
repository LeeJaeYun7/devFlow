import { UserError } from '../../../util/base.error';

export class MessageQuotaNotEnoughError extends UserError {
  constructor() {
    super('User message quota is not enough');
  }
}
