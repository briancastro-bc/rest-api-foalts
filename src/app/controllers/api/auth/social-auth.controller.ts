import { promisify } from 'util';
import { Context, dependency, Get, HttpResponseRedirect, Store, Session, UseSessions, HttpResponseOK, createSession } from '@foal/core';
import { GoogleProvider } from '@foal/social';
import { getSecretOrPrivateKey, setAuthCookie } from '@foal/jwt';
import { sign } from 'jsonwebtoken';

import { User } from '../../../entities';

export class SocialAuthController {

  @dependency
  google: GoogleProvider;

  @dependency
  store: Store

  @Get('/signin/google')
  redirectToGoogle(){
    return this.google.redirect({ scopes: ['email'] });
  }

  @Get('/signin/google/callback')
  @UseSessions({
    cookie: true,
    csrf: false
  })
  async handleGoogleRedirection(ctx: Context<User, Session>) {
    const { userInfo } = await this.google.getUserInfo<{ email: string }>(ctx);

    if(!userInfo.email){
      throw new Error('Google should have returned an email address.')
    }

    let user = await User.findOne({
      email: userInfo.email
    });

    if(!user){
      user = new User();
      user.email = userInfo.email;
      for(let i = 0; i <= User.length; i++){
        user.nickname = `User${[i]}`;
        user.phone_number = `your phone number${[i]}`;
      }
      await user.save();
    }

    ctx.session = await createSession(this.store);
    ctx.session.setUser(user);
    ctx.session.set('success', `¡Hola! Te haz autenticado con Google`);
    return new HttpResponseOK({ 
      user: ctx.user, session: ctx.session, token: ctx.session.getToken(), message: ctx.session.get('success')
    });
  }

}
