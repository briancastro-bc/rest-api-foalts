import { controller, IAppController, Get, Hook, UseSessions, Context, HttpResponseRedirect, HttpResponseNoContent, HttpResponseOK, Options, dependency } from '@foal/core';
import { JWTOptional } from '@foal/jwt';
import { fetchUser } from '@foal/typeorm';
import { createConnection } from 'typeorm';

import { Mail } from './services';

import { AuthLocalController, SocialAuthController, NotificationController, ProfileController } from './controllers';

/**
 * @import entidades de la aplicación.
 */
import { User } from './entities';

@JWTOptional({
  cookie: true,
  csrf: false,
  user: fetchUser(User)
})
@Hook((ctx: Context) => response => {
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  response.setHeader('Access-Control-Allow-Origin', ctx.request.get('Origin') || 'http://localhost:4200');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
})
export class AppController implements IAppController {
  subControllers = [
    controller('/api/auth', AuthLocalController),
    controller('/api/auth-social', SocialAuthController),
    controller('/api/notification', NotificationController),
    controller('/api/userProfile', ProfileController)
  ];

  @dependency
  mailService: Mail;

  async init(): Promise<void> {
    await createConnection();
  }

  @Options('*')
  options(ctx: Context): HttpResponseNoContent {
    const response = new HttpResponseNoContent();
    response.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
}
