import { Hook, HookDecorator, HttpResponse, isHttpResponseServerError } from '@foal/core';
import { getSecretOrPrivateKey } from '@foal/jwt';
import { sign } from 'jsonwebtoken';

export function RefreshJWT(): HookDecorator {
  return Hook(ctx => {
    if (!ctx.user) {
      return;
    }

    return (response: HttpResponse) => {
      if (isHttpResponseServerError(response)) {
        return;
      }

      const newToken: string = sign(
        {
          id: ctx.user.id,
          email: ctx.user.email,
          // sub: ctx.user.subject,
        },
        getSecretOrPrivateKey(),
        { expiresIn: '1h' }
      );
      response.setHeader('Authorization', newToken);
    };
  });
}
