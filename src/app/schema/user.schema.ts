import { UserRole } from '../entities';

/**
 * @const userSchema determina el esquema de datos que posee el usuario.
 * @required los datos que deberán ser pasados obligatoriamente.
 */

export const userSchema = {
    additionalProperties: false,
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
        phone_number: { type: 'string' },
        nickname: { type: 'string' },
        name: { type: 'string' },
        last_name: { type: 'string' },
        user_role: { type: 'array', items: { type: 'string' }, uniqueItems: true, default: [UserRole.USER] }
    },
    required: ['email', 'password', 'phone_number', 'nickname'],
    type: 'object'
}