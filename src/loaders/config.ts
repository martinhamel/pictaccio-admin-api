import { Container } from 'typedi';
import { LoaderInterface } from '@pictaccio/admin-api/bootstrap';
import { config } from '@pictaccio/admin-api/config';
import { logger } from '@pictaccio/admin-api/core/logger';

export const configLoader: LoaderInterface = async (): Promise<void> => {
    Container.set('config', config);

    logger.debug(`Config loaded`, {
        area: 'loaders',
        subarea: 'config',
        action: 'loading'
    });

    return Promise.resolve();
};

