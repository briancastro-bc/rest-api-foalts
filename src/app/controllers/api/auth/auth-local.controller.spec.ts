// std
import { ok, strictEqual } from 'assert';

// 3p
import { Context, createController, getHttpMethod, getPath, isHttpResponseOK } from '@foal/core';

// App
import { AuthLocalController } from './auth-local.controller';

describe('AuthLocalController', () => {

  let controller: AuthLocalController;

  beforeEach(() => controller = createController(AuthLocalController));

  describe('has a "foo" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(AuthLocalController, 'foo'), 'GET');
      strictEqual(getPath(AuthLocalController, 'foo'), '/');
    });

    it('should return an HttpResponseOK.', () => {
      const ctx = new Context({});
      ok(isHttpResponseOK(controller.foo(ctx)));
    });

  });

});
