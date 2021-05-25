import { Context, Hook, HookDecorator, HttpResponseUnauthorized, Session } from '@foal/core';

export function UserInSession(): HookDecorator {
  return Hook(async (ctx: Context, services) => {
    if(ctx.user) {
      return new HttpResponseUnauthorized({ message: "The user is logged in" })
    }
  });
}
