import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Category: a
    .model({
      name: a.string().required(),
      color: a.string().required(),
      icon: a.string(),
      todos: a.hasMany('Todo', 'categoryId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  
  Todo: a
    .model({
      content: a.string().required(),
      done: a.boolean().default(false),
      archived: a.boolean().default(false),
      scheduledTime: a.datetime(),
      isRepeating: a.boolean().default(false),
      repeatPattern: a.string(), // 'daily', 'weekly', 'monthly'
      categoryId: a.id(),
      category: a.belongsTo('Category', 'categoryId'),
      priority: a.enum(['low', 'medium', 'high']),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});