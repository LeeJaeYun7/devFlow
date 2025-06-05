import { UserError } from '../../../util/base.error';

export class ChatQuotaNotEnoughError extends UserError {
  constructor() {
    super('Chat quota is not enough');
  }
}
