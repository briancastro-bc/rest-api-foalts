import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { JWTRequired } from '@foal/jwt';
import { getRepository } from 'typeorm';

import { Notification } from '../../../entities';
import { RefreshJWT } from '../../../hooks';
import { notificationSchema } from '../../../schema';

@JWTRequired()
@RefreshJWT()
@ApiUseTag('notification')
export class NotificationController {

  @Get('/')
  @ApiOperationId('findNotifications')
  @ApiOperationSummary('Find notifications.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of notifications.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findNotifications(ctx: Context) {
    const notifications = await getRepository(Notification).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {},
    });
    return new HttpResponseOK(notifications);
  }

  @Get('/:notificationId')
  @ApiOperationId('findNotificationById')
  @ApiOperationSummary('Find a notification by ID.')
  @ApiResponse(404, { description: 'Notification not found.' })
  @ApiResponse(200, { description: 'Returns the notification.' })
  @ValidatePathParam('notificationId', { type: 'number' })
  async findNotificationById(ctx: Context) {
    const notification = await getRepository(Notification).findOne(ctx.request.params.notificationId);

    if (!notification) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(notification);
  }

  @Post()
  @ApiOperationId('createNotification')
  @ApiOperationSummary('Create a new notification.')
  @ApiResponse(400, { description: 'Invalid notification.' })
  @ApiResponse(201, { description: 'Notification successfully created. Returns the notification.' })
  @ValidateBody(notificationSchema)
  async createNotification(ctx: Context) {
    const notification = await getRepository(Notification).save(ctx.request.body);
    return new HttpResponseCreated(notification);
  }

  @Patch('/:notificationId')
  @ApiOperationId('modifyNotification')
  @ApiOperationSummary('Update/modify an existing notification.')
  @ApiResponse(400, { description: 'Invalid notification.' })
  @ApiResponse(404, { description: 'Notification not found.' })
  @ApiResponse(200, { description: 'Notification successfully updated. Returns the notification.' })
  @ValidatePathParam('notificationId', { type: 'number' })
  @ValidateBody({ ...notificationSchema, required: [] })
  async modifyNotification(ctx: Context) {
    const notification = await getRepository(Notification).findOne(ctx.request.params.notificationId);

    if (!notification) {
      return new HttpResponseNotFound();
    }

    Object.assign(notification, ctx.request.body);

    await getRepository(Notification).save(notification);

    return new HttpResponseOK(notification);
  }

  @Put('/:notificationId')
  @ApiOperationId('replaceNotification')
  @ApiOperationSummary('Update/replace an existing notification.')
  @ApiResponse(400, { description: 'Invalid notification.' })
  @ApiResponse(404, { description: 'Notification not found.' })
  @ApiResponse(200, { description: 'Notification successfully updated. Returns the notification.' })
  @ValidatePathParam('notificationId', { type: 'number' })
  @ValidateBody(notificationSchema)
  async replaceNotification(ctx: Context) {
    const notification = await getRepository(Notification).findOne(ctx.request.params.notificationId);

    if (!notification) {
      return new HttpResponseNotFound();
    }

    Object.assign(notification, ctx.request.body);

    await getRepository(Notification).save(notification);

    return new HttpResponseOK(notification);
  }

  @Delete('/:notificationId')
  @ApiOperationId('deleteNotification')
  @ApiOperationSummary('Delete a notification.')
  @ApiResponse(404, { description: 'Notification not found.' })
  @ApiResponse(204, { description: 'Notification successfully deleted.' })
  @ValidatePathParam('notificationId', { type: 'number' })
  async deleteNotification(ctx: Context) {
    const notification = await getRepository(Notification).findOne(ctx.request.params.notificationId);

    if (!notification) {
      return new HttpResponseNotFound();
    }

    await getRepository(Notification).delete(ctx.request.params.notificationId);

    return new HttpResponseNoContent();
  }

}
