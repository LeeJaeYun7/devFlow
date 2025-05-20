import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CustomRequestContext } from './custom_request_context.type';
import { UserError } from '../../util/base.error';

@Injectable()
export class CustomRequestContextService {
  private readonly storage = new AsyncLocalStorage<CustomRequestContext>();

  public run(context: CustomRequestContext, callback: (...args: any[]) => any) {
    this.storage.run(context, callback);
  }

  public get<T extends keyof CustomRequestContext>(key: T): CustomRequestContext[T] {
    const store = this.storage.getStore();
    const data = store?.[key];

    if (!data) {
      throw new UserError('User not found');
    }

    return data;
  }

  public getAll(): CustomRequestContext | undefined {
    return this.storage.getStore();
  }
}
