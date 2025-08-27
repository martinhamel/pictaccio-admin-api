import { Action, createParamDecorator } from '@loufa/routing-controllers';
import { Container } from 'typedi';
import { getFixedT } from '@pictaccio/admin-api/loaders/i18next';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';

const config: ConfigSchema = Container.get<ConfigSchema>('config');

export const T = createParamDecorator({
    required: true,
    value: async (action: Action) => getFixedT(action.request.session.lang || config.locales.fallbacks.lang)
});
