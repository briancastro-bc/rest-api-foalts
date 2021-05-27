// std
import { notStrictEqual, ok, strictEqual } from 'assert';

// 3p
import {
  Context, createController, getHttpMethod, getPath,
  isHttpResponseCreated, isHttpResponseNoContent,
  isHttpResponseNotFound, isHttpResponseOK
} from '@foal/core';
import { createConnection, getConnection, getRepository } from 'typeorm';

// App
import { Profile } from '../../../entities';
import { ProfileController } from './profile.controller';

describe('ProfileController', () => {

  let controller: ProfileController;
  let profile1: Profile;
  let profile2: Profile;

  before(() => createConnection());

  after(() => getConnection().close());

  beforeEach(async () => {
    controller = createController(ProfileController);

    const repository = getRepository(Profile);
    await repository.clear();
    [ profile1, profile2 ] = await repository.save([
      {
        text: 'Profile 1'
      },
      {
        text: 'Profile 2'
      },
    ]);
  });

  describe('has a "findProfiles" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(ProfileController, 'findProfiles'), 'GET');
      strictEqual(getPath(ProfileController, 'findProfiles'), undefined);
    });

    it('should return an HttpResponseOK object with the profile list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findProfiles(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of profiles.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(profile => profile.text === profile1.text));
      ok(response.body.find(profile => profile.text === profile2.text));
    });

    it('should support pagination', async () => {
      const profile3 = await getRepository(Profile).save({
        text: 'Profile 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findProfiles(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(profile => profile.id === profile1.id));
      ok(response.body.find(profile => profile.id === profile2.id));
      ok(!response.body.find(profile => profile.id === profile3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findProfiles(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(profile => profile.id === profile1.id));
      ok(response.body.find(profile => profile.id === profile2.id));
      ok(response.body.find(profile => profile.id === profile3.id));
    });

  });

  describe('has a "findProfileById" method that', () => {

    it('should handle requests at GET /:profileId.', () => {
      strictEqual(getHttpMethod(ProfileController, 'findProfileById'), 'GET');
      strictEqual(getPath(ProfileController, 'findProfileById'), '/:profileId');
    });

    it('should return an HttpResponseOK object if the profile was found.', async () => {
      const ctx = new Context({
        params: {
          profileId: profile2.id
        }
      });
      const response = await controller.findProfileById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, profile2.id);
      strictEqual(response.body.text, profile2.text);
    });

    it('should return an HttpResponseNotFound object if the profile was not found.', async () => {
      const ctx = new Context({
        params: {
          profileId: -1
        }
      });
      const response = await controller.findProfileById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createProfile" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(ProfileController, 'createProfile'), 'POST');
      strictEqual(getPath(ProfileController, 'createProfile'), undefined);
    });

    it('should create the profile in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Profile 3',
        }
      });
      const response = await controller.createProfile(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const profile = await getRepository(Profile).findOne({ text: 'Profile 3' });

      if (!profile) {
        throw new Error('No profile 3 was found in the database.');
      }

      strictEqual(profile.text, 'Profile 3');

      strictEqual(response.body.id, profile.id);
      strictEqual(response.body.text, profile.text);
    });

  });

  describe('has a "modifyProfile" method that', () => {

    it('should handle requests at PATCH /:profileId.', () => {
      strictEqual(getHttpMethod(ProfileController, 'modifyProfile'), 'PATCH');
      strictEqual(getPath(ProfileController, 'modifyProfile'), '/:profileId');
    });

    it('should update the profile in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Profile 2 (version 2)',
        },
        params: {
          profileId: profile2.id
        }
      });
      const response = await controller.modifyProfile(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const profile = await getRepository(Profile).findOne(profile2.id);

      if (!profile) {
        throw new Error();
      }

      strictEqual(profile.text, 'Profile 2 (version 2)');

      strictEqual(response.body.id, profile.id);
      strictEqual(response.body.text, profile.text);
    });

    it('should not update the other profiles.', async () => {
      const ctx = new Context({
        body: {
          text: 'Profile 2 (version 2)',
        },
        params: {
          profileId: profile2.id
        }
      });
      await controller.modifyProfile(ctx);

      const profile = await getRepository(Profile).findOne(profile1.id);

      if (!profile) {
        throw new Error();
      }

      notStrictEqual(profile.text, 'Profile 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          profileId: -1
        }
      });
      const response = await controller.modifyProfile(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceProfile" method that', () => {

    it('should handle requests at PUT /:profileId.', () => {
      strictEqual(getHttpMethod(ProfileController, 'replaceProfile'), 'PUT');
      strictEqual(getPath(ProfileController, 'replaceProfile'), '/:profileId');
    });

    it('should update the profile in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Profile 2 (version 2)',
        },
        params: {
          profileId: profile2.id
        }
      });
      const response = await controller.replaceProfile(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const profile = await getRepository(Profile).findOne(profile2.id);

      if (!profile) {
        throw new Error();
      }

      strictEqual(profile.text, 'Profile 2 (version 2)');

      strictEqual(response.body.id, profile.id);
      strictEqual(response.body.text, profile.text);
    });

    it('should not update the other profiles.', async () => {
      const ctx = new Context({
        body: {
          text: 'Profile 2 (version 2)',
        },
        params: {
          profileId: profile2.id
        }
      });
      await controller.replaceProfile(ctx);

      const profile = await getRepository(Profile).findOne(profile1.id);

      if (!profile) {
        throw new Error();
      }

      notStrictEqual(profile.text, 'Profile 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          profileId: -1
        }
      });
      const response = await controller.replaceProfile(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteProfile" method that', () => {

    it('should handle requests at DELETE /:profileId.', () => {
      strictEqual(getHttpMethod(ProfileController, 'deleteProfile'), 'DELETE');
      strictEqual(getPath(ProfileController, 'deleteProfile'), '/:profileId');
    });

    it('should delete the profile and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          profileId: profile2.id
        }
      });
      const response = await controller.deleteProfile(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const profile = await getRepository(Profile).findOne(profile2.id);

      strictEqual(profile, undefined);
    });

    it('should not delete the other profiles.', async () => {
      const ctx = new Context({
        params: {
          profileId: profile2.id
        }
      });
      const response = await controller.deleteProfile(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const profile = await getRepository(Profile).findOne(profile1.id);

      notStrictEqual(profile, undefined);
    });

    it('should return an HttpResponseNotFound if the profile was not found.', async () => {
      const ctx = new Context({
        params: {
          profileId: -1
        }
      });
      const response = await controller.deleteProfile(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
