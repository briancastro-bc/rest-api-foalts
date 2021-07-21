import { Context, createSession, dependency, Get, HttpResponseBadRequest, HttpResponseNoContent, HttpResponseOK, HttpResponseUnauthorized, Post, Session, Store, UseSessions, ValidateBody, ValidateHeader, verifyPassword } from '@foal/core';
import { isCommon } from '@foal/password';
import { getSecretOrPrivateKey, removeAuthCookie, setAuthCookie } from '@foal/jwt';
import { sign, verify } from 'jsonwebtoken';
//Importing modules.
import { User } from '../../../entities';
//Importing schema.
import { userSchema } from '../../../schema';

import { Mail } from '../../../services';

export class AuthLocalController {

	@dependency
	store: Store;

	@dependency
	mailService: Mail;

	/**
	 * @param ctx define las propiedades que puede recibir un método
	 * @type {User} es el objeto que tiene las propiedades del usuario en la base de datos.
	 * @returns un usuario y un token.
	 */

	@Post('/signup')
	@ValidateHeader('Authorization')
	@ValidateBody(userSchema)
	async signup(ctx: Context<User>): Promise<HttpResponseUnauthorized | HttpResponseOK> {
		if (await isCommon(ctx.request.body.password)) {
			return new HttpResponseUnauthorized({ message: `La contraseña no cumple con los requisitos ó es muy común` });
		}

		let user = await User.findOne({
			email: ctx.request.body.email,
			nickname: ctx.request.body.nickname,
			phone_number: ctx.request.body.phone_number
		});

		if (user) {
			return new HttpResponseUnauthorized({ message: `El email, apodo o número de telefono ya existe en la base de datos` });
		}

		user = new User();
		user.email = ctx.request.body.email;
		await user.setPassword(ctx.request.body.password);
		user.phone_number = ctx.request.body.phone_number;
		user.nickname = ctx.request.body.nickname;
		user.name = ctx.request.body.name;
		await user.save();

		const token: string = sign(
			{
				id: user.id,
				email: user.email
			},
			getSecretOrPrivateKey(),
			{ expiresIn: '1h' }
		);

		this.mailService.setMessage(user, 'He-he! Registro completado.');
		this.mailService.sendEmail()
			.catch(err => console.log(err));

		const response = new HttpResponseNoContent();
		await setAuthCookie(response, token);
		response.setHeader('Authorization', token);
		return new HttpResponseOK({
			response, user, token, message: `¡Uh, hola ${user.nickname}! Te haz registrado.`
		});
	}

	@Post('/signin')
	@ValidateHeader('Authorization')
	@ValidateBody({
		additionalProperties: false,
		properties: {
			email: { type: 'string', format: 'email' },
			password: { type: 'string' }
		},
		required: ['email', 'password'],
		type: 'object'
	})
	async signin(ctx: Context<User>): Promise<HttpResponseUnauthorized | HttpResponseOK> {
		const user = await User.findOne({
			email: ctx.request.body.email
		})

		if (!user) {
			return new HttpResponseUnauthorized({ message: `El email o la contraseña son incorrectos` });
		}

		if (!await verifyPassword(ctx.request.body.password, user.password)) {
			return new HttpResponseUnauthorized({ message: `El email o la contraseña son incorrectos` });
		}

		const token: string = sign(
			{
				id: user.id,
				email: user.email
			},
			getSecretOrPrivateKey(),
			{ expiresIn: '1h' }
		);

		const response = new HttpResponseNoContent();
		await setAuthCookie(response, token);
		response.setHeader('Authorization', token);
		return new HttpResponseOK({ response, user, token, message: `Je-je... ¡Gracias por volver a ingresar ${user.nickname}!` });
	}

	@Post('/logout')
	@ValidateHeader('Authorization')
	async logout(ctx: Context) {
		const response = new HttpResponseNoContent()
		await removeAuthCookie(response);
		return response;
	}
}