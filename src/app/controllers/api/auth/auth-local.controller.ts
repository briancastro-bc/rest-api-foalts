import { Context, createSession, dependency, Get, HttpResponseBadRequest, HttpResponseNoContent, HttpResponseOK, HttpResponseUnauthorized, Post, Session, Store, UseSessions, ValidateBody, ValidateHeader, verifyPassword } from '@foal/core';
import { isCommon } from '@foal/password';
import { getSecretOrPrivateKey } from '@foal/jwt';
import { sign } from 'jsonwebtoken';
//Importing modules.
import { User } from '../../../entities';
//Importing schema.
import { userSchema } from '../../../schema';
//Importing hooks.
import { UserInSession } from '../../../hooks';

export class AuthLocalController {
  @dependency
  store: Store
  
  /**
   * @param ctx define las propiedades que puede recibir un método
   * @type {User} es el objeto que tiene las propiedades de la base de datos.
   * @type {Session} es el objeto que tiene las propiedades de la session.
   * @returns el objeto usuario y la session.
   */
  
  @Post('/signup')
  @UserInSession()
  /*@ValidateHeader()*/
  @ValidateBody(userSchema)
  async signup(ctx: Context<User, Session>): Promise<HttpResponseUnauthorized | HttpResponseOK> {
    if(await isCommon(ctx.request.body.password)) {
      ctx.session.set('error', 'La contraseña no cumple con los requisitos ó es muy común', { flash: true });
      return new HttpResponseUnauthorized({ message: ctx.session.get('error') });
    }

    let user = await User.findOne({
      email: ctx.request.body.email,
      nickname: ctx.request.body.nickname,
      phone_number: ctx.request.body.phone_number
    });

    if(user){
      ctx.session.set('error', 'El email, apodo o número de telefono ya existe en la base de datos', { flash: true });
      return new HttpResponseUnauthorized({ message: ctx.session.get('error') });
    }

    user = new User();
    user.email = ctx.request.body.email;
    await user.setPassword(ctx.request.body.password);
    user.phone_number = ctx.request.body.phone_number;
    user.nickname = ctx.request.body.nickname;
    user.name = ctx.request.body.name;
    await user.save();
    
    ctx.session = await createSession(this.store);
    ctx.session.setUser(user);
    ctx.session.set('success', `El usuario ${user.nickname} ha sido registrado`, { flash: true })
    return new HttpResponseOK({
      user, session: ctx.session, token: ctx.session.getToken()
    });
  }

  @Post('/signin')
  @UserInSession()
  /*@ValidateHeader()*/
  @ValidateBody({
    additionalProperties: false,
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    },
    required: [ 'email', 'password' ],
    type: 'object'
  })
  async signin(ctx: Context<User, Session>): Promise<HttpResponseUnauthorized| HttpResponseOK> {
    const user = await User.findOne({
      email: ctx.request.body.email
    })

    if(!user) {
      ctx.session.set('error', `El email o la contraseña son incorrectos`, { flash: true });
      return new HttpResponseUnauthorized({ message: ctx.session.get('error') });
    }

    if(!await verifyPassword(ctx.request.body.password, user.password)) {
      ctx.session.set('error', `El email o la contraseña son incorrectos`, { flash: true });
      return new HttpResponseUnauthorized({ message: ctx.session.get('error') });
    }

    ctx.session = await createSession(this.store);
    ctx.session.setUser(user);
    ctx.session.set('success', `¡Hola! El usuario ${user.nickname} ha iniciado sesión`, { flash: true });
    return new HttpResponseOK({
      user, session: ctx.session, token: ctx.session.getToken()
    });
  }

  @Post('/logout')
  async logout(ctx: Context<any, Session>) {
    if(ctx.session) {
      await ctx.session.destroy();
    }

    return new HttpResponseNoContent();
  }
}

