import { Context, Hook, HookDecorator, HttpResponseNoContent, HttpResponseUnauthorized } from '@foal/core';

export function SessionNotRequired(): HookDecorator {
  return Hook(async (ctx: Context, services) => {
    if(ctx.session) {
      return new HttpResponseUnauthorized({ message: "Sessions is started" });
    }
    return new HttpResponseNoContent();
  });
}
