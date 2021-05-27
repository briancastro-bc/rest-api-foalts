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
import { Notification } from '../../../entities';
import { NotificationController } from './notification.controller';

describe('NotificationController', () => {

  let controller: NotificationController;
  let notification1: Notification;
  let notification2: Notification;

  before(() => createConnection());

  after(() => getConnection().close());

  beforeEach(async () => {
    controller = createController(NotificationController);

    const repository = getRepository(Notification);
    await repository.clear();
    [ notification1, notification2 ] = await repository.save([
      {
        text: 'Notification 1'
      },
      {
        text: 'Notification 2'
      },
    ]);
  });

  describe('has a "findNotifications" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(NotificationController, 'findNotifications'), 'GET');
      strictEqual(getPath(NotificationController, 'findNotifications'), undefined);
    });

    it('should return an HttpResponseOK object with the notification list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findNotifications(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of notifications.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(notification => notification.text === notification1.text));
      ok(response.body.find(notification => notification.text === notification2.text));
    });

    it('should support pagination', async () => {
      const notification3 = await getRepository(Notification).save({
        text: 'Notification 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findNotifications(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(notification => notification.id === notification1.id));
      ok(response.body.find(notification => notification.id === notification2.id));
      ok(!response.body.find(notification => notification.id === notification3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findNotifications(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(notification => notification.id === notification1.id));
      ok(response.body.find(notification => notification.id === notification2.id));
      ok(response.body.find(notification => notification.id === notification3.id));
    });

  });

  describe('has a "findNotificationById" method that', () => {

    it('should handle requests at GET /:notificationId.', () => {
      strictEqual(getHttpMethod(NotificationController, 'findNotificationById'), 'GET');
      strictEqual(getPath(NotificationController, 'findNotificationById'), '/:notificationId');
    });

    it('should return an HttpResponseOK object if the notification was found.', async () => {
      const ctx = new Context({
        params: {
          notificationId: notification2.id
        }
      });
      const response = await controller.findNotificationById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, notification2.id);
      strictEqual(response.body.text, notification2.text);
    });

    it('should return an HttpResponseNotFound object if the notification was not found.', async () => {
      const ctx = new Context({
        params: {
          notificationId: -1
        }
      });
      const response = await controller.findNotificationById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createNotification" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(NotificationController, 'createNotification'), 'POST');
      strictEqual(getPath(NotificationController, 'createNotification'), undefined);
    });

    it('should create the notification in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Notification 3',
        }
      });
      const response = await controller.createNotification(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const notification = await getRepository(Notification).findOne({ text: 'Notification 3' });

      if (!notification) {
        throw new Error('No notification 3 was found in the database.');
      }

      strictEqual(notification.text, 'Notification 3');

      strictEqual(response.body.id, notification.id);
      strictEqual(response.body.text, notification.text);
    });

  });

  describe('has a "modifyNotification" method that', () => {

    it('should handle requests at PATCH /:notificationId.', () => {
      strictEqual(getHttpMethod(NotificationController, 'modifyNotification'), 'PATCH');
      strictEqual(getPath(NotificationController, 'modifyNotification'), '/:notificationId');
    });

    it('should update the notification in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Notification 2 (version 2)',
        },
        params: {
          notificationId: notification2.id
        }
      });
      const response = await controller.modifyNotification(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const notification = await getRepository(Notification).findOne(notification2.id);

      if (!notification) {
        throw new Error();
      }

      strictEqual(notification.text, 'Notification 2 (version 2)');

      strictEqual(response.body.id, notification.id);
      strictEqual(response.body.text, notification.text);
    });

    it('should not update the other notifications.', async () => {
      const ctx = new Context({
        body: {
          text: 'Notification 2 (version 2)',
        },
        params: {
          notificationId: notification2.id
        }
      });
      await controller.modifyNotification(ctx);

      const notification = await getRepository(Notification).findOne(notification1.id);

      if (!notification) {
        throw new Error();
      }

      notStrictEqual(notification.text, 'Notification 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          notificationId: -1
        }
      });
      const response = await controller.modifyNotification(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceNotification" method that', () => {

    it('should handle requests at PUT /:notificationId.', () => {
      strictEqual(getHttpMethod(NotificationController, 'replaceNotification'), 'PUT');
      strictEqual(getPath(NotificationController, 'replaceNotification'), '/:notificationId');
    });

    it('should update the notification in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Notification 2 (version 2)',
        },
        params: {
          notificationId: notification2.id
        }
      });
      const response = await controller.replaceNotification(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const notification = await getRepository(Notification).findOne(notification2.id);

      if (!notification) {
        throw new Error();
      }

      strictEqual(notification.text, 'Notification 2 (version 2)');

      strictEqual(response.body.id, notification.id);
      strictEqual(response.body.text, notification.text);
    });

    it('should not update the other notifications.', async () => {
      const ctx = new Context({
        body: {
          text: 'Notification 2 (version 2)',
        },
        params: {
          notificationId: notification2.id
        }
      });
      await controller.replaceNotification(ctx);

      const notification = await getRepository(Notification).findOne(notification1.id);

      if (!notification) {
        throw new Error();
      }

      notStrictEqual(notification.text, 'Notification 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          notificationId: -1
        }
      });
      const response = await controller.replaceNotification(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteNotification" method that', () => {

    it('should handle requests at DELETE /:notificationId.', () => {
      strictEqual(getHttpMethod(NotificationController, 'deleteNotification'), 'DELETE');
      strictEqual(getPath(NotificationController, 'deleteNotification'), '/:notificationId');
    });

    it('should delete the notification and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          notificationId: notification2.id
        }
      });
      const response = await controller.deleteNotification(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const notification = await getRepository(Notification).findOne(notification2.id);

      strictEqual(notification, undefined);
    });

    it('should not delete the other notifications.', async () => {
      const ctx = new Context({
        params: {
          notificationId: notification2.id
        }
      });
      const response = await controller.deleteNotification(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const notification = await getRepository(Notification).findOne(notification1.id);

      notStrictEqual(notification, undefined);
    });

    it('should return an HttpResponseNotFound if the notification was not found.', async () => {
      const ctx = new Context({
        params: {
          notificationId: -1
        }
      });
      const response = await controller.deleteNotification(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
