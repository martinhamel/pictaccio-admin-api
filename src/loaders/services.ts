import { readDir } from '@loufa/loufairy-server';
import path from 'path';
import { Container } from 'typedi';
import { LoaderInterface } from '../bootstrap';
import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';

const SERVICE_FILTER = /.*_service\.js$/;

export const servicesLoader: LoaderInterface = async (): Promise<void> => {
    const config = Container.get('config') as ConfigSchema;

    logger.info(`Loading services...`, {
        area: 'loaders',
        subarea: 'services',
        action: 'loading'
    });

    for await (const file of readDir(config.env.dirs.services, SERVICE_FILTER)) {
        logger.info(`Loading service ${file.name}`, {
            area: 'loaders',
            subarea: 'services',
            action: 'loading',
            service_name: path.basename(file.name)
        });
        await import(path.join(config.env.dirs.services, file.name));
    }
};
