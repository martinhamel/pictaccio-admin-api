//import 'module-alias/register.js';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { bootstrap, onExit } from './bootstrap';
import { logger } from './core/logger';

import { configLoader } from './loaders/config';
import { foldersLoader } from './loaders/folders';
import { expressLoader } from './loaders/express';
import { i18nextLoader } from './loaders/i18next';
import { handlebarsLoader } from './loaders/handlebars';
import { publicLoader } from './loaders/public';
import { servicesLoader } from './loaders/services';
import { schedulerLoader } from './loaders/scheduler';
import { serviceInitLoader } from './loaders/service_init';
import { typediLoader } from './loaders/typedi';
import { typeormLoader } from './loaders/typeorm';
import { expressInternalLoader } from './loaders/express_internal';
import { firstBootLoader } from './loaders/first_boot';

function exitHandler(kind: string, exitCode: number | string, error: Error): void {
    switch (kind) {
        case 'SIGINT':
        case 'SIGUSR1':
        case 'SIGUSR2':
            logger.info(`Application received ${exitCode}`, { area: 'MAIN', action: 'exiting', reason: exitCode });
            process.exit(0);
            break;

        case 'uncaught-exception':
            logger.error('Uncaught exception, application closing.', {
                ...error,
                area: 'MAIN',
                action: 'exiting',
                reason: 'uncaught-exception',
                message: error?.message,
                stack: error?.stack,
                error
            });
            break;

        default:
            logger.info(`Application closing with exit code ${exitCode}`, {
                area: 'MAIN',
                action: 'exiting',
                reason: exitCode
            });
    }
}

logger.info(`Pictaccio starting ...`, { area: 'MAIN' });
onExit(exitHandler);

/*
 * Load the app's modules
 */
bootstrap([
    typediLoader,
    configLoader,
    foldersLoader,
    i18nextLoader,
    schedulerLoader,
    servicesLoader,
    expressLoader,
    expressInternalLoader,
    serviceInitLoader,
    publicLoader,
    handlebarsLoader,
    typeormLoader,
    firstBootLoader
])
    .then(() => {
        logger.info('... Application started successfully', { area: 'MAIN' });
    })
    .catch((error) => {
        logger.error('An error occurred', { area: 'MAIN', message: error.message, stack: error.stack });
    });
