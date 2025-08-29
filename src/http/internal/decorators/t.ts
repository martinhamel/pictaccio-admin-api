import { Action, createParamDecorator } from '@loufa/routing-controllers';
import { Container } from 'typedi';
import { getFixedT } from '../../../loaders/i18next';
import { ConfigSchema } from '../../../core/config_schema';

const config: ConfigSchema = Container.get<ConfigSchema>('config');

export const T = createParamDecorator({
    required: true,
    value: async (action: Action) => getFixedT(action.request.session.lang || config.locales.fallbacks.lang)
});
