import 'module-alias/register.js';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { bootstrap, onExit } from '@pictaccio/admin-api/bootstrap';
import { logger } from '@pictaccio/admin-api/core/logger';

import { configLoader } from '@pictaccio/admin-api/loaders/config';
import { foldersLoader } from '@pictaccio/admin-api/loaders/folders';
import { expressLoader } from '@pictaccio/admin-api/loaders/express';
import { i18nextLoader } from '@pictaccio/admin-api/loaders/i18next';
import { handlebarsLoader } from '@pictaccio/admin-api/loaders/handlebars';
import { publicLoader } from '@pictaccio/admin-api/loaders/public';
import { servicesLoader } from '@pictaccio/admin-api/loaders/services';
import { schedulerLoader } from '@pictaccio/admin-api/loaders/scheduler';
import { serviceInitLoader } from '@pictaccio/admin-api/loaders/service_init';
import { typediLoader } from '@pictaccio/admin-api/loaders/typedi';
import { typeormLoader } from '@pictaccio/admin-api/loaders/typeorm';
import { expressInternalLoader } from '@pictaccio/admin-api/loaders/express_internal';
import { firstBootLoader } from '@pictaccio/admin-api/loaders/first_boot';

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
