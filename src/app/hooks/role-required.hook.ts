import { Context, Hook, HookDecorator, HttpResponseForbidden, HttpResponseInternalServerError, HttpResponseUnauthorized } from '@foal/core';
import { User, UserRole } from 'app/entities';

export function RoleRequired(role: UserRole, otherRole?: UserRole): HookDecorator {
  return Hook(async (ctx: Context<User>) => {
    try {
      if(!ctx.user.user_role.includes(role)) {
        return new HttpResponseForbidden({ message: 'No cumple con el rol requerido' });
      }
    } catch (e: unknown) {
      return new HttpResponseInternalServerError({ message: `Ha ocurrido un error inesperado con el servidor. ${e}` });
    }
  });
}
