import { controller, IAppController, Get, Hook, UseSessions, Context, HttpResponseRedirect, HttpResponseNoContent, HttpResponseOK, Options } from '@foal/core';
import { fetchUser } from '@foal/typeorm';
import { createConnection } from 'typeorm';

import { AuthLocalController, SocialAuthController } from './controllers';

/**
 * @import trae entidades de la aplicación.
 */
import { User } from './entities';

@UseSessions({
  cookie: true,
  required: false,
  csrf: false,
  user: fetchUser(User)
})
@Hook((ctx: Context) => response => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Origin', ctx.request.get('Origin') || '*');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
})
export class AppController implements IAppController {
  subControllers = [
    controller('/api/auth', AuthLocalController),
    controller('/api/auth-social', SocialAuthController)
  ];

  async init(): Promise<void> {
    await createConnection();
  }

  @Get('/')
  index(ctx: Context): HttpResponseNoContent | Promise<HttpResponseOK> {
    return new HttpResponseNoContent();
  }

  @Options('*')
  options(ctx: Context): any {
    const response = new HttpResponseNoContent();
    response.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
}
