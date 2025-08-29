import { Container } from 'typedi';
import { LoaderInterface } from '../bootstrap';
import { config } from '../config';
import { logger } from '../core/logger';

export const configLoader: LoaderInterface = async (): Promise<void> => {
    Container.set('config', config);

    logger.debug(`Config loaded`, {
        area: 'loaders',
        subarea: 'config',
        action: 'loading'
    });

    return Promise.resolve();
};

