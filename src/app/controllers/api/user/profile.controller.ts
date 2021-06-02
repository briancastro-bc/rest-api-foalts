import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseBadRequest, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidateHeader, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { JWTRequired } from '@foal/jwt';
import { RefreshJWT } from 'app/hooks';
import { RoleRequired } from 'app/hooks/role-required.hook';
import { getRepository } from 'typeorm';

import { Profile, User, UserRole } from '../../../entities';

import { profileSchema } from '../../../schema';

@JWTRequired()
@RefreshJWT()
//@RoleRequired(UserRole.USER)
@ApiUseTag('profile')
export class ProfileController {

  @Get('/')
  //@RoleRequired(UserRole.FOUNDER)
  @ApiOperationId('findProfiles')
  @ApiOperationSummary('Find profiles.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of profiles.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findProfiles(ctx: Context<User>): Promise<HttpResponseBadRequest | HttpResponseOK> {
    const profiles = await getRepository(Profile).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: { user: ctx.user.id },
    });

    if(!profiles) return new HttpResponseBadRequest({ message: 'Aún no tiene un perfil creado' });

    const user = await getRepository(User).find({
      id: ctx.user.id
    });

    let userData: object = {
      profiles,
      user
    }
    return new HttpResponseOK({ userData, message: `He-he. Te mostramos tu perfil de usuario` } );
  }

  @Get('/:profileId')
  //@RoleRequired(UserRole.FOUNDER)
  @ApiOperationId('findUserById')
  @ApiOperationSummary('Find a profile by ID.')
  @ApiResponse(404, { description: 'Profile not found.' })
  @ApiResponse(200, { description: 'Returns the profile.' })
  @ValidatePathParam('profileId', { type: 'number' })
  async findProfileById(ctx: Context) {
    const profile = await getRepository(Profile).findOne(ctx.request.params.profileId);

    if (!profile) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(profile);
  }

  @Post('/')
  //@RoleRequired(UserRole.USER)
  @ApiOperationId('createProfile')
  @ApiOperationSummary('Create a new profile.')
  @ApiResponse(400, { description: 'Invalid profile.' })
  @ApiResponse(201, { description: 'Profile successfully created. Returns the profile.' })
  @ValidateHeader('Authorization')
  @ValidateBody(profileSchema)
  async createProfile(ctx: Context<User>): Promise<HttpResponseBadRequest | HttpResponseCreated> {
    let profile = await Profile.findOne({
      picture: ctx.request.body.picture,
      last_name: ctx.request.body.last_name,
      user: ctx.user
    })

    if(profile) return new HttpResponseBadRequest({ message: 'Ya tiene un perfil de usuario creado' });

    profile = new Profile();

    try {
      profile.picture = ctx.request.body.picture;
      profile.last_name = ctx.request.body.last_name;
      //userProfile.social_media = ctx.request.body.social_media;
      profile.user = await User.getId(ctx.user);
      await profile.save();
    } catch (e: unknown) {
      return new HttpResponseBadRequest({ message: '¡Oh no! Lo sentimos, ocurrió un error' });
    }

    return new HttpResponseCreated({ profile, message: `Se han guardado los datos del perfil` });
  }

  @Patch('/:profileId')
  //@RoleRequired(UserRole.CREATOR, UserRole.FOUNDER)
  @ApiOperationId('modifyProfile')
  @ApiOperationSummary('Update/modify an existing profile.')
  @ApiResponse(400, { description: 'Invalid profile.' })
  @ApiResponse(404, { description: 'Profile not found.' })
  @ApiResponse(200, { description: 'Profile successfully updated. Returns the profile.' })
  @ValidatePathParam('profileId', { type: 'number' })
  @ValidateBody({ ...profileSchema, required: [] })
  async modifyProfile(ctx: Context) {
    const profile = await getRepository(Profile).findOne(ctx.request.params.profileId);

    if (!profile) {
      return new HttpResponseNotFound();
    }

    Object.assign(profile, ctx.request.body);

    await getRepository(Profile).save(profile);

    return new HttpResponseOK(profile);
  }

  @Put('/:profileId')
  //@RoleRequired(UserRole.CREATOR, UserRole.FOUNDER)
  @ApiOperationId('replaceProfile')
  @ApiOperationSummary('Update/replace an existing profile.')
  @ApiResponse(400, { description: 'Invalid profile.' })
  @ApiResponse(404, { description: 'Profile not found.' })
  @ApiResponse(200, { description: 'Profile successfully updated. Returns the profile.' })
  @ValidatePathParam('profileId', { type: 'number' })
  @ValidateBody(profileSchema)
  async replaceProfile(ctx: Context) {
    const profile = await getRepository(Profile).findOne(ctx.request.params.profileId);

    if (!profile) {
      return new HttpResponseNotFound();
    }

    Object.assign(profile, ctx.request.body);

    await getRepository(Profile).save(profile);

    return new HttpResponseOK(profile);
  }

  @Delete('/:profileId')
  //@RoleRequired(UserRole.FOUNDER)
  @ApiOperationId('deleteProfile')
  @ApiOperationSummary('Delete a profile.')
  @ApiResponse(404, { description: 'Profile not found.' })
  @ApiResponse(204, { description: 'Profile successfully deleted.' })
  @ValidatePathParam('profileId', { type: 'number' })
  async deleteProfile(ctx: Context) {
    const profile = await getRepository(Profile).findOne(ctx.request.params.profileId);

    if (!profile) {
      return new HttpResponseNotFound();
    }

    await getRepository(Profile).delete(ctx.request.params.profileId);

    return new HttpResponseNoContent();
  }
}
