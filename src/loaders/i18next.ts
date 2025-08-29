import { load } from 'js-yaml';
import i18next, { getFixedT as i18nextGetFixedT, TFunction } from 'i18next';
import Backend from 'i18next-fs-backend';
import { Container } from 'typedi';
import { LoaderInterface } from '../bootstrap';
import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';
import { Language } from '../types/language';

const loaded: Language[] = [];

export async function getFixedT(lang: Language): Promise<TFunction> {
    if (!loaded.includes(lang)) {
        await i18next.reloadResources(lang);
        loaded.push(lang);
    }

    return i18nextGetFixedT(lang);
}

export const i18nextLoader: LoaderInterface = async (): Promise<void> => {
    const config = Container.get<ConfigSchema>('config');

    i18next.on('failedLoading', (lang, namespace, key) => {
        logger.info('Translation loading failed', {
            area: 'loaders',
            subarea: 'i18next',
            action: 'localizing',
            lang,
            namespace,
            key
        });
    });
    i18next.on('missingKey', (lang, namespace, key) => {
        logger.info('Missing key detected', {
            area: 'loaders',
            subarea: 'i18next',
            action: 'localizing',
            lang,
            namespace,
            key
        });
    });

    await i18next
        .use(Backend)
        .init({
            debug: false,
            load: 'languageOnly',
            lng: config.locales.fallbacks.lang,
            supportedLngs: config.locales.supported,
            defaultNS: 'common',
            ns: [
                'common',
                'mail',
                'messages',
                'notifications',
                'order',
                'report',
            ],
            saveMissing: true,
            saveMissingTo: 'all',
            backend: {
                loadPath: config.env.dirs.locales,
                parse: async function (data) {
                    return await load(data);
                }
            }
        });
    loaded.push(config.locales.fallbacks.lang);

    logger.info('Initialized i18next', {
        area: 'loaders',
        subarea: 'i18next',
        action: 'loading'
    });
};
