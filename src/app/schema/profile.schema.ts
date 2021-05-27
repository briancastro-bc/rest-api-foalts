export const profileSchema = {
    additionalProperties: false,
    properties: {
        picture: { type: 'string' },
        last_name: { type: 'string' },
        social_media: { type: 'object' },
        userId: { type: 'number' }
    },
    required: [ 'picture', 'last_name', 'userId' ],
    type: 'object',
};