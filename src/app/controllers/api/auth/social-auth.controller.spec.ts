// std
import { ok, strictEqual } from 'assert';

// 3p
import { Context, createController, getHttpMethod, getPath, isHttpResponseOK } from '@foal/core';

// App
import { SocialAuthController } from './social-auth.controller';

describe('SocialAuthController', () => {

  let controller: SocialAuthController;

  beforeEach(() => controller = createController(SocialAuthController));

  describe('has a "foo" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(SocialAuthController, 'foo'), 'GET');
      strictEqual(getPath(SocialAuthController, 'foo'), '/');
    });

    it('should return an HttpResponseOK.', () => {
      const ctx = new Context({});
      ok(isHttpResponseOK(controller.foo(ctx)));
    });

  });

});
