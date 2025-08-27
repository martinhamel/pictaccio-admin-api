import { Action, createParamDecorator } from '@loufa/routing-controllers';
import { Language, Languages } from '@pictaccio/shared/src/types/language';
import { Container } from 'typedi';
import { getFixedT } from '@pictaccio/admin-api/loaders/i18next';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';

const config: ConfigSchema = Container.get<ConfigSchema>('config');

export function T(lang?: Language): (object: any, method: string, index: number) => void {
    if (!Languages.includes(lang)) {
        lang = undefined;
    }

    return createParamDecorator({
        required: true,
        value: async (action: Action) => getFixedT(lang ?? action.request.session.lang ?? config.locales.fallbacks.lang)
    });
}
