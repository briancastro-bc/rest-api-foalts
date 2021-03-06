import { promisify } from 'util';
import { Context, dependency, Get, HttpResponseRedirect, Store, Session, UseSessions, HttpResponseOK, createSession, HttpResponseNoContent } from '@foal/core';
import { GoogleProvider } from '@foal/social';
import { getSecretOrPrivateKey, setAuthCookie } from '@foal/jwt';
import { sign } from 'jsonwebtoken';

import { User, Profile } from '../../../entities';

interface GoogleUser {
  email: string;
  name?: string;
  picture?: string;
}

export class SocialAuthController {

  @dependency
  google: GoogleProvider;

  @Get('/signin/google')
  redirectToGoogle(){
    return this.google.redirect({ scopes: ['email'] });
  }

  @Get('/signin/google/callback')
  async handleGoogleRedirection(ctx: Context<User, Session>) {
    const { userInfo } = await this.google.getUserInfo<GoogleUser>(ctx);
    const profile = new Profile();

    if(!userInfo.email){
      throw new Error('Google should have returned an email address.')
    }

    let user = await User.findOne({
      email: userInfo.email
    });

    if(!user){
      user = new User();
      user.email = userInfo.email;
      user.name = userInfo.name ?? 'Unknown';
      for(let i = 0; i <= User.length; i++){
        user.nickname = `User${[i]}`;
        user.phone_number = `your phone number${[i]}`;
      }
      profile.picture = userInfo.picture ?? 'not-picture';
      await user.save();
      await profile.save();
    }

    const token: string = sign(
      {
        id: user.id,
        email: user.email
      },
      getSecretOrPrivateKey(),
      { expiresIn: '1h', subject: user.id.toString() }
    );

    const response = new HttpResponseNoContent();
    await setAuthCookie(response, token);
    response.setHeader('Authorization', token);
    return new HttpResponseOK({
      response, user, profile, token, message: `¡Ual-la ${user.nickname}! Te conectaste con Google. ¡Bienvenido!`
    });
  }

}
